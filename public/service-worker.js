(()=>{let a=[],e="";a=["/index.html","/apple-touch-icon.c01138b4.png","/favicon-32x32.2e94acaf.png","/favicon-16x16.2e12dc9f.png","/site.webmanifest","/android-chrome-192x192.f1de1cb4.png","/android-chrome-256x256.5767cc7f.png","/icon-512x512.a77e75db.png","/safari-pinned-tab.a6149b94.svg","/avatar-264x264.314ea29a.webp","/index.24e4d3f9.css","/index.0a7ac879.js"],e="10d5a616",addEventListener("install",(n=>n.waitUntil(async function(){const n=await caches.open(e);await n.addAll(a)}()))),addEventListener("activate",(a=>a.waitUntil(async function(){const a=await caches.keys();await Promise.all(a.map((a=>a!==e&&caches.delete(a))))}()))),addEventListener("fetch",(()=>{}))})();
//# sourceMappingURL=service-worker.js.map
