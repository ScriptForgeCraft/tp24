import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
const errors = [], requests = [];
page.on('pageerror', e => errors.push(e.message));
page.on('request', r => { if (/^https?:/.test(r.url())) requests.push(r.url()); });
try {
  await page.goto(pathToFileURL(path.resolve('output/Prospect24-Preview.html')).href);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('.header .logo img').evaluate(el=>el.complete&&el.naturalWidth===700),true);
  await page.waitForTimeout(200);
  await page.screenshot({path:'qa/client-hero-desktop.png'});
  await page.locator('#packages').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  assert.equal(await page.locator('.package-card .package-photo').count(),3);
  assert.equal(await page.locator('.package-photo').evaluateAll(els=>els.every(el=>el.complete&&el.naturalWidth>0)),true);
  await page.locator('#packages').screenshot({path:'qa/client-packages-desktop.png'});
  await page.locator('.package-card button').first().click();
  assert.equal(await page.locator('.modal').evaluate(el=>el.open),true);
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  assert.equal(await page.locator('.footer-wordmark text').textContent(),'PROSPECT24');
  assert.equal(await page.locator('.footer-wordmark svg').evaluate(el=>{const t=el.querySelector('text').getBBox(),v=el.viewBox.baseVal;return t.x>=v.x&&t.x+t.width<=v.x+v.width+1&&t.y>=v.y&&t.y+t.height<=v.y+v.height+1;}),true);
  await page.locator('#contact').screenshot({path:'qa/client-footer-desktop.png'});
  for(const width of [1440,768,390,375,430]) {
    await page.setViewportSize({width,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Overflow at ${width}`);
  }
  await page.setViewportSize({width:390,height:844});
  await page.locator('#home').scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
  await page.screenshot({path:'qa/client-hero-mobile.png'});
  await page.locator('#packages').scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
  await page.locator('#packages').screenshot({path:'qa/client-packages-mobile.png'});
  await page.locator('#contact').scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
  await page.locator('#contact').screenshot({path:'qa/client-footer-mobile.png'});
  assert.deepEqual(errors,[]); assert.deepEqual(requests,[]);
  const result={status:'passed',portableHtml:true,networkRequests:requests.length,errors,checks:['Supplied logo loads','All three architectural card backgrounds load','Package details work offline','Footer wordmark fits its bounds','No overflow at all requested widths','Fonts and images bundled locally']};
  await fs.writeFile('qa/presentation-results.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
} finally { await browser.close(); }
