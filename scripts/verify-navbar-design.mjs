import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.env.PREVIEW_URL || 'http://localhost:5173/';
const directory = 'qa/navbar-design';
await fs.mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const errors = [], scans = [], checks = [];
try {
  for (const width of [1440, 390]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: 900 });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base); await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => { window.__designSwitchTest = 'preserve'; });
    assert.equal(await page.locator('.navbar-design-options>button').count(), 6);
    await page.getByRole('button', { name: 'Next project', exact: true }).click();
    const project = await page.locator('.project-card.active .project-info h3').innerText();
    await page.locator('#packages').scrollIntoViewIfNeeded();
    const position = await page.evaluate(() => scrollY);
    for (let i = 0; i < 6; i++) {
      if (width < 768) await page.locator('.navbar-design-toggle').click();
      await page.locator('.navbar-design-options>button').nth(i).click();
      const id = `0${i + 1}`;
      assert.equal(await page.locator('[data-preview-id]').getAttribute('data-preview-id'), id);
      assert.equal(await page.evaluate(() => window.__designSwitchTest), 'preserve', 'Switch must not reload the page');
      assert.equal(await page.evaluate(() => scrollY), position, 'Switch must retain scroll');
      assert.equal(await page.locator('.project-card.active .project-info h3').innerText(), project, 'Switch must retain app state');
      assert.equal(await page.locator('.navbar-design-options>button[aria-pressed=true]').count(), 1);
      assert.equal(new URL(page.url()).searchParams.get('theme'), id);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      scans.push({ width, theme: id, violations: result.violations });
      console.log(`${width}px design ${id}: ${result.violations.length} violations`);
    }
    await page.reload();
    assert.equal(await page.locator('[data-preview-id]').getAttribute('data-preview-id'), '06');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: `${directory}/${width}-hero.png` });
    if (width < 768) {
      await page.locator('.navbar-design-toggle').click();
      assert.equal(await page.locator('.navbar-design-options').isVisible(), true);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      scans.push({ width, state: 'open selector', violations: result.violations });
      await page.screenshot({ path: `${directory}/mobile-selector.png` });
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.navbar-design-options').isVisible(), false);
      assert.equal(await page.locator('.navbar-design-toggle').evaluate(el => document.activeElement === el), true);
      await page.locator('.navbar-design-toggle').click();
      await page.mouse.click(10, 600);
      assert.equal(await page.locator('.navbar-design-options').isVisible(), false);
    }
    for (const language of ['en', 'hy']) {
      if (language === 'hy') {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.locator('.header .language button').last().click();
        assert.equal(await page.locator('html').getAttribute('lang'), 'hy');
      }
      for (const size of [320, 360, 375, 390, 430, 600, 768, 1024, 1280, 1440, 1920]) {
        await page.setViewportSize({ width: size, height: 900 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Page overflow ${language} ${size}`);
        assert.equal(await page.locator('.header').evaluate(el => el.scrollWidth <= el.clientWidth), true, `Header overflow ${language} ${size}`);
      }
    }
    checks.push({ width, instantSwitches: 6, retainedScrollAndState: true, refresh: true, responsiveLanguages: ['en', 'hy'] });
    await page.close();
  }
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(new URL('design-preview/01', base).href);
  await page.evaluate(() => { window.__designSwitchTest = 'preserve'; });
  await page.locator('.navbar-design-options>button').nth(2).focus();
  await page.keyboard.press('Enter');
  assert.equal(new URL(page.url()).pathname, '/design-preview/03');
  assert.equal(await page.evaluate(() => window.__designSwitchTest), 'preserve');
  await page.reload();
  assert.equal(await page.locator('[data-preview-id]').getAttribute('data-preview-id'), '03');
  checks.push({ directPreviewRoute: true, keyboardSelection: true });
  assert.deepEqual(errors, []);
  assert.equal(scans.flatMap(scan => scan.violations).length, 0);
} finally {
  await fs.writeFile(`${directory}/results.json`, JSON.stringify({ checks, scans, errors }, null, 2));
  await browser.close();
}
console.log('Navbar design switching, retained state, keyboard, refresh and both-language responsive checks passed.');
