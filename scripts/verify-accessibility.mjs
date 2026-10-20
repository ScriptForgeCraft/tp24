import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const results = [];
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const url = process.env.PREVIEW_URL || 'http://localhost:5173/';
await fs.mkdir('qa', { recursive: true });

async function audit(name) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  const violations = result.violations.map(({ id, impact, nodes }) => ({
    id, impact, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
  }));
  results.push({ name, violations, passedRules: result.passes.length, manualReviewRules: result.incomplete.map(item => item.id) });
  console.log(`${name}: ${violations.length} violations`);
}

async function closeDialog() {
  await page.keyboard.press('Escape');
  await page.locator('.modal').waitFor({ state: 'hidden' });
}

try {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    for (const section of await page.locator('main > section, footer').all()) await section.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await audit(`EN ${width} home / dark header`);
    await page.locator('#about').scrollIntoViewIfNeeded();
    await audit(`EN ${width} home / light header`);
    assert.equal(await page.locator('.stage').evaluateAll(elements => elements.every(el => getComputedStyle(el).opacity === '1')), true, 'All process steps stay readable');
    assert.equal(await page.locator('.footer-wordmark svg').evaluate(el => el.getBoundingClientRect().width <= 560), true, 'Footer signature stays compact');
    assert.equal(await page.locator('.nav-unavailable').evaluateAll(elements => elements.every(el => !el.hasAttribute('href') && !el.hasAttribute('tabindex'))), true, 'Unbuilt pages are not dead links');
    for (const type of ['compare', 'package', 'project', 'contact', 'privacy', 'terms']) {
      const trigger = {
        compare: '#packages .section-top button', package: '.package-card button',
        project: '.project-info button', contact: '.final-cta button',
        privacy: '.footer-legal button:first-child', terms: '.footer-legal button:last-child',
      }[type];
      await page.locator(trigger).first().click();
      await audit(`EN ${width} ${type} dialog`);
      await closeDialog();
    }
    if (width === 1440) await page.locator('.header .language button').last().click();
    else {
      await page.locator('.menu-toggle').click();
      await audit('EN 390 mobile menu');
      await page.locator('.mobile-menu .language button').last().click();
      await audit('AM 390 mobile menu');
      await page.keyboard.press('Escape');
      await page.locator('.mobile-menu').waitFor({ state: 'hidden' });
    }
    await audit(`AM ${width} home`);
    await page.locator('#home').scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No overflow at ${width}`);
  }
  for (const lang of ['en', 'am']) {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    if (lang === 'am') await page.locator('.header .language button').last().click();
    for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1680, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${lang} overflow at ${width}`);
      const nav = page.locator('.desktop-nav');
      if (await nav.isVisible()) assert.equal(await page.locator('.header').evaluate(el => el.scrollWidth <= el.clientWidth), true, `${lang} navbar fits ${width}`);
    }
  }
  assert.deepEqual(errors, []);
} finally {
  await fs.writeFile('qa/accessibility-results.json', JSON.stringify({ results, errors }, null, 2));
  await browser.close();
}
assert.equal(results.flatMap(result => result.violations).length, 0, 'Accessibility violations; see qa/accessibility-results.json');
