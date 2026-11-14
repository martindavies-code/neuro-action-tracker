// Generated after build with a complete, revision-specific app shell.
const CACHE='rhythmquest-8181ab3571d1';
const FILES=["assets/CommandPalette-B0WsHjC-.js","assets/ProgressDashboard-C-Qqmgvo.js","assets/SettingsPanel-D-P9jwSh.js","assets/TaskModal-skRthoAx.js","assets/TaskSpinner-Bxf4bwd9.js","assets/XpRoadmapModal-DPUL6Yln.js","assets/font-0-RvljkFvg.woff2","assets/font-1-B6JQhE1e.woff2","assets/font-2-ci0D1wrL.woff2","assets/font-3-DdQaqQDo.woff2","assets/font-4-Bc-8i84L.woff2","assets/index-CZjf6kX0.css","assets/index-DStC7Mit.js","assets/noto-sans-kr-7nqAdetQ.woff2","assets/rolldown-runtime-CbXtAM7H.js","assets/vendor-confetti-Uxh4CK4s.js","assets/vendor-icons-CLZCz_UJ.js","favicon.svg","icon-192.svg","icon-512.svg","icons.svg","index.html","manifest.json"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(x=>new URL(x,self.registration.scope).href)))));
self.addEventListener('message',event=>{if(event.data==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(x=>x.startsWith('rhythmquest-')&&x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  if(event.request.mode==='navigate')return (await cache.match(new URL('index.html',self.registration.scope).href))||fetch(event.request);
  return (await cache.match(event.request))||fetch(event.request);
 }));
});
