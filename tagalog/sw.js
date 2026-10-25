/* Service worker: caches the app shell and all Tagalog audio clips.
   Bump CACHE_VERSION whenever you replace an MP3 or change index.html. */
const CACHE_VERSION = "v2";
const CACHE = "tagalog-adventure-" + CACHE_VERSION;

const AUDIO = [
  "kumusta","magandang_umaga","salamat","paalam","oo","hindi",
  "nanay","tatay","kuya","ate","lola","lolo",
  "isa","dalawa","tatlo","apat","lima","anim","pito","walo","siyam","sampu",
  "aso","pusa","ibon","isda","baboy","manok",
  "kanin","tubig","gulay","prutas","itlog","tinapay",
  "pula","asul","dilaw","berde","puti","itim"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Each add is wrapped so one missing clip doesn't fail the whole install.
    await cache.add("./").catch(() => {});
    await Promise.all(
      AUDIO.map((f) => cache.add("audio/" + f + ".mp3").catch(() => {}))
    );
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k.startsWith("tagalog-adventure-") && k !== CACHE)
          .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// Safari requests audio with Range headers and needs a 206 back.
async function rangeResponse(request, response) {
  const range = request.headers.get("range");
  if (!range) return response;
  const m = /bytes=(\d+)-(\d*)/.exec(range);
  if (!m) return response;
  const buf = await response.arrayBuffer();
  const start = Number(m[1]);
  const end = m[2] ? Math.min(Number(m[2]), buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "audio/mpeg",
      "Content-Range": "bytes " + start + "-" + end + "/" + buf.byteLength,
      "Content-Length": String(end - start + 1)
    }
  });
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Audio: cache-first, fetch the full file once and keep it.
  if (url.pathname.includes("/audio/")) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      let res = await cache.match(url.pathname);
      if (!res) {
        try {
          const net = await fetch(url.pathname);
          if (!net.ok) return net;
          await cache.put(url.pathname, net.clone());
          res = net;
        } catch (e) {
          return new Response("", { status: 504 });
        }
      }
      return rangeResponse(req, res.clone());
    })());
    return;
  }

  // Everything else (the page itself): network-first, cache as offline fallback.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const net = await fetch(req);
      if (net.ok) cache.put(req, net.clone());
      return net;
    } catch (e) {
      const hit = await cache.match(req, { ignoreSearch: true });
      return hit || (await cache.match("./")) || new Response("Offline", { status: 503 });
    }
  })());
});
