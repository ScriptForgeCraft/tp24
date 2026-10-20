import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { editorReducer, initialHistory } from '../src/editor/editorHistory.js';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [], checks = [];
const url = process.env.PREVIEW_URL || 'http://localhost:5173/';
const key = 'prospect24-client-editor-v1';
const directory = 'qa/editor';
await fs.mkdir(directory, { recursive: true });
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const check = (name, value) => { assert.ok(value, name); checks.push(name); console.log(`PASS ${name}`); };
const target = id => page.locator(`[data-edit-id="${id}"]`);
const toolbar = () => page.getByRole('region', { name: 'Design editor', exact: true });
async function select(id) {
  await page.keyboard.press('Escape');
  await target(id).scrollIntoViewIfNeeded();
  await target(id).click();
  await page.getByRole('region', { name: 'Element properties' }).waitFor();
}
async function color(property, values) {
  await page.getByLabel(property, { exact: true }).evaluate((input, values) => {
    input.focus();
    for (const value of values) { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); }
  }, Array.isArray(values) ? values : [values]);
  await page.waitForTimeout(70);
}
async function computed(id, property) { return target(id).evaluate((element, property) => getComputedStyle(element)[property], property); }
async function clickToolbar(name) { await toolbar().getByRole('button', { name, exact: true }).click(); }
async function visibility(id) { return target(`${id}.section`).isVisible(); }
async function upload(object) {
  await page.getByLabel('Import design file').setInputFiles({ name: 'test-design.json', mimeType: 'application/json', buffer: Buffer.from(typeof object === 'string' ? object : JSON.stringify(object)) });
  await page.waitForTimeout(100);
}
async function overflow(name) { check(`No overflow: ${name}`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); }
async function audit(name, editorOnly = false) {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']);
  if (editorOnly) builder.include('.p24-editor');
  const results = await builder.analyze();
  await fs.writeFile(`${directory}/a11y-${name}.json`, JSON.stringify(results.violations, null, 2));
  check(`Accessibility: ${name}`, results.violations.length === 0);
}

try {
  // A continuous gesture is one undo step, and a new change discards the redo branch.
  let state = initialHistory({ value: 0 });
  for (let value = 1; value <= 100; value++) state = editorReducer(state, { type: 'change', continuous: true, value: { value } });
  state = editorReducer(state, { type: 'undo' });
  check('100 color samples undo as one gesture', state.present.value === 0 && state.future.length === 1);
  state = editorReducer(state, { type: 'redo' });
  check('Redo restores final gesture value', state.present.value === 100);
  state = editorReducer(editorReducer(state, { type: 'undo' }), { type: 'change', value: { value: 2 } });
  check('New branch clears redo', state.future.length === 0);

  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  check('Editor is optional at startup', await page.locator('.p24-toolbar,.p24-hide,.p24-outline').count() === 0);
  check('Stable IDs are unique', await page.locator('[data-edit-id]').evaluateAll(elements => new Set(elements.map(el => el.dataset.editId)).size === elements.length));
  const originalHeading = await computed('hero.heading', 'color');
  const originalButton = await computed('hero.explore', 'backgroundColor');
  const initialSplit = await page.getByRole('slider').getAttribute('aria-valuenow');
  await page.getByRole('button', { name: 'Enable Edit Mode', exact: true }).click();
  check('Every major section gets a hide control', await page.locator('.p24-hide').count() === 11);
  await select('hero.heading');
  await color('Text color', ['#aa1111', '#bb2222', '#cc3333']);
  check('Heading color updates immediately', await computed('hero.heading', 'color') === 'rgb(204, 51, 51)');
  check('Other headings stay local', await computed('intro.heading', 'color') !== 'rgb(204, 51, 51)');
  await clickToolbar('Undo');
  check('Undo groups color picker gesture', await computed('hero.heading', 'color') === originalHeading);
  await clickToolbar('Redo');
  check('Redo color', await computed('hero.heading', 'color') === 'rgb(204, 51, 51)');
  await page.keyboard.press('Escape');
  check('Escape deselects', await page.locator('.p24-properties').count() === 0);
  await target('hero.tagline').focus(); await page.keyboard.press('Enter');
  check('Keyboard selection opens properties', await page.locator('.p24-properties').count() === 1);
  await page.mouse.click(1430, 500);
  check('Clicking page surface selects its section', await page.locator('.p24-properties').count() === 1 && (await page.locator('.p24-properties').textContent()).includes('Hero'));
  await page.locator('body').dispatchEvent('click');
  check('Outside noneditable click deselects', await page.locator('.p24-properties').count() === 0);
  await page.keyboard.press('Escape');
  await page.getByRole('slider').focus(); await page.keyboard.press('ArrowRight');
  check('Editor blocks comparison interaction', await page.getByRole('slider').getAttribute('aria-valuenow') === initialSplit);
  await select('hero.explore');
  check('Editor selection does not navigate', !page.url().includes('#development'));
  await color('Background color', '#145834');
  check('Individual button background', await computed('hero.explore', 'backgroundColor') === 'rgb(20, 88, 52)');
  await page.keyboard.press('Escape');
  await select('intro.heading');
  await page.getByRole('button', { name: 'Select section', exact: true }).click();
  await color('Background color', '#ddeebb');
  check('Section background updates', await computed('intro.section', 'backgroundColor') === 'rgb(221, 238, 187)');
  await select('packages.card.pre-investment-package.heading');
  await page.getByRole('button', { name: 'Select section', exact: true }).click();
  check('Containing section can be selected', (await page.locator('.p24-properties').textContent()).includes('Development Packages'));
  await select('packages.card.pre-investment-package.heading');
  await page.getByRole('button', { name: 'Select card', exact: true }).click();
  check('Card can be selected from its text', (await page.locator('.p24-properties').textContent()).includes('Pre-Investment Package'));
  await select('packages.card.pre-investment-package');
  await color('Background color', '#123456');
  check('Package card surface beats photo overlay', await target('packages.card.pre-investment-package').evaluate(el => getComputedStyle(el, '::after').backgroundColor) === 'rgb(18, 52, 86)');
  check('Other package card unchanged', await computed('packages.card.development-package', 'backgroundColor') !== 'rgb(18, 52, 86)');
  await color('Border color', '#cc5511');
  check('Card border color applies', await computed('packages.card.pre-investment-package', 'borderTopColor') === 'rgb(204, 85, 17)');
  await color('Text color', '#123456');
  check('Low contrast warning appears', await page.locator('.p24-warning').count() === 1);
  await color('Text color', '#ffffff');
  await select('hero.heading');
  await page.screenshot({ path: `${directory}/desktop-editing.png` });
  await audit('desktop-editing', true);
  await target('packages.section').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Hide Development Packages', exact: true }).click();
  check('Section hides without unmounting', !(await visibility('packages')) && await target('packages.section').count() === 1);
  check('Hidden navigation is disabled', await page.locator('.desktop-nav a[href="#packages"]').getAttribute('aria-disabled') === 'true');
  await clickToolbar('Undo'); check('Undo section hiding', await visibility('packages'));
  await clickToolbar('Redo'); check('Redo section hiding', !(await visibility('packages')));
  await clickToolbar('Sections');
  await page.getByRole('checkbox', { name: 'Show Development Packages', exact: true }).check();
  check('Sections panel restores section', await visibility('packages'));
  await page.getByRole('checkbox', { name: 'Show Partners', exact: true }).uncheck();
  check('Nested partners can hide independently', !(await visibility('partners')) && await visibility('expertise'));
  await page.getByRole('checkbox', { name: 'Show Expertise', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'Show Partners', exact: true }).check();
  check('Child remains hidden with parent', !(await visibility('partners')));
  await page.getByRole('checkbox', { name: 'Show Expertise', exact: true }).check();
  check('Restoring parent respects child visibility', await visibility('partners'));
  await page.getByRole('checkbox', { name: 'Show News & Media', exact: true }).uncheck();
  await clickToolbar('Preview');
  check('Preview hides all editing overlays', await page.locator('.p24-hide,.p24-outline,.p24-properties,.p24-sections').count() === 0);
  check('Preview preserves styles and visibility', !(await visibility('news')) && await computed('hero.heading', 'color') === 'rgb(204, 51, 51)');
  await page.getByRole('slider').focus(); await page.keyboard.press('ArrowRight');
  check('Preview restores hero comparison', await page.getByRole('slider').getAttribute('aria-valuenow') === '52');
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Next project', exact: true }).click();
  check('Preview restores carousel', (await page.locator('.project-info h3').textContent()).includes('Avet'));
  await page.locator('#packages .section-top button').click();
  check('Preview restores modal', await page.locator('.modal').evaluate(el => el.open));
  await page.keyboard.press('Escape');
  await page.reload();
  check('Reload keeps editor closed', await page.locator('.p24-toolbar').count() === 0);
  check('Reload persists colors and hidden sections', await computed('hero.heading', 'color') === 'rgb(204, 51, 51)' && !(await visibility('news')));
  await page.getByRole('button', { name: 'Enable Edit Mode', exact: true }).click();
  const downloadPromise = page.waitForEvent('download'); await clickToolbar('Export');
  const download = await downloadPromise; const exportPath = `${directory}/prospect24-design.json`;
  await download.saveAs(exportPath);
  const exported = JSON.parse(await fs.readFile(exportPath, 'utf8'));
  check('Export contains only design configuration', exported.version === 1 && Object.keys(exported).every(k => ['version', 'visibility', 'overrides', 'exportedAt'].includes(k)));
  await clickToolbar('Reset All');
  check('Reset All requires confirmation', await page.getByRole('dialog', { name: 'Restore original design?' }).isVisible());
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  check('Cancel preserves design', !(await visibility('news')));
  await clickToolbar('Reset All'); await page.getByRole('button', { name: 'Restore original', exact: true }).click();
  check('Reset All restores original design', await computed('hero.heading', 'color') === originalHeading && await computed('hero.explore', 'backgroundColor') === originalButton && await visibility('news'));
  await clickToolbar('Undo'); check('Reset All is undoable', !(await visibility('news')));
  await clickToolbar('Redo');
  await upload(exported);
  check('Export/import round trip', await computed('hero.heading', 'color') === 'rgb(204, 51, 51)' && !(await visibility('news')));
  await clickToolbar('Undo'); check('Import is undoable', await visibility('news'));
  await clickToolbar('Redo');
  await select('hero.heading'); await clickToolbar('Reset Selected');
  check('Reset Selected is local', await computed('hero.heading', 'color') === originalHeading && await computed('hero.explore', 'backgroundColor') === 'rgb(20, 88, 52)');
  await clickToolbar('Undo');
  await page.locator('.header .language button').last().click();
  check('Armenian language keeps stable styles', await page.locator('html').getAttribute('lang') === 'hy' && await computed('hero.heading', 'color') === 'rgb(204, 51, 51)');
  check('Stable IDs stay unique after language switch', await page.locator('[data-edit-id]').evaluateAll(elements => new Set(elements.map(el => el.dataset.editId)).size === elements.length));
  await page.locator('.header .language button').first().click();
  for (let theme = 1; theme <= 6; theme++) {
    await page.getByRole('button', { name: new RegExp(`^0${theme} —`) }).click();
    check(`Local colors survive palette ${theme}`, await computed('hero.heading', 'color') === 'rgb(204, 51, 51)' && await computed('hero.explore', 'backgroundColor') === 'rgb(20, 88, 52)');
  }
  await select('packages.card.development-package');
  check('Computed color-mix surface initializes picker', await page.getByLabel('Background color', { exact: true }).inputValue() !== '#ffffff');
  // Return to the default palette while keeping saved editor customizations.
  await page.goto(url);
  await page.getByRole('button', { name: 'Enable Edit Mode', exact: true }).click();

  await upload({ ...exported, overrides: { ...exported.overrides, 'hero.section': { color: '#eeeeee' } } });
  check('Nested local text overrides beat section colors', await computed('hero.heading', 'color') === 'rgb(204, 51, 51)');
  check('Section colors do not recolor editor controls', await target('hero.section').locator('.p24-hide').evaluate(el => getComputedStyle(el).color) === 'rgb(32, 39, 32)');
  await upload(exported);

  // Reject unsafe or malformed input atomically, while accepting incomplete/unknown IDs.
  const beforeInvalid = await page.evaluate(key => localStorage.getItem(key), key);
  for (const invalid of ['{', { version: 2 }, { version: 1, overrides: { 'hero.heading': { position: 'fixed' } } }, { version: 1, overrides: { 'hero.heading': { color: 'url(javascript:x)' } } }, { version: 1, visibility: { hero: 'false' } }, { version: 1, overrides: [] }]) {
    await upload(invalid);
    check('Invalid import leaves current design intact', await page.evaluate(key => localStorage.getItem(key), key) === beforeInvalid);
    check('Invalid import reports error', (await toolbar().textContent()).includes('Import failed:'));
  }
  await upload({ version: 1, overrides: { 'retired.heading': { color: '#123456' } } });
  check('Old/incomplete configs and unknown IDs are safe', await computed('hero.heading', 'color') === originalHeading);
  await upload(exported);

  for (const width of [320, 375, 390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await select('hero.heading');
    await overflow(`editor ${width}`);
    check(`Panel stays on screen ${width}`, await page.locator('.p24-properties').evaluate(el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight && r.top >= 0; }));
    check(`Navbar fits ${width}`, await page.locator('.header').evaluate(el => el.scrollWidth <= el.clientWidth));
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await select('hero.heading'); await page.screenshot({ path: `${directory}/mobile-editing.png` });
  check('Mobile panel avoids heading when space allows', await page.locator('.p24-properties').evaluate(el => { const panel = el.getBoundingClientRect(), heading = document.querySelector('[data-edit-id="hero.heading"]').getBoundingClientRect(); return panel.bottom <= heading.top || panel.top >= heading.bottom; }));
  // Audit original colors so an intentional client contrast experiment does not fail UI QA.
  await clickToolbar('Reset All'); await page.getByRole('button', { name: 'Restore original', exact: true }).click();
  await select('hero.heading'); await audit('mobile-editing');
  await page.keyboard.press('Escape'); await clickToolbar('Sections'); await audit('mobile-sections');
  await clickToolbar('Preview');
  await page.locator('.menu-toggle').click();
  check('Preview preserves mobile menu', await page.locator('.mobile-menu').evaluate(el => el.open));
  await page.locator('.mobile-menu .language button').last().click();
  check('Mobile Armenian switch works', await page.locator('html').getAttribute('lang') === 'hy');
  await page.keyboard.press('Escape');
  await page.locator('.header .p24-pencil').click();
  check('Editor closes cleanly', await page.locator('.p24-toolbar,.p24-hide').count() === 0);

  const noStorage = await browser.newContext();
  await noStorage.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Unavailable'); } }); });
  const blocked = await noStorage.newPage(); blocked.on('pageerror', error => errors.push(error.message));
  await blocked.goto(url); await blocked.getByRole('button', { name: 'Enable Edit Mode', exact: true }).click();
  check('Unavailable storage does not break editor', (await blocked.locator('.p24-status').textContent()).includes('storage unavailable'));
  await noStorage.close();
  await page.evaluate(key => localStorage.setItem(key, '{broken'), key); await page.reload();
  check('Corrupt storage falls back to original design', await computed('hero.heading', 'color') === originalHeading);
  check('No runtime or React console errors', errors.length === 0);
} finally {
  await fs.writeFile(`${directory}/results.json`, JSON.stringify({ checks, errors }, null, 2));
  await browser.close();
}
console.log(`Editor: ${checks.length} checks passed.`);
