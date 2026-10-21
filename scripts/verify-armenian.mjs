import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { catalog, readData, uiCatalog } from './localization-catalog.mjs';

const data = await readData();
const rows = [...catalog(data), ...uiCatalog()];
const checks=[], errors=[], screenshots=[], audits=[];
const check=(name,value)=>{assert.ok(value,name);checks.push(name);};
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const base=process.env.PREVIEW_URL || 'http://localhost:5173/';
const url=path=>new URL(path,base).href;
await fs.mkdir('qa/localization',{recursive:true});
const screenshot=async(name,locator=page)=>{const path=`qa/localization/${name}.png`;await locator.screenshot({path});screenshots.push(path);};
const audit=async name=>{const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();audits.push({name,violations:result.violations});check(`${name}: WCAG automation`,result.violations.length===0);};
const noOverflow=async name=>check(`${name}: no horizontal overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('dialog[open]')].every(d=>d.scrollWidth<=d.clientWidth+1)));
const close=async()=>{await page.locator('.modal .close-button').click();await page.locator('.modal').waitFor({state:'hidden'});};
// Proper names, file formats, color codes and identifiers are intentionally retained.
const allowed=/^D$|^Prospect$|Prospect24|PROSPECT24|DIGNISI|Dignisi|Garden Hill|Khachaturian|KHACHATURIAN|YouTube|APZ|EN|AM|JPG|PNG|WebP|AVIF|ZIP|JSON|Ctrl|Cmd|design\.json|px|vh|vw|^P$|^T$|^#[a-f0-9]+$/;
async function englishLeaks(root){return root.evaluate((el,pattern)=>{
  const allowed=new RegExp(pattern);const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const leaks=[];
  while(walker.nextNode()){const n=walker.currentNode;const text=n.textContent.trim();if(!text||!n.parentElement.checkVisibility()||n.parentElement.closest('style,script,textarea,[aria-hidden=true]'))continue;
    if(/^#[a-f0-9]{6}$/i.test(text))continue;
    const words=text.match(/[A-Za-z]+(?:[ -][A-Za-z]+)*/g)||[];
    if(words.some(word=>!allowed.test(word))&&!/[@]|https?:/.test(text))leaks.push(text);
  }return [...new Set(leaks)];
},allowed.source);}
try{
  check('Every catalog entry has a complete Armenian value',rows.every(r=>typeof r.am==='string'&&r.am.length>0));
  for(const p of data.packages){check(`${p.name}: scope arrays match`,p.scope.every(g=>g.items.length===g.hy.items.length));check(`${p.name}: comparison arrays match`,p.comparison.length===p.hy.comparison.length);}
  await page.goto(url('/?editorLanguage=am&theme=02'));await page.evaluate(()=>document.fonts.ready);
  check('Armenian HTML language',await page.locator('html').getAttribute('lang')==='hy');
  check('Armenian metadata',/[Ա-Ֆա-ֆ]/.test(await page.title())&&await page.locator('meta[name=description]').getAttribute('content')===data.translations.am.metaDescription);
  check('Armenian price grammar and fixed price distinction',await page.locator('.package-price').evaluateAll(es=>!es[0].textContent.includes('Սկսած')&&es[1].textContent.includes('Սկսած 4 800 000 դրամից')&&es[2].textContent.includes('Սկսած 11 200 000 դրամից')));
  check('Illustrative comparison accessible description',await page.locator('#hero-imagery-note').textContent()===data.translations.am.illustrative);
  for(const width of [1920,1440,1280,1024,850,768,700,650,600,390,375,320]){
    await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);
    await noOverflow(`Armenian ${width}`);
    check(`Armenian ${width}: heading lines fit`,await page.locator('.line-mask').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1)));
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await screenshot(`hy-${width}-hero`);
    for(const id of ['approach','packages','projects','news']){
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      if([1440,390].includes(width))await screenshot(`hy-${width}-${id}`);
    }
  }
  await page.setViewportSize({width:1440,height:900});
  check('Homepage contains no accidental English UI', (await englishLeaks(page.locator('main'))).length===0);
  await page.locator('.portfolio-pagination button').nth(1).click();
  await page.waitForFunction(() => document.querySelector('.project-card.active h3')?.textContent === 'Ավետ Ավետիսյան, 20');
  await page.waitForTimeout(150);
  const scroll=await page.evaluate(()=>scrollY);
  await page.locator('.header .language button').first().click();
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  check('Language switching preserves scroll',Math.abs(await page.evaluate(()=>scrollY)-scroll)<2);
  check('Language switching preserves selected project',await page.locator('.project-card.active h3').textContent()==='Avet Avetisyan, 20');
  check('Language switching preserves design',await page.locator('[data-preview-id]').getAttribute('data-preview-id')==='02');
  await page.locator('.project-card.active .portfolio-explore').click();
  // Native modal makes the header inert; invoke the existing language control directly.
  await page.locator('.header .language button').last().evaluate(el=>el.click());
  check('Open project dialog updates without closing',await page.locator('.modal').evaluate(el=>el.open)&&await page.locator('#modal-title').textContent()==='Ավետ Ավետիսյան, 20');
  await close();
  for(let i=0;i<3;i++){
    await page.locator('.package-card button').nth(i).click();
    check(`Package ${i+1}: every nested scope item rendered`,await page.locator('.scope-groups li').count()===data.packages[i].scope.reduce((n,g)=>n+g.items.length,0));
    check(`Package ${i+1}: no English UI`,(await englishLeaks(page.locator('.modal'))).length===0);
    await noOverflow(`Package ${i+1}`);await screenshot(`hy-package-${i+1}`,page.locator('.modal'));await close();
  }
  await page.locator('#packages .section-top button').click();await noOverflow('Comparison');await screenshot('hy-comparison',page.locator('.modal'));await close();
  await page.locator('.final-cta button').click();
  await page.locator('button[type=submit]').click();
  check('Required message localized',await page.locator('[name=name]').evaluate(e=>e.validationMessage)===data.translations.am.requiredField);
  await page.locator('[name=email]').fill('invalid');await page.locator('[name=email]').evaluate(e=>e.reportValidity());
  check('Email validation localized',await page.locator('[name=email]').evaluate(e=>e.validationMessage)===data.translations.am.invalidEmail);
  await page.locator('[name=name]').fill('Փորձնական անուն');await page.locator('[name=email]').fill('qa@example.com');await page.locator('[name=message]').fill('Փորձնական նախագիծ');
  await page.locator('.header .language button').first().evaluate(el=>el.click());
  check('Contact draft survives language switching',await page.locator('[name=message]').inputValue()==='Փորձնական նախագիծ');
  await page.locator('.header .language button').last().evaluate(el=>el.click());
  await screenshot('hy-contact',page.locator('.modal'));await audit('Armenian contact');await close();
  await page.getByRole('button',{name:'Միացնել խմբագրման ռեժիմը',exact:true}).click();await page.locator('iframe').waitFor();
  const frame=page.frames().find(f=>f.url().includes('editorCanvas=1'));await frame.locator('[data-edit-id="hero.heading"]').waitFor();
  await page.getByRole('button',{name:'Շերտեր',exact:true}).click();await page.locator('[data-layer-id="hero.heading"]').click();
  await page.getByLabel('Տեքստային բովանդակություն',{exact:true}).fill('Խմբագրված հայերեն վերնագիր');await page.getByLabel('Տեքստային բովանդակություն',{exact:true}).blur();
  await page.locator('#p24-copy-language').selectOption('en');await page.getByLabel('Text content',{exact:true}).fill('Edited English heading');await page.getByLabel('Text content',{exact:true}).blur();
  await page.locator('#p24-copy-language').selectOption('am');
  check('Editor keeps independent Armenian modifications',await frame.locator('[data-edit-id="hero.heading"]').textContent()==='Խմբագրված հայերեն վերնագիր');
  await page.getByRole('region',{name:'Դիզայնի խմբագրիչ',exact:true}).waitFor();
  check('Editor host follows canvas language',await page.locator('.p24-toolbar').getAttribute('aria-label')==='Դիզայնի խմբագրիչ');
  check('Editor properties contain no English UI',(await englishLeaks(page.locator('.p24-sidebar'))).length===0);
  await screenshot('hy-editor');await audit('Armenian editor');
  await page.getByRole('button',{name:'Շերտեր',exact:true}).click();await page.locator('[data-layer-id="hero.beforeImage"]').click();
  await page.getByRole('button',{name:'Ընտրել առկա պատկերներից',exact:true}).click();
  await screenshot('hy-editor-gallery');
  await page.getByRole('button',{name:'Փակել խմբագրիչը',exact:true}).click();
  check('Armenian editor modifications survive exit',await page.locator('[data-edit-id="hero.heading"]').textContent()==='Խմբագրված հայերեն վերնագիր');
  await page.goto(url('/design-preview/?editorLanguage=am'));await page.evaluate(()=>document.fonts.ready);
  check('Overview has six localized designs',await page.locator('.preview-overview-card').count()===6);
  check('Overview contains no accidental English UI',(await englishLeaks(page.locator('main'))).length===0);
  await screenshot('hy-overview');await noOverflow('Armenian overview');
  check('No resource or runtime errors',errors.length===0);
  console.log(JSON.stringify({passed:checks.length,catalogEntries:rows.length,errors},null,2));
}finally{
  await fs.writeFile('qa/localization/results.json',JSON.stringify({checks,errors,audits,screenshots},null,2));await browser.close();
}
