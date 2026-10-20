import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await page.goto(pathToFileURL(path.resolve('output/Prospect24-Preview.html')).href);
await page.evaluate(()=>document.fonts.ready);
for(const [name,width,height] of [['Desktop',1440,900],['Mobile',390,844]]) {
 await page.setViewportSize({width,height});
 for(const section of await page.locator('main>section,footer').all()){await section.scrollIntoViewIfNeeded();await page.waitForTimeout(100);}
 await page.locator('#home').scrollIntoViewIfNeeded();await page.waitForTimeout(300);
 await page.screenshot({path:`output/Preview-${name}.jpg`,fullPage:true,type:'jpeg',quality:92});
}
await browser.close();
console.log('Desktop and mobile presentation images saved.');
