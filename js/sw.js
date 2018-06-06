const staticCacheName = 'cache-v1';

self.addEventListener('fetch', function(event) {
    event.respondWith(
        new Response('Hello World', {
            headers: {'foo': 'bar'}
        })
    );
    console.log(event.request);
});
