import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [], checks = [];
const url = process.env.PREVIEW_URL || 'http://localhost:5173/';
await fs.mkdir('qa', { recursive: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => errors.push(e.message));
page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
const check = (name, value) => { assert.ok(value, name); checks.push(name); };
const pause = ms => page.waitForTimeout(ms);
async function close() { await page.locator('.modal .close-button').click(); await pause(400); check('Dialog closes', !(await page.locator('.modal').evaluate(el => el.open))); }
async function overflow(label) { check(`No horizontal overflow: ${label}`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); }
async function revealAll() { const height=await page.evaluate(()=>document.documentElement.scrollHeight); for(let y=0;y<height;y+=450) {await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await pause(100);} await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'})); await pause(1100); }

try {
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await pause(1900);
  check('Cinematic hero entrance', await page.locator('.hero').evaluate(el => el.classList.contains('ready')));
  const slider = page.getByRole('slider');
  await slider.focus(); await page.keyboard.press('ArrowRight');
  check('Comparison keyboard arrows', await slider.getAttribute('aria-valuenow') === '52');
  const box = await slider.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2); await page.mouse.down(); await page.mouse.move(1000,450,{steps:12}); await page.mouse.up();
  check('Comparison mouse dragging', Number(await slider.getAttribute('aria-valuenow')) > 65);
  await page.mouse.click(1100,300);
  check('Comparison click positioning', Number(await slider.getAttribute('aria-valuenow')) > 74);
  await slider.focus(); await page.keyboard.press('Home'); check('Comparison Home key',await slider.getAttribute('aria-valuenow')==='4');
  await page.keyboard.press('End'); check('Comparison End key',await slider.getAttribute('aria-valuenow')==='96');
  await page.keyboard.press('Home'); for(let i=0;i<23;i++) await page.keyboard.press('ArrowRight');
  await page.locator('.desktop-nav a').filter({hasText: /^About$/}).click(); await pause(1000);
  check('About navigation scrolls to introduction', Math.abs(await page.locator('#approach').evaluate(el=>el.getBoundingClientRect().top)-await page.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)))<10);
  check('Header changes on scroll', await page.locator('.header').evaluate(el=>el.classList.contains('scrolled')));
  await page.locator('.desktop-nav a').filter({hasText: /^Services$/}).click(); await pause(1000);
  await page.locator('.service-trigger').nth(2).hover(); await pause(600);
  check('Service rows remain revealed after selection',await page.locator('.service').evaluateAll(els=>els.every(el=>getComputedStyle(el).opacity==='1')));
  check('Service hover changes image', await page.locator('.service-visual>img.active').getAttribute('src') === '/images/finance.webp');
  await page.locator('#packages').scrollIntoViewIfNeeded(); await pause(900);
  await page.getByRole('button',{name:'Compare Packages',exact:true}).click();
  check('Dialog close glyph renders correctly',await page.locator('.modal .close-button').textContent()==='×');
  check('Package comparison opens all three options', await page.locator('.modal[open] .comparison-column').count()===3);
  await page.keyboard.press('Escape'); await pause(400);
  check('Escape closes dialog', !(await page.locator('.modal').evaluate(el=>el.open)));
  for(let i=0;i<3;i++) { await page.locator('.package-card button').nth(i).click(); check(`Package ${i+1} details`,await page.locator('.modal').evaluate(el=>el.open)); await close(); }
  await page.locator('#projects').scrollIntoViewIfNeeded(); await pause(900);
  await page.getByRole('button',{name:'Next project',exact:true}).click(); await pause(900);
  check('Project next navigation', (await page.locator('.project-info h3').textContent()).includes('Avet'));
  await page.locator('.project-stage').focus(); await page.keyboard.press('ArrowRight'); await pause(900);
  check('Project keyboard navigation',(await page.locator('.project-info h3').textContent()).includes('Khachaturian'));
  await page.getByRole('button',{name:'Previous project',exact:true}).click(); await pause(900);
  await page.getByRole('button',{name:'Explore Project',exact:true}).click();
  check('Project preview opens',await page.locator('.modal #modal-title').textContent()==='Avet Avetisyan 20');
  await page.mouse.click(5,5); await pause(400);
  check('Outside click closes dialog',!(await page.locator('.modal').evaluate(el=>el.open)));
  await page.locator('#process').scrollIntoViewIfNeeded(); await pause(400);
  check('Process scroll progress',Number(await page.locator('#process').evaluate(el=>el.style.getPropertyValue('--progress')))>0);
  await page.locator('.final-cta button').click();
  check('CTA opens contact',await page.locator('.modal form').count()===1);
  await page.locator('.modal button[type=submit]').click();
  check('Contact validates required fields', await page.locator('.modal input[name=name]').evaluate(el=>!el.validity.valid));
  await close();
  await page.locator('.footer-legal button').first().click(); check('Privacy details',await page.locator('#modal-title').textContent()==='Privacy Policy'); await close();
  await page.locator('.footer-legal button').last().click(); check('Terms details',await page.locator('#modal-title').textContent()==='Terms of Use'); await close();
  await page.locator('.header .language button').last().click();
  check('AM switch changes visible content',await page.locator('h1').textContent()!=='BUILD WITHVISION.INVEST WITHCLARITY.');
  check('AM switch changes document language',await page.locator('html').getAttribute('lang')==='hy');
  await overflow('Armenian desktop');
  await page.locator('.header .language button').first().click();

  for(const [name,width,height] of [['desktop',1440,900],['large-desktop',1920,1080],['tablet',768,1024],['mobile',390,844]]) {
    await page.setViewportSize({width,height}); await revealAll(); await overflow(name);
    check(`Headline lines do not wrap at ${name}`, await page.locator('h1 .line-mask>span').evaluateAll(els=>els.every(el=>el.getBoundingClientRect().height<parseFloat(getComputedStyle(el).fontSize)*1.4)));
    await page.screenshot({path:`qa/${name}.png`});
    await page.screenshot({path:`qa/${name}-full.png`,fullPage:true});
    const sources=await page.locator('img').evaluateAll(els=>[...new Set(els.map(el=>el.src))]); const responses=await Promise.all(sources.map(src=>page.request.get(src))); check(`No broken image sources at ${name}`,responses.every(r=>r.ok()));
  }
  await page.locator('.menu-toggle').click(); await pause(650);
  check('Mobile menu opens',await page.locator('.mobile-menu').evaluate(el=>el.open));
  check('Background scrolling locked',await page.evaluate(()=>document.body.style.overflow==='hidden'));
  await page.screenshot({path:'qa/mobile-menu.png'});
  await page.locator('.mobile-menu .language button').last().click(); check('Mobile language switch',await page.locator('html').getAttribute('lang')==='hy');
  await page.locator('.mobile-menu .language button').first().click();
  await page.locator('.mobile-menu nav a').nth(1).click(); await pause(1300);
  check('Mobile menu links navigate and close',!(await page.locator('.mobile-menu').evaluate(el=>el.open))&&Math.abs(await page.locator('#packages').evaluate(el=>el.getBoundingClientRect().top)-await page.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)))<10);
  await page.locator('.menu-toggle').click(); await pause(650); await page.keyboard.press('Escape'); await pause(400);
  check('Mobile menu Escape',!(await page.locator('.mobile-menu').evaluate(el=>el.open)));
  await page.locator('#development').scrollIntoViewIfNeeded(); await pause(500);
  await page.locator('.service-trigger').nth(1).click(); await pause(500);
  check('Mobile service accordion expands',await page.locator('.service-trigger').nth(1).getAttribute('aria-expanded')==='true');
  check('Mobile accordion minus glyph',await page.locator('.service').nth(1).locator('.accordion-mark').textContent()==='−');
  check('Expanded mobile service stays visible',await page.locator('.service').nth(1).evaluate(el=>getComputedStyle(el).opacity==='1'));
  check('Mobile accordion image visible',await page.locator('#service-1 img').isVisible());
  check('Other accordion closes',await page.locator('.service-trigger').nth(0).getAttribute('aria-expanded')==='false');
  await page.screenshot({path:'qa/mobile-services.png'});
  await page.locator('.service-trigger').nth(1).click(); await pause(500); check('Accordion collapses',await page.locator('.service-trigger').nth(1).getAttribute('aria-expanded')==='false');
  await page.locator('#packages button').first().click(); await pause(450); await page.screenshot({path:'qa/mobile-comparison.png'}); await overflow('mobile comparison'); await close();
  await page.locator('#projects').scrollIntoViewIfNeeded(); await pause(700);
  const before=await page.locator('.project-info h3').textContent();
  const projectRect=await page.locator('.project-stage').boundingBox(); const touch=await page.context().newCDPSession(page); await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:310,y:projectRect.y+150}]}); await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:70,y:projectRect.y+150}]}); await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await touch.detach(); await pause(900);
  check('Project swipe',await page.locator('.project-info h3').textContent()!==before);
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'})); await pause(700);
  const mobileSlider=await slider.boundingBox();
  await page.context().newCDPSession(page).then(async cdp=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:mobileSlider.x+22,y:mobileSlider.y+22}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:300,y:mobileSlider.y+22}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();});
  check('Comparison real touch dragging',Number(await slider.getAttribute('aria-valuenow'))>70);
  for(const width of [375,430]) { await page.setViewportSize({width,height:844}); await overflow(`${width}px mobile`); }
  await page.emulateMedia({reducedMotion:'reduce'}); await page.reload(); await pause(1000);
  check('Reduced motion shows content',await page.locator('.intro .reveal').first().evaluate(el=>getComputedStyle(el).opacity==='1'));
  check('Reduced motion disables intensive animation',await page.locator('.hero-visual').evaluate(el=>parseFloat(getComputedStyle(el).animationDuration)<.01));
  check('No garbled typography',await page.locator('body').evaluate(el=>!/[\u0400-\u04ff]/.test(el.textContent)));
  check('No console or resource errors',errors.length===0);
  await fs.writeFile('qa/results.json',JSON.stringify({passed:checks.length,checks,errors},null,2));
  console.log(JSON.stringify({passed:checks.length,errors,screenshots:'qa/'},null,2));
} catch(e) { console.error(e); await page.screenshot({path:'qa/failure.png',fullPage:true}); await fs.writeFile('qa/results.json',JSON.stringify({passed:checks.length,checks,errors,failure:e.message},null,2)); process.exitCode=1; }
finally { await browser.close(); }
