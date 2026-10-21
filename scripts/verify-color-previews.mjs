import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
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
const expectedSections = ['home', 'approach', 'development', 'packages', 'projects', 'process', 'about', 'news', ''];
const original = {};
try {
  // Compare palettes against the current shared homepage, including its navbar controls.
  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const page = await context.newPage(); await page.setViewportSize({ width, height });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base); await reveal(page);
    const measured = await geometry(page);
    assert.equal(await page.locator('.navbar-design-options>button').count(), 6);
    original[name] = { measured, text: await page.locator('main').innerText(), images: await page.locator('main img').evaluateAll(els => els.map(el => el.getAttribute('src'))) };
    preservation.push({ viewport: name, baseline: 'Current homepage with navbar design switcher' });
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
      assert.equal(await page.locator('.navbar-design-options>button').count(), 6);
      assert.equal(await page.locator('.navbar-design-options>button[aria-pressed=true]').getAttribute('aria-label'), theme.id + ' — ' + theme.name);
      await page.screenshot({ path: `${directory}/after/${theme.id}-${name}-full.png`, fullPage: true });
      await page.screenshot({ path: `${directory}/after/${theme.id}-${name}-hero.png` });
      await audit(page, `${theme.id} ${name} home`);
      const slider = page.getByRole('slider'); await slider.focus(); await page.keyboard.press('ArrowRight');
      assert.equal(await slider.getAttribute('aria-valuenow'), '52');
      await page.getByRole('button', { name: 'Next project', exact: true }).click();
      assert.match(await page.locator('.project-card.active .project-info h3').innerText(), /Avet/i);
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
        await page.locator('.navbar-design-toggle').click();
        assert.equal(await page.locator('.navbar-design-options').isVisible(), true);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.navbar-design-options').isVisible(), false);
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
  await page.locator('.navbar-design-toggle').click(); await page.getByRole('button', { name: '06 — White & Terracotta', exact: true }).click();
  assert.equal(new URL(page.url()).pathname, '/design-preview/06');
  await page.close(); assert.deepEqual(errors, []);
} finally {
  await fs.writeFile(`${directory}/results.json`, JSON.stringify({ preservation, checks, scans, errors }, null, 2));
  await browser.close();
}
assert.equal(scans.flatMap(scan => scan.violations).length, 0, 'Accessibility violations; see qa/color-exploration/results.json');
