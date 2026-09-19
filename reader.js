import {findPassage} from './passage.js';
const params=new URLSearchParams(location.search), english=params.get('lang')==='en';
const t=(sv,en)=>english?en:sv;
const $=id=>document.getElementById(id), status=$('reader-status');
document.documentElement.lang=english?'en':'sv';
$('back').textContent=t('← Till övningarna','← Back to practice');
$('original').textContent=t('Öppna PDF ↗','Open PDF ↗');
$('previous').ariaLabel=t('Föregående sida','Previous page');$('following').ariaLabel=t('Nästa sida','Next page');
$('jump').textContent=t('Visa texten','Show passage');$('excerpt-heading').textContent=t('Markerat utdrag','Highlighted passage');
status.textContent=t('Laddar PDF…','Loading PDF…');
if(innerWidth<=600)$('zoom').value='2';
let pdf,question,pageNumber=1,busy=false,resizeTimer;
function controls(){ $('previous').disabled=busy||!pdf||pageNumber<=1;$('following').disabled=busy||!pdf||pageNumber>=pdf.numPages;$('jump').disabled=busy||!question;$('zoom').disabled=busy; }
async function renderPage(jump=false) {
 if(busy)return;busy=true;controls();status.textContent=t('Laddar sidan…','Loading page…');
 try {
  const page=await pdf.getPage(pageNumber),base=page.getViewport({scale:1});
  const width=Math.min(960,$('page-scroll').clientWidth-6)*Number($('zoom').value),viewport=page.getViewport({scale:width/base.width});
  const canvas=$('pdf-canvas'),ratio=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.floor(viewport.width*ratio);canvas.height=Math.floor(viewport.height*ratio);canvas.style.width=`${viewport.width}px`;canvas.style.height=`${viewport.height}px`;
  $('pdf-page').style.width=`${viewport.width}px`;$('pdf-page').style.height=`${viewport.height}px`;
  $('highlights').replaceChildren();
  await page.render({canvasContext:canvas.getContext('2d'),viewport,transform:[ratio,0,0,ratio,0,0]}).promise;
  const content=await page.getTextContent();
  const ranges=question&&pageNumber===question.page?findPassage(content.items,question.excerpt.sv):[];
  const {Util}=await import('./vendor/pdfjs/pdf.mjs');
  const measure=document.createElement('canvas').getContext('2d');
  for(const range of ranges){
    const item=content.items[range.index],style=content.styles[item.fontName],tx=Util.transform(viewport.transform,item.transform),height=Math.hypot(tx[2],tx[3]);
    measure.font=`${height}px ${style.fontFamily}`;
    const full=measure.measureText(item.str).width||1,start=measure.measureText(item.str.slice(0,range.start)).width/full,end=measure.measureText(item.str.slice(0,range.end)).width/full;
    const mark=document.createElement('span');mark.className='passage-highlight';
    Object.assign(mark.style,{left:`${tx[4]+item.width*viewport.scale*start}px`,top:`${tx[5]-height*(style.ascent??.85)}px`,width:`${Math.max(2,item.width*viewport.scale*(end-start))}px`,height:`${height*1.15}px`});$('highlights').append(mark);
  }
  $('page-number').textContent=`${t('Sida','Page')} ${pageNumber} / ${pdf.numPages}`;
  canvas.ariaLabel=`Sverige i fokus, ${t('sida','page')} ${pageNumber}`;
  $('original').href=`./documents/sverige-i-fokus.pdf#page=${pageNumber}`;
  status.textContent=ranges.length?t('Texten är markerad i gult.','The passage is highlighted in yellow.'):question&&pageNumber===question.page?t('Kunde inte markera texten. Utdraget finns nedanför sidan.','The passage could not be highlighted. The excerpt is shown below the page.'):t('Läs vidare eller välj Visa texten för att återgå till utdraget.','Read on or choose Show passage to return to the excerpt.');
  if(jump&&ranges.length){
    const marks=[...$('highlights').children],left=Math.min(...marks.map(mark=>parseFloat(mark.style.left))),right=Math.max(...marks.map(mark=>parseFloat(mark.style.left)+parseFloat(mark.style.width)));
    marks[0].scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
    // Centre the entire multi-line passage, not a short fragment at a line end.
    $('page-scroll').scrollLeft=Math.max(0,(left+right-$('page-scroll').clientWidth)/2);
  }
  else if(jump)$('pdf-page').scrollIntoView({block:'start',behavior:'instant'});
 }catch(error){status.textContent=t('Kunde inte visa sidan. Använd länken Öppna PDF eller försök igen.','Could not display the page. Use Open PDF or try again.');console.error(error);}
 finally{busy=false;controls();}
}
try {
 const response=await fetch('./data/questions.json');if(!response.ok)throw new Error('Question bank unavailable');const questions=await response.json();
 question=questions.find(q=>q.id===params.get('question'));
 if(params.has('question')&&!question)throw new Error('Unknown question');
 const {getDocument,GlobalWorkerOptions}=await import('./vendor/pdfjs/pdf.mjs');
 GlobalWorkerOptions.workerSrc='./vendor/pdfjs/pdf.worker.mjs';
 pdf=await getDocument({url:'./documents/sverige-i-fokus.pdf',isEvalSupported:false,useWasm:false}).promise;
 pageNumber=question?.page||Math.max(1,Math.min(pdf.numPages,Number(params.get('page'))||1));
 if(question){$('reader-excerpt').hidden=false;$('quote').textContent=question.excerpt.sv;$('translation').textContent=question.excerpt.en;document.title=`Sverige i fokus · ${t('sida','page')} ${question.page}`;}
 $('reader-help').textContent=t('Den gula markeringen visar originaltexten som hör till quizfrågan. Bläddra för att läsa mer. Offlinevisning kräver att PDF-boken har sparats från appens startsida.','The yellow highlight shows the original text for the quiz question. Browse the pages to read more. Offline reading requires saving the PDF from the app’s home page.');
 await renderPage(true);
 $('previous').onclick=()=>{if(pageNumber>1){pageNumber--;renderPage(true);}};
 $('following').onclick=()=>{if(pageNumber<pdf.numPages){pageNumber++;renderPage(true);}};
 $('jump').onclick=()=>{pageNumber=question.page;renderPage(true);};
 $('zoom').onchange=()=>renderPage(true);
 window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>renderPage(false),180);});
 if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
}catch(error){status.textContent=t('Kunde inte öppna utdraget. Kontrollera länken och internetanslutningen. För offlinevisning: spara PDF-boken på startsidan medan du är online.','Could not open the passage. Check the link and internet connection. To read offline, save the PDF from the home page while online.');console.error(error);}
