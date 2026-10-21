import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

// Axe cannot calculate text contrast over photos, gradients or pseudo elements.
// Hide text paint without moving it, then sample the rendered background across
// each text range. The minimum across the whole range is a conservative check.
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
const selectors = [
 '.hero-title .line-mask > span', '.hero-tagline', '.hero-description',
  '.hero-buttons .action', '.comparison-labels > span', '.scroll-hint', '.visual-note',
  '.service-visual-label > span', '.service-caption', '.package-index',
  '.package-content h3', '.package-content > p', '.package-content li',
  '.package-price', '.package-price > p', '.package-content > .action',
  '.project-card.active .portfolio-card-number', '.project-card.active .portfolio-mobile-reference', '.project-card.active .project-info h3', '.project-card.active .portfolio-category',
  '.project-card.active .portfolio-explore', '.portfolio-count', '.portfolio-source',
  '.cta-content .eyebrow', '.cta-content .line-mask > span', '.cta-bottom > p', '.cta-bottom > .action',
];
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const widths = process.env.CONTRAST_WIDTHS ? process.env.CONTRAST_WIDTHS.split(',').map(Number) : [1440, 390];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    const url = new URL(process.env.PREVIEW_URL || 'http://localhost:5173/');
    await page.goto(url.href);
    await page.evaluate(() => document.fonts.ready);
    for (const section of await page.locator('main > section, footer').all()) await section.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(100);
    const ranges = await page.evaluate(selectors => selectors.flatMap(selector => [...document.querySelectorAll(selector)].flatMap((el, index) => {
      if (!el.checkVisibility()) return [];
      const style = getComputedStyle(el);
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const texts = [];
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(walker.currentNode);
        for (const rect of range.getClientRects()) if (rect.width && rect.height) texts.push({ x: rect.x + scrollX, y: rect.y + scrollY, width: rect.width, height: rect.height });
      }
      return [{ selector, index, color: style.color, large: parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.67 && Number(style.fontWeight) >= 700), rects: texts }];
    })), selectors);
    const hiddenText = await page.addStyleTag({ content: '* { -webkit-text-fill-color: transparent !important; text-shadow: none !important; }' });
    const png = await page.screenshot({ fullPage: true });
    await hiddenText.evaluate(el => el.remove());
    const samples = await page.evaluate(async ({ png, ranges }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${png}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(image, 0, 0);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const luminance = rgb => rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      return ranges.map(({ rects, color, large, ...item }) => {
        const foreground = luminance(color.match(/[\d.]+/g).slice(0, 3).map(Number));
        let minimum = Infinity;
        for (const rect of rects) for (let y = Math.max(0, Math.ceil(rect.y)); y < Math.min(canvas.height, rect.y + rect.height); y++) for (let x = Math.max(0, Math.ceil(rect.x)); x < Math.min(canvas.width, rect.x + rect.width); x++) {
          const offset = (y * canvas.width + x) * 4;
          const background = luminance([data[offset], data[offset + 1], data[offset + 2]]);
          minimum = Math.min(minimum, (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05));
        }
        return { ...item, minimum: Number(minimum.toFixed(2)), required: large ? 3 : 4.5 };
      });
    }, { png: png.toString('base64'), ranges });
    results.push({ width, samples, failures: samples.filter(item => item.minimum < item.required) });
    console.log(`${width}px: ${samples.length} photo text ranges, ${results.at(-1).failures.length} contrast failures`);
  }
} finally {
  await fs.writeFile(process.env.CONTRAST_REPORT || 'qa/photo-contrast-results.json', JSON.stringify(results, null, 2));
  await browser.close();
}
assert.equal(results.flatMap(result => result.failures).length, 0, 'Photo contrast failures; see qa/photo-contrast-results.json');
