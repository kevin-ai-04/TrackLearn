"use client";

const OFFLINE_APP_ASSETS = ["/offline/index.html", "/offline/offline-app.js", "/manifest.webmanifest"];

export async function warmOfflineAppCache() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  registration.active?.postMessage({
    type: "TRACKLEARN_CACHE_OFFLINE_APP",
  });

  await Promise.allSettled(
    OFFLINE_APP_ASSETS.map((assetPath) =>
      fetch(assetPath, {
        credentials: "same-origin",
        cache: "reload",
      }),
    ),
  );
}
