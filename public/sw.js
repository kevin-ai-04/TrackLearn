const CACHE_NAME = "tracklearn-shell-v7";
const OFFLINE_NAVIGATION_PATHS = ["/offline", "/library/offline"];
const OFFLINE_APP_URL = "/offline/index.html";
const OFFLINE_APP_ASSETS = [OFFLINE_APP_URL, "/offline/offline-app.js", "/manifest.webmanifest"];
const SHELL_URLS = ["/", "/home", ...OFFLINE_APP_ASSETS];

function htmlResponse(markup) {
  return new Response(markup, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function offlineMessageResponse() {
  return htmlResponse(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TrackLearn Offline</title>
  <style>
    :root { color-scheme: light; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#f8fafc; color:#0f172a; }
    body { margin:0; min-height:100vh; display:grid; place-items:center; padding:24px; }
    main { max-width:640px; border:1px solid #dbe3ef; border-radius:16px; background:white; padding:32px; box-shadow:0 18px 60px rgba(15,23,42,.1); }
    h1 { margin:0; font-size:32px; letter-spacing:0; }
    p { color:#64748b; line-height:1.65; }
  </style>
</head>
<body>
  <main>
    <h1>TrackLearn offline reader is not cached yet.</h1>
    <p>Turn on Offline Support while online so the offline reader can be saved to this device.</p>
  </main>
</body>
</html>`);
}

async function cacheResponse(request, response) {
  if (!response || !response.ok) {
    return;
  }

  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function cacheOfflineApp() {
  const cache = await caches.open(CACHE_NAME);

  await Promise.allSettled(
    OFFLINE_APP_ASSETS.map(async (path) => {
      const request = new Request(new URL(path, self.location.origin), {
        credentials: "same-origin",
      });
      const response = await fetch(request);
      await cache.put(request, response);
    }),
  );
}

async function offlineAppResponse() {
  const cache = await caches.open(CACHE_NAME);
  const request = new Request(new URL(OFFLINE_APP_URL, self.location.origin), {
    credentials: "same-origin",
  });

  try {
    const response = await fetch(request);
    await cacheResponse(request, response);
    return response;
  } catch {
    return (await cache.match(request)) ?? offlineMessageResponse();
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (
    event.data?.type !== "TRACKLEARN_CACHE_OFFLINE_APP" &&
    event.data?.type !== "TRACKLEARN_CACHE_OFFLINE_ROUTES"
  ) {
    return;
  }

  event.waitUntil(cacheOfflineApp());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    if (
      OFFLINE_NAVIGATION_PATHS.includes(url.pathname) ||
      url.pathname.startsWith("/library/offline/")
    ) {
      event.respondWith(offlineAppResponse());
      return;
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          cacheResponse(request, response);
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached ?? offlineMessageResponse())),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/offline/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request)
            .then((response) => {
              cacheResponse(request, response);
              return response;
            })
            .catch(() => new Response("", { status: 504 })),
      ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request)
          .then((response) => {
            cacheResponse(request, response);
            return response;
          })
          .catch(() => new Response("", { status: 504 })),
    ),
  );
});
