import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const checks = [], errors = [], audits = [];
const check = (name, result) => { assert.ok(result, name); checks.push(name); };
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
const close = async () => { await page.keyboard.press('Escape'); await page.locator('.modal').waitFor({ state: 'hidden' }); };
const overflow = async label => check(`No overflow: ${label}`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && [...document.querySelectorAll('dialog[open]')].every(el => el.scrollWidth <= el.clientWidth)));
const images = async () => page.locator('img').evaluateAll(async els => { await Promise.all(els.map(async el => { el.loading = 'eager'; try { await el.decode(); } catch { /* Assert below. */ } })); return els.every(el => el.naturalWidth > 0); });
try {
  for (const lang of ['en', 'am']) {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(process.env.PREVIEW_URL || 'http://localhost:5173/');
    if (lang === 'am') await page.locator('.header .language button').last().click();
    check(`${lang}: no dead navigation`, await page.locator('.desktop-nav a').evaluateAll(els => els.every(el => document.querySelector(el.getAttribute('href')))));
    check(`${lang}: correct prices and reference area`, await page.locator('.package-price').evaluateAll(els => els.length === 3 && els.every(el => /1[ ,]200–1[ ,]500/.test(el.textContent)) && els[0].textContent.includes('2 400 000') && els[1].textContent.includes('4 800 000') && els[2].textContent.includes('11 200 000')));
    check(`${lang}: twelve selected genuine logos`, await page.locator('#partners img').count() === 12);
    check(`${lang}: all homepage images load`, await images());
    check(`${lang}: three dated memoranda`, await page.locator('time').count() === 6);
    check(`${lang}: two official videos`, await page.locator('.media-list a').evaluateAll(els => els.length === 2 && els[0].href.includes('jn9iFdgyBg8') && els[1].href.includes('NamajLyCY3k')));
    if (lang === 'am') check('Armenian body has no unintended English or Russian interface copy', await page.locator('main').evaluate(el => !/Published|Includes |Reference construction|Prepare Email|марта|января|февраля/.test(el.textContent)));
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await overflow(`${lang} ${width} home`);
      check(`${lang} ${width}: headings do not clip`, await page.locator('.line-mask').evaluateAll(els => els.every(el => el.scrollWidth <= el.clientWidth + 1)));
      for (let i = 0; i < 3; i++) {
        await page.locator('.package-card button').nth(i).click();
        check(`${lang} ${width} package ${i + 1}: full grouped scope`, await page.locator('.scope-groups section').count() >= 3);
        await overflow(`${lang} ${width} package ${i + 1}`);
        if (lang === 'am' && width === 390) {
          const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
          audits.push({ lang, screen: `package ${i + 1}`, violations: axe.violations });
        }
        if (i === 2 && width === 390) {
          await page.locator('.modal').screenshot({ path: `qa/content-${lang}-package-mobile.png` });
          await page.locator('.modal-actions button').click();
          check(`${lang}: package interest carried to contact`, await page.locator('select[name=package]').inputValue() === 'Investment Package');
          await overflow(`${lang} mobile contact`);
          await page.locator('.modal').screenshot({ path: `qa/content-${lang}-contact-mobile.png` });
        }
        await close();
      }
      await page.locator('#packages .section-top button').click();
      check(`${lang} ${width}: comparison distinctions visible`, await page.locator('.comparison-column .scope-inheritance').count() === 3);
      await overflow(`${lang} ${width} comparison`);
      await close();
      if (width === 390) {
        for (const id of ['packages', 'about', 'partners', 'news']) {
          await page.locator(`#${id}`).scrollIntoViewIfNeeded();
          await page.screenshot({ path: `qa/content-${lang}-${id}-mobile.png` });
        }
        await page.locator('#partners button').click();
        check(`${lang}: complete network has thirty logos`, await page.locator('.modal .network-logo').count() === 30);
        check(`${lang}: all network images load`, await images());
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        audits.push({ lang, screen: 'partner dialog', violations: axe.violations });
        await overflow(`${lang} full partner dialog`);
        await close();
      }
    }
    await page.locator('.final-cta button').click();
    await page.locator('[name=name]').fill('QA Preview');
    await page.locator('[name=email]').fill('qa@example.com');
    await page.locator('[name=phone]').fill('+374 00 00 00 00');
    await page.locator('[name=package]').selectOption('Development Package');
    await page.locator('[name=message]').fill('QA draft only');
    check(`${lang}: enquiry fields validate`, await page.locator('form').evaluate(form => form.checkValidity()));
    check(`${lang}: email draft explanation is visible`, await page.locator('.form-note').isVisible());
    await close();
  }
  check('No resource or runtime errors', errors.length === 0);
  check('Partner dialogs pass WCAG checks', audits.every(a => a.violations.length === 0));
  console.log(JSON.stringify({ passed: checks.length, errors, audits }, null, 2));
} finally {
  await fs.writeFile('qa/content-results.json', JSON.stringify({ passed: checks.length, checks, errors, audits }, null, 2));
  await browser.close();
}
