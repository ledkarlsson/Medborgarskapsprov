import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL||'msedge'});
const context=await browser.newContext({viewport:{width:1200,height:900}}),page=await context.newPage();
const base=process.env.TEST_URL||'http://127.0.0.1:4174/';const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(base);await page.locator('[data-set="0"]').click();await page.locator('[data-answer="0"]').click();
 const popupPromise=context.waitForEvent('page');await page.locator('.source-link').click();const reader=await popupPromise;
 await reader.waitForURL(/reader.html\?question=q/);await reader.locator('.passage-highlight').first().waitFor();
 assert.match(await reader.locator('#reader-status').innerText(),/markerad/);
 const box=await reader.locator('.passage-highlight').first().boundingBox();assert.ok(box.y>=0&&box.y<900);
 await reader.screenshot({path:'tmp/reader-desktop.png'});
 const all=await reader.evaluate(async()=>{
  const {getDocument,GlobalWorkerOptions}=await import('./vendor/pdfjs/pdf.mjs');GlobalWorkerOptions.workerSrc='./vendor/pdfjs/pdf.worker.mjs';
  const {findPassage}=await import('./passage.js'),questions=await (await fetch('./data/questions.json')).json();
  const task=getDocument({url:'./documents/sverige-i-fokus.pdf',useWasm:false}),pdf=await task.promise;const pages=new Map(),missing=[];
  for(const q of questions){if(!pages.has(q.page))pages.set(q.page,await (await pdf.getPage(q.page)).getTextContent());if(!findPassage(pages.get(q.page).items,q.excerpt.sv).length)missing.push(q.id);}
  await task.destroy();return {count:questions.length,missing};
 });assert.equal(all.count,100);assert.deepEqual(all.missing,[]);
 await reader.locator('#following').click();await reader.waitForFunction(()=>!document.querySelector('#jump').disabled);assert.equal(await reader.locator('.passage-highlight').count(),0);
 await reader.locator('#jump').click();await reader.locator('.passage-highlight').first().waitFor();
 await reader.setViewportSize({width:390,height:844});await reader.reload();await reader.locator('.passage-highlight').first().waitFor();assert.equal(await reader.locator('#zoom').inputValue(),'2');await reader.waitForFunction(()=>!document.querySelector('#jump').disabled);
 assert.ok(await reader.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await reader.screenshot({path:'tmp/reader-mobile.png'});
 await reader.locator('#zoom').selectOption('1.5');await reader.waitForFunction(()=>!document.querySelector('#jump').disabled);assert.ok(await reader.locator('.passage-highlight').count()>0);
 await page.locator('[data-action="home"]').click();await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await page.locator('[data-action="cache-pdf"]').click();await page.getByText('PDF-boken är sparad för offlinebruk.').waitFor();
 await context.setOffline(true);await reader.reload();await reader.locator('.passage-highlight').first().waitFor();assert.match(await reader.locator('#reader-status').innerText(),/markerad/);
 await context.setOffline(false);await reader.goto(base+'reader.html?question=unknown');await reader.getByText(/Kunde inte öppna utdraget/).waitFor();
 assert.deepEqual(errors,[]);console.log('Reader verified: all 100 passages matched, quiz link opens target, highlight scrolled into view, page controls, mobile, zoom, offline PDF, invalid-link recovery.');
}finally{await browser.close();}
