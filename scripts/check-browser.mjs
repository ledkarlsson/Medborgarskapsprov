// Optional end-to-end check. Install Playwright separately or set PLAYWRIGHT_PATH.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PATH || 'playwright');
const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || 'msedge'});
const context=await browser.newContext({viewport:{width:1440,height:1100}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');await page.locator('[data-set="0"]').waitFor();
await page.screenshot({path:'tmp/home-desktop.png',fullPage:true});
await page.locator('[data-set="0"]').click();
for(let i=0;i<10;i++){
  const qBefore=await page.locator('.question-card h1').innerText();
  await page.locator('.question-meta [data-lang="en"]').click();
  assert.notEqual(await page.locator('.question-card h1').innerText(),qBefore);
  await page.locator('[data-answer="0"]').click();
  await page.locator('.feedback').waitFor();
  assert.equal(await page.locator('.excerpts [lang="sv"]').count(),1);
  if(i===0){await page.screenshot({path:'tmp/feedback-desktop.png',fullPage:true});await page.reload();await page.locator('[data-action="resume"]').click();assert.equal(await page.locator('.feedback').count(),1);}
  await page.locator('.question-meta [data-lang="sv"]').click();
  await page.locator('[data-action="next"]').click();
}
assert.equal(await page.locator('.score-circle strong').innerText(),'10/10');
assert.equal(await page.locator('.review').count(),10);
await page.locator('.review summary').first().click();
assert.match(await page.locator('.review .source-link').first().getAttribute('href'),/^\.\/reader\.html\?question=q\d{3}&lang=sv$/);
await page.screenshot({path:'tmp/results-desktop.png',fullPage:true});
await page.locator('[data-action="home"]').click();
await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
await page.reload();
await page.locator('[data-action="cache-pdf"]').click();
await page.getByText('PDF-boken är sparad för offlinebruk.').waitFor();
await context.setOffline(true);await page.reload();await page.locator('[data-action="random"]').click();await page.locator('[data-answer="1"]').click();
assert.equal(await page.locator('.feedback.negative').count(),1);
const pdf=await page.evaluate(async()=>{const r=await fetch('./documents/sverige-i-fokus.pdf',{headers:{Range:'bytes=0-19'}});return {status:r.status,length:(await r.arrayBuffer()).byteLength};});assert.equal(pdf.status,206);assert.equal(pdf.length,20);
await context.setOffline(false);await page.locator('[data-action="home"]').click();
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'tmp/home-mobile.png',fullPage:true});
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await page.locator('[data-action="resume"]').click();await page.screenshot({path:'tmp/feedback-mobile.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
assert.deepEqual(errors,[]);await browser.close();console.log('Browser checks passed: complete quiz, switching, reload/resume, score/review, offline app/PDF ranges, mobile overflow, no JS errors.');
