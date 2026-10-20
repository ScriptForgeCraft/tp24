import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { previewThemes } from '../src/preview/themes.js';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const base = process.env.PREVIEW_URL || 'http://localhost:5173/';
const directory = 'qa/color-exploration';
const scans = [], checks = [], errors = [], preservation = [];
await fs.mkdir(`${directory}/after`, { recursive: true });
const geometry = page => page.locator('header,main>section,footer,.action,.display,.logo').evaluateAll(els => els.map(el => {
  const b = el.getBoundingClientRect(), s = getComputedStyle(el);
  return { class: el.className, tag: el.tagName, x: b.x, y: b.y + scrollY, width: b.width, height: b.height, font: s.font, fontSize: s.fontSize, lineHeight: s.lineHeight, padding: s.padding, gap: s.gap, borderRadius: s.borderRadius };
}));
async function reveal(page) {
  await page.mouse.move(1, 1);
  await page.evaluate(() => document.fonts.ready);
  for (const section of await page.locator('main>section,footer').all()) { await section.scrollIntoViewIfNeeded(); await page.waitForTimeout(50); }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(150);
}
async function audit(page, name) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  scans.push({ name, violations: result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })), manualReview: result.incomplete.map(item => item.id) });
  console.log(`${name}: ${result.violations.length} violations`);
}
async function solidButtonContrast(page, selector) {
  const ratio = await page.locator(selector).first().evaluate(el => {
    const s = getComputedStyle(el);
    const l = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const a = l(s.color), b = l(s.backgroundColor);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  });
  assert.ok(ratio >= 4.5, `${selector}: ${ratio.toFixed(2)}:1`);
}
const expectedSections = ['home', 'approach', 'development', 'packages', 'projects', 'process', 'about', ''];
const original = {};
try {
  const sourceHashes = JSON.parse(await fs.readFile(`${directory}/before/source-hashes.json`, 'utf8'));
  for (const file of ['src/styles.css', 'src/presentation.css', 'src/data.js']) assert.equal(crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex'), sourceHashes[file], `${file} was changed`);
  // Re-render the saved original with identical pointer and font-loading conditions.
  // The earlier captures can include a transient project-image hover transform.
  const baselineSource = execFileSync('git', ['show', 'HEAD:src/main.jsx']).toString('utf8').replace(/\r?\n/g, '\r\n');
  assert.equal(crypto.createHash('sha256').update(baselineSource).digest('hex'), sourceHashes['src/main.jsx']);
  await fs.writeFile('src/qa-original-baseline.jsx', baselineSource);
  await fs.writeFile('qa-original-baseline.html', (await fs.readFile('index.html', 'utf8')).replace('/src/main.jsx', '/src/qa-original-baseline.jsx'));
  // The original URL must retain exact dimensions, typography and rendered pixels.
  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const page = await context.newPage(); await page.setViewportSize({ width, height });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(new URL('qa-original-baseline.html', base).href); await reveal(page);
    const before = await page.screenshot({ path: `${directory}/before/${name}-deterministic.png`, fullPage: true });
    await page.goto(base); await reveal(page);
    const measured = await geometry(page);
    assert.deepEqual(measured, JSON.parse(await fs.readFile(`${directory}/before/${name}-geometry.json`, 'utf8')), `Original ${name} geometry changed`);
    const png = await page.screenshot({ path: `${directory}/after/original-${name}.png`, fullPage: true });
    let imageOnlyAnimationDifference = false;
    let rasterDifferencePixels = 0;
    if (!png.equals(before)) {
      const allowed = await page.locator('.project-stage').evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height }; });
      const diff = await page.evaluate(async ({ images, allowed }) => {
        const frames = [];
        for (const bytes of images) {
          const img = new Image(); img.src = `data:image/png;base64,${bytes}`; await img.decode();
          const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0); frames.push({ width: img.width, height: img.height, pixels: ctx.getImageData(0, 0, img.width, img.height).data });
        }
        const [a, b] = frames; let outside = 0, inside = 0;
        if (a.width !== b.width || a.height !== b.height) return { outside: Infinity, inside: 0 };
        for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) {
          const i = (y * a.width + x) * 4;
          if (a.pixels[i] !== b.pixels[i] || a.pixels[i + 1] !== b.pixels[i + 1] || a.pixels[i + 2] !== b.pixels[i + 2]) {
            if (x >= allowed.x && x < allowed.x + allowed.width && y >= allowed.y && y < allowed.y + allowed.height) inside++; else outside++;
          }
        }
        return { outside, inside };
      }, { images: [before.toString('base64'), png.toString('base64')], allowed });
      rasterDifferencePixels = diff.outside;
      // Chromium can rasterize a few anti-aliased edge pixels differently on reload.
      assert.ok(diff.outside <= 100, `Original ${name}: ${diff.outside} changed pixels outside the animated project photograph`);
      imageOnlyAnimationDifference = diff.inside > 0;
    }
    assert.equal(await page.locator('.preview-selector').count(), 0);
    original[name] = { measured, text: await page.locator('main').innerText(), images: await page.locator('main img').evaluateAll(els => els.map(el => el.getAttribute('src'))) };
    preservation.push({ viewport: name, geometryIdentical: true, screenshotIdentical: png.equals(before), imageOnlyAnimationDifference, rasterDifferencePixels });
    await page.close();
  }
  for (const theme of previewThemes) {
    for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
      const page = await context.newPage(); await page.setViewportSize({ width, height });
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(new URL(`design-preview/${theme.id}`, base).href); await reveal(page);
      assert.equal(await page.locator('[data-preview-theme]').getAttribute('data-preview-theme'), theme.slug);
      assert.deepEqual(await geometry(page), original[name].measured, `${theme.name}: geometry differs from original`);
      assert.equal(await page.locator('main').innerText(), original[name].text, `${theme.name}: content changed`);
      assert.deepEqual(await page.locator('main img').evaluateAll(els => els.map(el => el.getAttribute('src'))), original[name].images);
      assert.deepEqual(await page.locator('main>section').evaluateAll(els => els.map(el => el.id)), expectedSections);
      assert.equal(await page.locator('.preview-selector nav a').count(), 6);
      assert.equal(await page.locator('.preview-selector nav a[aria-current]').textContent(), theme.id + theme.name);
      await page.screenshot({ path: `${directory}/after/${theme.id}-${name}-full.png`, fullPage: true });
      await page.screenshot({ path: `${directory}/after/${theme.id}-${name}-hero.png` });
      await audit(page, `${theme.id} ${name} home`);
      const slider = page.getByRole('slider'); await slider.focus(); await page.keyboard.press('ArrowRight');
      assert.equal(await slider.getAttribute('aria-valuenow'), '52');
      await page.getByRole('button', { name: 'Next project', exact: true }).click();
      assert.match(await page.locator('.project-info h3').innerText(), /Avet/i);
      await page.locator('.service-trigger').nth(1).click();
      assert.equal(await page.locator('.service-trigger').nth(1).getAttribute('aria-expanded'), 'true');
      for (const selector of ['.hero-buttons .filled', '#packages .section-top .action', '.package-content>.action', '.final-cta .action']) {
        await page.locator(selector).first().scrollIntoViewIfNeeded();
        await solidButtonContrast(page, selector); await page.locator(selector).first().hover(); await page.waitForTimeout(20); await solidButtonContrast(page, selector);
      }
      await page.locator('.final-cta button').click();
      await audit(page, `${theme.id} ${name} contact dialog`);
      await solidButtonContrast(page, '.contact-body .action');
      await page.locator('.contact-body .action').hover(); await page.waitForTimeout(20); await solidButtonContrast(page, '.contact-body .action');
      await page.keyboard.press('Escape'); await page.locator('.modal').waitFor({ state: 'hidden' });
      await page.locator('#packages .section-top button').click(); await audit(page, `${theme.id} ${name} package comparison`);
      await page.keyboard.press('Escape'); await page.locator('.modal').waitFor({ state: 'hidden' });
      if (name === 'mobile') {
        await page.locator('.preview-selector-toggle').click();
        assert.equal(await page.locator('.preview-selector nav').isVisible(), true);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.preview-selector nav').isVisible(), false);
        await page.locator('.menu-toggle').click(); await audit(page, `${theme.id} mobile menu`);
        await page.locator('.mobile-menu .language button').last().click();
        assert.equal(await page.locator('html').getAttribute('lang'), 'hy');
        await page.keyboard.press('Escape'); await page.locator('.mobile-menu').waitFor({ state: 'hidden' });
      }
      for (const size of [320, 375, 390, 768, 1024, 1280, 1440, 1920]) {
        await page.setViewportSize({ width: size, height: 900 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${theme.id} overflow at ${size}`);
      }
      await page.reload();
      assert.equal(await page.locator('[data-preview-theme]').getAttribute('data-preview-theme'), theme.slug);
      checks.push(`${theme.id} ${name}: complete content, identical geometry, interactions, refresh, contrast and responsive layout`);
      await page.close();
    }
  }
  const page = await context.newPage(); await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(new URL('design-preview', base).href); await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('.preview-overview-card').count(), 6); await audit(page, 'Overview desktop');
  await page.screenshot({ path: `${directory}/after/overview-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 }); await audit(page, 'Overview mobile');
  await page.screenshot({ path: `${directory}/after/overview-mobile.png`, fullPage: true });
  await page.locator('.preview-overview-card').nth(2).click();
  assert.equal(new URL(page.url()).pathname, '/design-preview/03');
  await page.locator('.preview-selector-toggle').click(); await page.getByRole('link', { name: '06 — White & Terracotta', exact: true }).click();
  assert.equal(new URL(page.url()).pathname, '/design-preview/06');
  await page.close(); assert.deepEqual(errors, []);
} finally {
  await fs.writeFile(`${directory}/results.json`, JSON.stringify({ preservation, checks, scans, errors }, null, 2));
  await browser.close();
  await fs.unlink('src/qa-original-baseline.jsx').catch(() => {});
  await fs.unlink('qa-original-baseline.html').catch(() => {});
}
assert.equal(scans.flatMap(scan => scan.violations).length, 0, 'Accessibility violations; see qa/color-exploration/results.json');
