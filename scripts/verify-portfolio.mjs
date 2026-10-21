import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const base = process.env.PREVIEW_URL || 'http://localhost:5173/';
const results = [], errors = [];
await fs.mkdir('qa/portfolio', { recursive: true });

async function selected(page, index) {
  await page.waitForFunction(index => document.querySelector('.portfolio-pagination button[aria-current]')?.textContent.trim() === String(index + 1).padStart(2, '0'), index);
  // Let a native smooth scroll or snap finish before the next interaction.
  await page.waitForTimeout(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches) ? 80 : 700);
  assert.equal(await page.locator('.project-card.active').getAttribute('aria-label'), await page.locator('.project-card').nth(index).getAttribute('aria-label'));
  assert.equal(await page.locator('.portfolio-pagination button[aria-current]').innerText(), String(index + 1).padStart(2, '0'));
}

async function selectProject(page, index) {
  const number = page.locator('.portfolio-pagination button').nth(index);
  if (await number.isVisible()) await number.click();
  else {
    await page.locator('.portfolio-track').focus();
    await page.keyboard.press('Home');
    for (let i = 0; i < index; i++) await page.keyboard.press('ArrowRight');
  }
}

try {
  for (const reducedMotion of ['reduce', 'no-preference']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#projects').scrollIntoViewIfNeeded();
    await selected(page, 0);
    assert.equal(await page.getByRole('button', { name: 'Previous project', exact: true }).isDisabled(), true);
    await page.evaluate(() => {
      window.portfolioTransitions = [];
      const pagination = document.querySelector('.portfolio-pagination');
      window.portfolioObserver = new MutationObserver(() => window.portfolioTransitions.push(pagination.querySelector('[aria-current]')?.textContent.trim()));
      window.portfolioObserver.observe(pagination, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
    });
    await page.getByRole('button', { name: 'Next project', exact: true }).click();
    await selected(page, 1);
    assert.deepEqual(await page.evaluate(() => [...new Set(window.portfolioTransitions)]), ['02'], 'Active number stays stable during the animation');
    await page.evaluate(() => window.portfolioObserver.disconnect());
    await selectProject(page, 0);
    await selected(page, 0);
    await page.getByRole('button', { name: 'Next project', exact: true }).dblclick({ delay: 60 });
    await selected(page, 2);
    await page.getByRole('button', { name: 'Previous project', exact: true }).click();
    await selected(page, 1);
    await page.locator('.portfolio-track').focus();
    await page.keyboard.press('ArrowRight');
    await selected(page, 2);
    assert.equal(await page.getByRole('button', { name: 'Next project', exact: true }).isDisabled(), true);
    await page.keyboard.press('Home');
    await selected(page, 0);
    await page.keyboard.press('End');
    await selected(page, 2);
    await selectProject(page, 1);
    await selected(page, 1);
    await page.locator('.project-card.active .portfolio-explore').click();
    assert.equal(await page.locator('.modal #modal-title').innerText(), 'Avet Avetisyan, 20');
    await page.keyboard.press('Escape');
    await page.locator('.modal').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('.project-card.active .portfolio-explore').evaluate(el => document.activeElement === el), true);
    const link = page.locator('.portfolio-all');
    assert.match(await link.getAttribute('href'), /projects/);
    assert.equal(await link.getAttribute('target'), '_blank');

    await selectProject(page, 0);
    await selected(page, 0);
    const box = await page.locator('.portfolio-track').boundingBox();
    await page.mouse.move(box.x + 550, box.y + 100);
    await page.mouse.down();
    await page.mouse.move(box.x + 150, box.y + 100, { steps: 14 });
    await page.mouse.up();
    await selected(page, 2);
    assert.equal(await page.locator('.portfolio-track').getAttribute('data-dragging'), null);

    // The editor must reveal the requested real card, including off-screen cards.
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('p24-editor-reveal', { detail: 'projects.card.garden-hill-residence.heading' })));
    await selected(page, 0);
    results.push({ reducedMotion, arrows: true, keyboard: true, mouseDrag: true, modalFocusRestoration: true, editorReveal: true });

    if (reducedMotion === 'reduce') {
      for (const lang of ['en', 'am']) {
        await page.goto(`${base}?editorLanguage=${lang}`);
        await page.evaluate(() => document.fonts.ready);
        for (const width of [320, 390, 700, 768, 1024, 1440, 1920]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.locator('#projects').scrollIntoViewIfNeeded();
          await page.waitForTimeout(80);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${lang} ${width}px document overflow`);
          assert.equal(await page.locator('.portfolio-header').evaluate(el => el.scrollWidth <= el.clientWidth), true, `${lang} ${width}px header fits`);
          for (let index = 0; index < 3; index++) {
            await selectProject(page, index);
            await selected(page, index);
          }
          await selectProject(page, 0);
          await selected(page, 0);
          if ([390, 1440].includes(width)) {
            await page.locator('#projects').screenshot({ path: `qa/portfolio/${lang}-${width}.png` });
            const audit = await new AxeBuilder({ page }).include('#projects').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
            assert.deepEqual(audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [], `${lang} ${width}px accessibility`);
          }
          results.push({ lang, width, overflow: false, navigation: true });
        }
      }
      for (let theme = 1; theme <= 6; theme++) {
        await page.goto(`${base}?theme=0${theme}`);
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.locator('#projects').scrollIntoViewIfNeeded();
        await selectProject(page, 2);
        await selected(page, 2);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        results.push({ theme, navigation: true });
      }
    }
    await context.close();
  }

  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const page = await touchContext.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  await page.locator('#projects').scrollIntoViewIfNeeded();
  const box = await page.locator('.portfolio-track').boundingBox();
  const touch = await touchContext.newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 280, y: box.y + 100 }] });
  for (let x = 260; x >= 70; x -= 10) {
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: box.y + 100 }] });
    await page.waitForTimeout(20);
  }
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(700);
  assert.ok(await page.locator('.portfolio-track').evaluate(el => el.scrollLeft) > 100, 'Native touch swipe scrolls the rail');
  assert.notEqual(await page.locator('.portfolio-count').innerText(), '01 / 03');
  results.push({ nativeTouchSwipe: true });
  await touchContext.close();
  assert.deepEqual(errors, []);
  console.log(`Portfolio: ${results.length} checks passed; no browser errors.`);
} finally {
  await fs.writeFile('qa/portfolio/results.json', JSON.stringify({ results, errors }, null, 2));
  await browser.close();
}
