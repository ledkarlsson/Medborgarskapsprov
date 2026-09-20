const CACHE = 'medborgarskapsprov-app-v3';
const DOCS = 'medborgarskapsprov-documents-v1';
const ASSETS = ['./','./index.html','./styles.css','./app.js','./quiz.js','./reader.html','./reader.js','./reader.css','./passage.js','./vendor/pdfjs/pdf.mjs','./vendor/pdfjs/pdf.worker.mjs','./data/questions.json','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil((async()=>{for(const name of await caches.keys()){if(name.startsWith('medborgarskapsprov-app-') && name!==CACHE)await caches.delete(name);}await self.clients.claim();})()));
self.addEventListener('fetch', event => {
 const request = event.request, url = new URL(request.url);
 if(request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope))return;
 event.respondWith((async()=>{
  if(url.pathname.endsWith('.pdf')) {
   const cached=await (await caches.open(DOCS)).match(url.pathname);
   if(cached) {
    const range=request.headers.get('range');
    if(range) { const bytes=await cached.arrayBuffer(),match=/^bytes=(\d+)-(\d*)$/.exec(range);if(match){const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),bytes.byteLength-1):bytes.byteLength-1;if(start>end||start>=bytes.byteLength)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':'application/pdf','Content-Range':`bytes ${start}-${end}/${bytes.byteLength}`,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});}}
    return cached;
   }
   return fetch(request);
  }
  const cache=await caches.open(CACHE), cached=await cache.match(request,{ignoreSearch:true});
  if(cached)return cached;
  try{return await fetch(request);}catch(error){if(request.mode==='navigate')return (await cache.match('./index.html'));throw error;}
 })());
});
