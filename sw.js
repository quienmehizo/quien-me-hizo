// Service worker: la app abre rápido y el modo solo funciona sin internet.
const CACHE="qmh-v2";
const CORE=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png","./apple-touch-icon.png","./icon-maskable-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=="GET")return;
  // Página: primero la red (para recibir actualizaciones), si no hay internet, la copia guardada.
  if(r.mode==="navigate"){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put("./index.html",cp));return res}).catch(()=>caches.match("./index.html")));
    return;
  }
  // Archivos propios y librería de Firebase: copia guardada al instante y se actualiza en segundo plano.
  if(u.origin===location.origin||u.hostname==="www.gstatic.com"){
    e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(hit=>{
      const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>hit);
      return hit||net;
    })));
  }
  // Todo lo demás (la conexión en tiempo real con Firebase) pasa directo.
});
