
// service worker

this.addEventListener('install', (e) => {

   e.waitUntil(
      caches.open('{{version}}')
         .then((cache) => cache.addAll(JSON.parse('{{{files.js}}}').map(path => `/{{pkg.version}}/${path}`)))
         .catch(() => {
            this.registration.unregister();
         })
   );

});
