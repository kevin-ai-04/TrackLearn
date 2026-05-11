const CACHE_NAME = "tracklearn-shell-v3";
const DATABASE_NAME = "tracklearn-offline";
const DATABASE_VERSION = 1;
const SHELL_PATHS = ["/"];

function openOfflineDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains("settings")) {
        database.createObjectStore("settings", { keyPath: "key" });
      }

      if (!database.objectStoreNames.contains("courses")) {
        database.createObjectStore("courses", { keyPath: "id" });
      }

      if (!database.objectStoreNames.contains("progressQueue")) {
        const store = database.createObjectStore("progressQueue", { keyPath: "id" });
        store.createIndex("clientCreatedAt", "clientCreatedAt");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function listDownloadedCourses() {
  const database = await openOfflineDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction("courses", "readonly");
    const request = transaction.objectStore("courses").getAll();

    request.onsuccess = () => {
      database.close();
      resolve(request.result || []);
    };
    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

function offlineCourseHref(course) {
  return course.offlineHref || `/offline/courses/${course.id}`;
}

function offlineModuleHref(course, moduleSlug) {
  return `/offline/courses/${course.id}/${moduleSlug}`;
}

function offlineMaterialHref(course, materialSlug) {
  return `/offline/courses/${course.id}/materials/${materialSlug}`;
}

async function getOfflineRedirectPath(pathname) {
  if (pathname.startsWith("/offline/") || pathname.startsWith("/api/")) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  if (!segments.length) {
    return null;
  }

  const courses = await listDownloadedCourses();

  if (segments[0] === "library" && segments[1] === "subjects" && segments[2]) {
    const personalCourse = courses.find(
      (course) => course.source === "personal" && course.id === segments[2],
    );

    return personalCourse ? offlineCourseHref(personalCourse) : null;
  }

  const course = courses.find((item) => item.routeSegment === segments[0]);

  if (!course) {
    return null;
  }

  if (segments.length === 1) {
    return offlineCourseHref(course);
  }

  if (segments.length === 2 && course.modules.some((module) => module.slug === segments[1])) {
    return offlineModuleHref(course, segments[1]);
  }

  if (
    segments.length === 3 &&
    segments[1] === "materials" &&
    course.materials.some((material) => material.slug === segments[2])
  ) {
    return offlineMaterialHref(course, segments[2]);
  }

  return null;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_PATHS))
      .catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
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

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname === "/api/auth/get-session" && request.method === "GET") {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response("null", {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }),
      ),
    );
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  if (url.pathname === "/favicon.ico") {
    event.respondWith(fetch(request).catch(() => new Response(null, { status: 204 })));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const redirectPath = await getOfflineRedirectPath(url.pathname).catch(() => null);

          if (redirectPath) {
            return Response.redirect(redirectPath, 302);
          }

          return (
            (await caches.match(request)) ??
            (await caches.match(url.pathname)) ??
            (await caches.match("/library")) ??
            (await caches.match("/"))
          );
        }),
    );
    return;
  }

  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (response.ok && (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/images/"))) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }

          return response;
        })
        .catch(() => {
          if (url.searchParams.has("_rsc")) {
            return new Response("", {
              status: 204,
              headers: {
                "Content-Type": "text/x-component",
              },
            });
          }

          return new Response(null, { status: 504 });
        });
    }),
  );
});
