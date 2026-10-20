import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { previewThemes } from '../src/preview/themes.js';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [], errors = [];
try {
  for (const theme of previewThemes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL(`design-preview/${theme.id}`, process.env.PREVIEW_URL || 'http://localhost:5173/').href);
    await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1800);
    assert.equal(await page.locator('.hero').evaluate(el => el.classList.contains('ready')), true);
    assert.ok(await page.locator('.hero-visual').evaluate(el => parseFloat(getComputedStyle(el).animationDuration) > 1));
    assert.ok(await page.locator('h1 .line-mask>span').first().evaluate(el => parseFloat(getComputedStyle(el).transitionDuration) > .5));
    const slider = page.getByRole('slider'); const box = await slider.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
    await page.mouse.move(1050, 450, { steps: 8 }); await page.mouse.up();
    assert.ok(Number(await slider.getAttribute('aria-valuenow')) > 65);
    await page.locator('.desktop-nav a[href="#packages"]').click(); await page.waitForTimeout(850);
    assert.ok(Math.abs(await page.locator('#packages').evaluate(el => el.getBoundingClientRect().top) - 90) < 10);
    await page.locator('.desktop-nav a[href="#development"]').click(); await page.waitForTimeout(850);
    await page.locator('.service-trigger').nth(2).hover(); await page.waitForTimeout(600);
    assert.equal(await page.locator('.service-visual>img.active').getAttribute('src'), '/images/finance.webp');
    assert.ok(await page.locator('.service-visual>img').first().evaluate(el => parseFloat(getComputedStyle(el).transitionDuration) > .5));
    await page.locator('#projects').scrollIntoViewIfNeeded(); await page.waitForTimeout(900);
    await page.locator('.project-stage').focus(); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900);
    assert.match(await page.locator('.project-info h3').innerText(), /Avet/i);
    await page.getByRole('button', { name: 'Explore Project', exact: true }).click();
    assert.equal(await page.locator('.modal').evaluate(el => el.open), true);
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    assert.equal(await page.locator('.modal').evaluate(el => el.open), false);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.menu-toggle').click(); await page.waitForTimeout(650);
    await page.locator('.mobile-menu nav a[href="#packages"]').click(); await page.waitForTimeout(1150);
    assert.equal(await page.locator('.mobile-menu').evaluate(el => el.open), false);
    assert.ok(Math.abs(await page.locator('#packages').evaluate(el => el.getBoundingClientRect().top) - 76) < 10);
    results.push({ theme: theme.name, heroEntrance: true, comparisonDrag: true, navigation: true, serviceCrossfade: true, projectCarousel: true, modalEscape: true, mobileNavigation: true });
    console.log(`${theme.id}: normal-motion interactions passed`);
    await context.close();
  }
  assert.deepEqual(errors, []);
} finally {
  await fs.writeFile('qa/color-exploration/motion-results.json', JSON.stringify({ results, errors }, null, 2));
  await browser.close();
}
