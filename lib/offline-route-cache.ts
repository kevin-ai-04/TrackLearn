"use client";

import { getOfflineRoutesForCourse } from "@/lib/offline-routes";
import type { OfflineCourseSnapshot } from "@/types/offline";

const SHELL_CACHE_NAME = "tracklearn-shell-v3";

function getCacheableAssetUrls(html: string) {
  const urls = new Set<string>();
  const attributePattern = /\b(?:href|src)="([^"]+)"/g;
  const nextStaticPattern = /\/_next\/static\/[^"')\s\\]+/g;

  for (const match of html.matchAll(attributePattern)) {
    urls.add(match[1]);
  }

  for (const match of html.matchAll(nextStaticPattern)) {
    urls.add(match[0]);
  }

  return [...urls].filter((url) => {
    if (url.startsWith("/_next/static/") || url === "/manifest.webmanifest") {
      return true;
    }

    return url.startsWith("/images/");
  });
}

async function cacheResponseAndAssets(cache: Cache, route: string) {
  const response = await fetch(route, {
    cache: "reload",
    credentials: "same-origin",
  });

  if (!response.ok) {
    return;
  }

  const copy = response.clone();
  await cache.put(route, response);

  const contentType = copy.headers.get("content-type") ?? "";

  if (!contentType.includes("text/html")) {
    return;
  }

  const html = await copy.text();
  const assetUrls = getCacheableAssetUrls(html);

  await Promise.all(
    assetUrls.map(async (assetUrl) => {
      try {
        const assetResponse = await fetch(assetUrl, {
          cache: "reload",
          credentials: "same-origin",
        });

        if (assetResponse.ok) {
          await cache.put(assetUrl, assetResponse);
        }
      } catch {
        // Missing non-critical assets should not prevent the course download.
      }
    }),
  );
}

export async function cacheOfflineRoutesForCourse(course: OfflineCourseSnapshot) {
  if (typeof window === "undefined" || !("caches" in window)) {
    return;
  }

  const cache = await window.caches.open(SHELL_CACHE_NAME);
  const routes = ["/library", ...getOfflineRoutesForCourse(course)];

  await Promise.all(
    routes.map(async (route) => {
      try {
        await cacheResponseAndAssets(cache, route);
      } catch {
        // The downloaded IndexedDB content is still valid if route shell caching fails.
      }
    }),
  );
}

export async function removeOfflineRoutesForCourse(course: OfflineCourseSnapshot) {
  if (typeof window === "undefined" || !("caches" in window)) {
    return;
  }

  const cache = await window.caches.open(SHELL_CACHE_NAME);
  await Promise.all(getOfflineRoutesForCourse(course).map((route) => cache.delete(route)));
}
