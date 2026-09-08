const CACHE_NAME = "lutfi-clicker-v4";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    // Yeni service worker beklemeden aktif olsun
    self.skipWaiting();
});


self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );

    // Yeni worker mevcut uygulamayı kontrol etsin
    self.clients.claim();
});


self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    const url = new URL(event.request.url);

    // Sadece Lütfi Clicker'ın kendi dosyalarını cache'le
    if (url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(

        fetch(event.request)
            .then(response => {

                if (response && response.ok) {

                    const responseClone =
                        response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });

                }

                return response;

            })
            .catch(() => {

                return caches.match(
                    event.request
                );

            })

    );

});