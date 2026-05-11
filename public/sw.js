const CACHE_NAME = "tracklearn-shell-v5";
const SHELL_URLS = ["/", "/home", "/library/offline", "/manifest.webmanifest"];

function htmlResponse(markup) {
  return new Response(markup, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function fallbackStyles() {
  return `
    :root { color-scheme: light; --surface:#f8fafc; --panel:#ffffff; --panel-alt:#f1f5f9; --border:#dbe3ef; --text:#0f172a; --muted:#64748b; --accent:#2563eb; --accent-soft:#dbeafe; --warn:#92400e; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    :root[data-theme="dark"] { color-scheme: dark; --surface:#0f172a; --panel:#111c2f; --panel-alt:#0b1220; --border:#263449; --text:#e2e8f0; --muted:#94a3b8; --accent:#60a5fa; --accent-soft:#1e3a8a55; --warn:#fbbf24; }
    :root[data-theme="reading"] { --surface:#f7f1e8; --panel:#fffaf2; --panel-alt:#f1e7d8; --border:#ddcbb2; --text:#1f2933; --muted:#6b5f50; --accent:#2563eb; --accent-soft:#dbeafe; --warn:#92400e; }
    * { box-sizing: border-box; }
    body { margin:0; min-height:100vh; background:var(--surface); color:var(--text); }
    a { color:inherit; text-decoration:none; }
    .topbar { position:sticky; top:0; z-index:10; border-bottom:1px solid var(--border); background:color-mix(in srgb,var(--surface) 90%,transparent); backdrop-filter:blur(12px); }
    .topbar-inner { max-width:1600px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 20px; }
    .brand { display:flex; align-items:center; gap:10px; font-size:18px; font-weight:750; letter-spacing:-.01em; }
    .top-actions { display:flex; align-items:center; gap:8px; }
    .offline-pill, .status-pill { border:1px solid #f59e0b66; border-radius:999px; background:#f59e0b22; color:var(--warn); font-size:12px; font-weight:800; padding:4px 10px; }
    button, .button { border:1px solid var(--border); border-radius:999px; background:var(--panel); color:var(--text); cursor:pointer; font:inherit; font-weight:700; padding:10px 14px; }
    button:hover, .button:hover { border-color:var(--accent); }
    .primary { border-color:var(--accent); background:var(--accent); color:#fff; }
    .icon-button { width:42px; height:42px; display:inline-flex; align-items:center; justify-content:center; padding:0; }
    .theme-group { display:flex; gap:6px; border:1px solid var(--border); border-radius:999px; background:var(--panel); padding:4px; }
    .theme-group button { width:36px; height:36px; padding:0; }
    .shell { max-width:1600px; margin:0 auto; display:grid; grid-template-columns:340px minmax(0,1fr); gap:20px; padding:20px; }
    .panel { border:1px solid var(--border); border-radius:12px; background:var(--panel); box-shadow:0 12px 40px rgba(15,23,42,.08); padding:24px; }
    .sidebar { position:sticky; top:82px; max-height:calc(100vh - 104px); overflow:auto; }
    .sidebar-title { color:var(--muted); font-size:12px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; }
    .side-list { display:grid; gap:8px; margin-top:16px; }
    .side-item { width:100%; border-radius:10px; text-align:left; background:var(--panel-alt); }
    .side-item.active { border-color:var(--accent); background:var(--accent-soft); }
    .main { min-width:0; display:grid; gap:16px; }
    .eyebrow { color:var(--muted); font-size:12px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; }
    h1 { margin:10px 0 0; font-size:clamp(30px,4vw,44px); letter-spacing:-.02em; }
    h2 { margin:0; font-size:24px; }
    .muted { color:var(--muted); line-height:1.65; }
    .grid { display:grid; gap:16px; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); }
    .card { text-align:left; border-radius:12px; padding:22px; background:var(--panel); }
    .row { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
    .actions { display:flex; flex-wrap:wrap; gap:10px; margin-top:18px; }
    .content { line-height:1.75; }
    .content h1, .content h2, .content h3 { margin-top:1.4em; }
    .content p { margin:1em 0; }
    .content pre { white-space:pre-wrap; border:1px solid var(--border); border-radius:10px; background:var(--panel-alt); padding:16px; overflow:auto; }
    @media (max-width: 900px) { .shell { grid-template-columns:1fr; } .sidebar { position:static; max-height:none; } .theme-group { display:none; } }
  `;
}

function offlineHomeResponse() {
  return htmlResponse(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TrackLearn Offline</title>
  <style>${fallbackStyles()}</style>
</head>
<body>
  <header class="topbar">
    <div class="topbar-inner">
      <div class="brand">TrackLearn <span class="offline-pill">Offline</span></div>
      <div class="top-actions">
        <a class="button" href="/settings">Settings</a>
        <div class="theme-group" aria-label="Display mode">
          <button data-theme="light">L</button><button data-theme="dark">D</button><button data-theme="reading">R</button>
        </div>
      </div>
    </div>
  </header>
  <main class="shell">
    <aside class="panel sidebar">
      <p class="sidebar-title">Offline</p>
      <div class="side-list">
        <a class="button side-item active" href="/library/offline">Downloaded Courses</a>
      </div>
    </aside>
    <section class="main">
      <div class="panel">
        <p class="eyebrow">Offline</p>
        <h1>You are currently offline.</h1>
        <p class="muted">The app server is not reachable. Downloaded courses can still be opened from this device.</p>
        <div class="actions"><a class="button primary" href="/library/offline">View downloaded courses</a></div>
      </div>
    </section>
  </main>
  <script>${themeScript()}</script>
</body>
</html>`);
}

function themeScript() {
  return `
    function setTheme(theme) {
      document.documentElement.dataset.theme = theme;
      try {
        const key = "tracklearn.study-history.v1";
        const state = JSON.parse(localStorage.getItem(key) || "{}");
        state.version = state.version || 1;
        state.preferences = state.preferences || {};
        state.preferences.theme = theme;
        localStorage.setItem(key, JSON.stringify(state));
      } catch {}
    }
    try {
      const state = JSON.parse(localStorage.getItem("tracklearn.study-history.v1") || "{}");
      if (state.preferences && state.preferences.theme) document.documentElement.dataset.theme = state.preferences.theme;
    } catch {}
    document.addEventListener("click", (event) => {
      const target = event.target.closest("[data-theme]");
      if (target) setTheme(target.dataset.theme);
    });
  `;
}

function offlineLibraryResponse() {
  return htmlResponse(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TrackLearn Offline Library</title>
  <style>${fallbackStyles()}</style>
</head>
<body>
  <header class="topbar">
    <div class="topbar-inner">
      <div class="brand">TrackLearn <span class="offline-pill">Offline</span></div>
      <div class="top-actions">
        <a class="button" href="/settings">Settings</a>
        <div class="theme-group" aria-label="Display mode">
          <button data-theme="light">L</button><button data-theme="dark">D</button><button data-theme="reading">R</button>
        </div>
      </div>
    </div>
  </header>
  <main class="shell">
    <aside class="panel sidebar" id="sidebar">
      <p class="sidebar-title">Downloaded Courses</p>
      <div class="side-list"><p class="muted">Loading...</p></div>
    </aside>
    <section class="main" id="app">
      <div class="panel"><h1>Downloaded courses</h1><p class="muted">Loading downloaded courses...</p></div>
    </section>
  </main>
  <script>
    ${themeScript()}
    const INDEX_KEY = "tracklearn.offline-courses.index.v1";
    const PREFIX = "tracklearn.offline-courses.record.v1:";
    const app = document.getElementById("app");
    const sidebar = document.getElementById("sidebar");

    function escapeHtml(value) {
      return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
    }

    function localRecords() {
      try {
        const ids = JSON.parse(localStorage.getItem(INDEX_KEY) || "[]");
        if (!Array.isArray(ids)) return [];
        return ids.flatMap((id) => {
          try {
            const raw = localStorage.getItem(PREFIX + id);
            return raw ? [JSON.parse(raw)] : [];
          } catch { return []; }
        });
      } catch { return []; }
    }

    function indexedDbRecords() {
      return new Promise((resolve) => {
        if (!("indexedDB" in window)) { resolve([]); return; }
        const request = indexedDB.open("tracklearn-offline", 1);
        request.onerror = () => resolve([]);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains("courses")) db.createObjectStore("courses", { keyPath: "subject.id" });
        };
        request.onsuccess = () => {
          const db = request.result;
          try {
            const tx = db.transaction("courses", "readonly");
            const getAll = tx.objectStore("courses").getAll();
            getAll.onsuccess = () => resolve(getAll.result || []);
            getAll.onerror = () => resolve([]);
            tx.oncomplete = () => db.close();
          } catch {
            db.close();
            resolve([]);
          }
        };
      });
    }

    async function getRecords() {
      const records = [...await indexedDbRecords(), ...localRecords()];
      return [...new Map(records.map((record) => [record.subject.id, record])).values()];
    }

    function getSelection() {
      const value = location.hash.replace(/^#course=/, "");
      const [subjectId, kind, slug] = value.split("/");
      return subjectId ? { subjectId, kind, slug } : null;
    }

    function setSelection(subjectId, kind, slug) {
      location.hash = "course=" + [subjectId, kind, slug].filter(Boolean).join("/");
    }

    function renderMarkdown(markdown) {
      const lines = String(markdown || "").split("\\n");
      return lines.map((line) => {
        if (line.startsWith("### ")) return "<h3>" + escapeHtml(line.slice(4)) + "</h3>";
        if (line.startsWith("## ")) return "<h2>" + escapeHtml(line.slice(3)) + "</h2>";
        if (line.startsWith("# ")) return "<h1>" + escapeHtml(line.slice(2)) + "</h1>";
        if (line.trim() === "") return "";
        return "<p>" + escapeHtml(line) + "</p>";
      }).join("");
    }

    function renderSidebar(records, selection) {
      sidebar.innerHTML = \`
        <p class="sidebar-title">Downloaded Courses</p>
        <div class="side-list">
          <button class="side-item \${selection ? "" : "active"}" data-back>All Downloaded Courses</button>
          \${records.map((record) => \`
            <button class="side-item \${selection && selection.subjectId === record.subject.id ? "active" : ""}" data-course="\${escapeHtml(record.subject.id)}">
              <strong>\${escapeHtml(record.subject.title)}</strong><br><span class="muted">\${record.subject.modules.length} modules</span>
            </button>
          \`).join("")}
        </div>
      \`;
    }

    function renderList(records) {
      app.innerHTML = \`
        <section class="panel">
          <p class="eyebrow">Offline Library</p>
          <h1>Downloaded courses</h1>
          <p class="muted">These courses are stored on this device for offline reading.</p>
        </section>
        <section class="grid">
          \${records.map((record) => \`
            <article class="panel">
              <div class="row"><h2>\${escapeHtml(record.subject.title)}</h2><span class="status-pill">Offline</span></div>
              \${record.subject.description ? \`<p class="muted">\${escapeHtml(record.subject.description)}</p>\` : ""}
              <p class="muted">\${record.subject.modules.length} modules - \${record.subject.materials.length} materials</p>
              <div class="actions"><button class="primary" data-course="\${escapeHtml(record.subject.id)}">Open</button></div>
            </article>
          \`).join("")}
        </section>
        \${records.length ? "" : \`<section class="panel"><p class="muted">No downloaded courses are stored on this device.</p></section>\`}
      \`;
    }

    function renderCourse(record, selection) {
      const subject = record.subject;
      const module = selection.kind === "modules" && selection.slug ? subject.modules.find((item) => item.slug === selection.slug) : null;
      const material = selection.kind === "materials" && selection.slug ? subject.materials.find((item) => item.slug === selection.slug) : null;
      const entry = module || material;

      if (entry) {
        app.innerHTML = \`
          <button data-course="\${escapeHtml(subject.id)}">Downloaded Course</button>
          <section class="panel">
            <p class="eyebrow">\${module ? "Module" : "Material"}</p>
            <h1>\${escapeHtml(entry.title)}</h1>
            \${entry.description ? \`<p class="muted">\${escapeHtml(entry.description)}</p>\` : ""}
          </section>
          <article class="panel content">\${renderMarkdown(entry.content)}</article>
        \`;
        return;
      }

      app.innerHTML = \`
        <button data-back>Downloaded Courses</button>
        <section class="panel">
          <p class="eyebrow">Downloaded Course</p>
          <h1>\${escapeHtml(subject.title)}</h1>
          \${subject.description ? \`<p class="muted">\${escapeHtml(subject.description)}</p>\` : ""}
        </section>
        \${subject.materials.length ? \`<section class="panel"><p class="eyebrow">Materials</p><div class="grid">\${subject.materials.map((item) => \`<button class="card" data-course="\${escapeHtml(subject.id)}" data-kind="materials" data-slug="\${escapeHtml(item.slug)}">\${escapeHtml(item.title)}</button>\`).join("")}</div></section>\` : ""}
        <section class="panel"><p class="eyebrow">Modules</p><div class="grid">\${subject.modules.map((item) => \`<button class="card" data-course="\${escapeHtml(subject.id)}" data-kind="modules" data-slug="\${escapeHtml(item.slug)}">\${escapeHtml(item.title)}</button>\`).join("")}</div></section>
      \`;
    }

    async function render() {
      const records = await getRecords();
      const selection = getSelection();
      renderSidebar(records, selection);
      const record = selection ? records.find((item) => item.subject.id === selection.subjectId) : null;
      if (record) renderCourse(record, selection);
      else renderList(records);
    }

    document.addEventListener("click", (event) => {
      const target = event.target.closest("button");
      if (!target) return;
      if (target.dataset.back !== undefined) {
        history.pushState(null, "", "/library/offline");
        render();
        return;
      }
      if (target.dataset.course) setSelection(target.dataset.course, target.dataset.kind, target.dataset.slug);
    });
    window.addEventListener("hashchange", render);
    render();
  </script>
</body>
</html>`);
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

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          if (url.pathname === "/library" || url.pathname.startsWith("/library/offline")) {
            return offlineLibraryResponse();
          }
          if (url.pathname === "/" || url.pathname === "/home") {
            return offlineHomeResponse();
          }
          return offlineHomeResponse();
        }),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request)
            .then((response) => {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
              return response;
            })
            .catch(() => {
              const contentType = url.pathname.endsWith(".css")
                ? "text/css; charset=utf-8"
                : "application/javascript; charset=utf-8";
              return new Response("", {
                status: 200,
                headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
              });
            }),
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
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => new Response("", { status: 504 })),
    ),
  );
});
