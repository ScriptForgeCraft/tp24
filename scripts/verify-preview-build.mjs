import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { previewThemes } from '../src/preview/themes.js';

const base = process.env.BUILD_PREVIEW_URL || 'http://localhost:4173/';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [], routes = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  for (const theme of previewThemes) {
    const entry = `dist/design-preview/${theme.id}/index.html`;
    const html = await fs.readFile(entry, 'utf8');
    assert.match(html, /noindex, nofollow/);
    const url = new URL(`design-preview/${theme.id}/`, base).href;
    assert.equal((await page.goto(url)).ok(), true);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('[data-preview-theme]').getAttribute('data-preview-theme'), theme.slug);
    assert.equal(await page.locator('main>section').count(), 8);
    await page.reload();
    assert.equal(await page.locator('[data-preview-theme]').getAttribute('data-preview-theme'), theme.slug);
    await page.locator('.hero-buttons .filled').click();
    await page.locator('.package-card button').first().click();
    assert.equal(await page.locator('.modal').evaluate(el => el.open), true);
    await page.keyboard.press('Escape'); await page.locator('.modal').waitFor({ state: 'hidden' });
    await page.goto(new URL('design-preview', base).href);
    await page.locator('.preview-overview-card').filter({ hasText: theme.name }).click();
    assert.equal(await page.locator('[data-preview-theme]').getAttribute('data-preview-theme'), theme.slug);
    routes.push({ entry, url, refresh: true, interactions: true, overviewLink: true });
  }
  await page.goto(base);
  assert.equal(await page.locator('.preview-selector').count(), 0);
  await page.getByRole('slider').focus(); await page.keyboard.press('End');
  assert.equal(await page.getByRole('slider').getAttribute('aria-valuenow'), '96');
  assert.deepEqual(errors, []);
  console.log('Six static preview entries, refreshes, overview links and original homepage passed.');
} finally {
  await fs.writeFile('qa/color-exploration/build-results.json', JSON.stringify({ routes, errors }, null, 2));
  await browser.close();
}
