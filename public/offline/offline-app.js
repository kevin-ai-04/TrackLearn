(function () {
  "use strict";

  var DATABASE_NAME = "tracklearn-offline";
  var DATABASE_VERSION = 1;
  var COURSE_STORE = "courses";
  var COURSE_INDEX_KEY = "tracklearn.offline-courses.index.v1";
  var COURSE_RECORD_PREFIX = "tracklearn.offline-courses.record.v1:";
  var HISTORY_KEY = "tracklearn.study-history.v1";
  var MAX_RECENT_ACTIVITY = 24;
  var state = {
    courses: [],
    loaded: false,
    selection: readSelection(),
    history: loadHistory(),
  };
  var visitedThisSession = new Set();

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function normalizeSlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function moduleKey(subjectSlug, moduleSlug) {
    return subjectSlug + "::" + normalizeSlug(moduleSlug);
  }

  function createEmptyHistory() {
    return {
      version: 1,
      preferences: { theme: "light", font: "outfit", offlineSupport: false },
      modules: {},
      recentActivity: [],
    };
  }

  function loadHistory() {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      var fallback = createEmptyHistory();

      if (!parsed || typeof parsed !== "object") return fallback;

      return {
        version: 1,
        preferences: {
          theme: ["light", "dark", "reading"].indexOf(parsed.preferences && parsed.preferences.theme) >= 0
            ? parsed.preferences.theme
            : fallback.preferences.theme,
          font: ["outfit", "serif"].indexOf(parsed.preferences && parsed.preferences.font) >= 0
            ? parsed.preferences.font
            : fallback.preferences.font,
          offlineSupport:
            parsed.preferences && typeof parsed.preferences.offlineSupport === "boolean"
              ? parsed.preferences.offlineSupport
              : fallback.preferences.offlineSupport,
        },
        modules: parsed.modules && typeof parsed.modules === "object" ? parsed.modules : {},
        recentActivity: Array.isArray(parsed.recentActivity) ? parsed.recentActivity.slice(0, MAX_RECENT_ACTIVITY) : [],
      };
    } catch (error) {
      return createEmptyHistory();
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
    } catch (error) {}
  }

  function applyPreferences() {
    document.documentElement.dataset.theme = state.history.preferences.theme || "light";
    document.documentElement.dataset.font = state.history.preferences.font || "outfit";
  }

  function cycleTheme() {
    var current = state.history.preferences.theme;
    state.history.preferences.theme = current === "light" ? "dark" : current === "dark" ? "reading" : "light";
    saveHistory();
    applyPreferences();
  }

  function toggleFont() {
    state.history.preferences.font = state.history.preferences.font === "serif" ? "outfit" : "serif";
    saveHistory();
    applyPreferences();
  }

  function setOnlineStatus(message) {
    var status = document.getElementById("online-status");
    if (status) status.textContent = message || "";
  }

  async function goOnline() {
    var button = document.getElementById("go-online");
    var originalLabel = button ? button.textContent : "";

    if (button) {
      button.disabled = true;
      button.textContent = "Checking...";
    }
    setOnlineStatus("");

    try {
      var response = await fetch("/api/health?source=offline-app&ts=" + Date.now(), {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("TrackLearn is not reachable.");
      }

      window.location.assign("/home");
    } catch (error) {
      setOnlineStatus("Still offline");
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel || "Go online";
      }
    }
  }

  function readLocalCourseIndex() {
    try {
      var parsed = JSON.parse(localStorage.getItem(COURSE_INDEX_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter(function (item) { return typeof item === "string"; }) : [];
    } catch (error) {
      return [];
    }
  }

  function localRecords() {
    return readLocalCourseIndex().reduce(function (records, subjectId) {
      try {
        var raw = localStorage.getItem(COURSE_RECORD_PREFIX + subjectId);
        if (raw) records.push(JSON.parse(raw));
      } catch (error) {}
      return records;
    }, []);
  }

  function indexedDbRecords() {
    return new Promise(function (resolve) {
      if (!("indexedDB" in window)) {
        resolve([]);
        return;
      }

      var request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onerror = function () { resolve([]); };
      request.onblocked = function () { resolve([]); };
      request.onupgradeneeded = function () {
        var database = request.result;
        if (!database.objectStoreNames.contains(COURSE_STORE)) {
          database.createObjectStore(COURSE_STORE, { keyPath: "subject.id" });
        }
      };
      request.onsuccess = function () {
        var database = request.result;

        try {
          var transaction = database.transaction(COURSE_STORE, "readonly");
          var getAll = transaction.objectStore(COURSE_STORE).getAll();
          getAll.onsuccess = function () { resolve(getAll.result || []); };
          getAll.onerror = function () { resolve([]); };
          transaction.oncomplete = function () { database.close(); };
          transaction.onerror = function () {
            database.close();
            resolve([]);
          };
        } catch (error) {
          database.close();
          resolve([]);
        }
      };
    });
  }

  function withTimeout(promise, fallback, delay) {
    return new Promise(function (resolve) {
      var settled = false;
      var timer = setTimeout(function () {
        if (!settled) {
          settled = true;
          resolve(fallback);
        }
      }, delay);

      promise.then(
        function (value) {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(value);
          }
        },
        function () {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(fallback);
          }
        },
      );
    });
  }

  async function loadCourses() {
    var indexedRecords = await withTimeout(indexedDbRecords(), [], 2500);
    var merged = new Map();

    indexedRecords.concat(localRecords()).forEach(function (record) {
      if (record && record.subject && record.subject.id) {
        merged.set(record.subject.id, record);
      }
    });

    state.courses = Array.from(merged.values());
    state.loaded = true;
    render();
  }

  function readSelection() {
    var hash = window.location.hash.replace(/^#\/?/, "");
    var parts = hash.split("/").filter(Boolean);

    return {
      subjectId: parts[0],
      kind: parts[1] === "modules" || parts[1] === "materials" ? parts[1] : undefined,
      slug: parts[2],
    };
  }

  function setSelection(subjectId, kind, slug) {
    window.location.hash = [subjectId, kind, slug].filter(Boolean).join("/");
  }

  function clearSelection() {
    history.pushState(null, "", "/offline");
    state.selection = {};
    render();
  }

  function selectedRecord() {
    return state.selection.subjectId
      ? state.courses.find(function (record) { return record.subject.id === state.selection.subjectId; }) || null
      : null;
  }

  function currentModuleRecord(subject, module) {
    return state.history.modules[moduleKey(subject.routeSegment, module.slug)];
  }

  function mergeRecentActivity(entry) {
    var byKey = new Map();

    [entry].concat(state.history.recentActivity || []).forEach(function (item) {
      var key = item.subjectSlug + "::" + item.moduleSlug;
      if (!byKey.has(key)) byKey.set(key, item);
    });

    state.history.recentActivity = Array.from(byKey.values())
      .sort(function (left, right) { return String(right.visitedAt).localeCompare(String(left.visitedAt)); })
      .slice(0, MAX_RECENT_ACTIVITY);
  }

  function markVisited(subject, module) {
    var key = moduleKey(subject.routeSegment, module.slug);

    if (visitedThisSession.has(key)) {
      return;
    }

    visitedThisSession.add(key);

    var now = new Date().toISOString();
    var current = state.history.modules[key] || {};

    state.history.modules[key] = {
      subjectSlug: subject.routeSegment,
      moduleSlug: normalizeSlug(module.slug),
      subjectTitle: subject.title,
      moduleTitle: module.title,
      visited: true,
      visitCount: (current.visitCount || 0) + 1,
      lastVisitedAt: now,
      done: Boolean(current.done),
      doneUpdatedAt: current.doneUpdatedAt || null,
      needsRevision: Boolean(current.needsRevision),
      needsRevisionUpdatedAt: current.needsRevisionUpdatedAt || null,
    };
    mergeRecentActivity({
      subjectSlug: subject.routeSegment,
      moduleSlug: normalizeSlug(module.slug),
      subjectTitle: subject.title,
      moduleTitle: module.title,
      visitedAt: now,
    });
    saveHistory();
  }

  function toggleModuleField(subject, module, field) {
    var key = moduleKey(subject.routeSegment, module.slug);
    var current = state.history.modules[key] || {
      subjectSlug: subject.routeSegment,
      moduleSlug: normalizeSlug(module.slug),
      subjectTitle: subject.title,
      moduleTitle: module.title,
      visited: false,
      visitCount: 0,
      lastVisitedAt: null,
      done: false,
      doneUpdatedAt: null,
      needsRevision: false,
      needsRevisionUpdatedAt: null,
    };
    var next = Object.assign({}, current);
    var now = new Date().toISOString();

    next[field] = !next[field];
    next[field + "UpdatedAt"] = now;
    state.history.modules[key] = next;
    saveHistory();
    render();
  }

  function formatCount(count, label) {
    return count + " " + label + (count === 1 ? "" : "s");
  }

  function renderMarkdown(markdown) {
    var html = [];
    var lines = String(markdown || "").split("\n");
    var inList = false;

    function closeList() {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
    }

    lines.forEach(function (line) {
      var trimmed = line.trim();

      if (!trimmed) {
        closeList();
        return;
      }

      if (/^###\s+/.test(trimmed)) {
        closeList();
        html.push("<h3>" + escapeHtml(trimmed.replace(/^###\s+/, "")) + "</h3>");
      } else if (/^##\s+/.test(trimmed)) {
        closeList();
        html.push("<h2>" + escapeHtml(trimmed.replace(/^##\s+/, "")) + "</h2>");
      } else if (/^#\s+/.test(trimmed)) {
        closeList();
        html.push("<h1>" + escapeHtml(trimmed.replace(/^#\s+/, "")) + "</h1>");
      } else if (/^[-*]\s+/.test(trimmed)) {
        if (!inList) {
          html.push("<ul>");
          inList = true;
        }
        html.push("<li>" + escapeHtml(trimmed.replace(/^[-*]\s+/, "")) + "</li>");
      } else {
        closeList();
        html.push("<p>" + escapeHtml(trimmed) + "</p>");
      }
    });

    closeList();
    return html.join("");
  }

  function renderSidebar(subject) {
    if (!subject) return "";

    var entries = subject.materials.concat(subject.modules);

    return [
      '<aside class="panel sidebar">',
      '<p class="eyebrow">Current Path</p>',
      '<h2 style="margin-top:10px">' + escapeHtml(subject.title) + "</h2>",
      '<div class="sidebar-section">',
      '<button class="side-link' + (!state.selection.kind ? " active" : "") + '" data-open-course="' + escapeHtml(subject.id) + '">Course overview</button>',
      entries.map(function (entry) {
        var active = state.selection.kind === (entry.kind === "module" ? "modules" : "materials") && state.selection.slug === entry.slug;
        return '<button class="side-link' + (active ? " active" : "") + '" data-open="' + (entry.kind === "module" ? "modules" : "materials") + '" data-slug="' + escapeHtml(entry.slug) + '">' +
          '<strong>' + escapeHtml(entry.title) + '</strong><br><span class="muted">' + escapeHtml(entry.kind) + '</span></button>';
      }).join(""),
      "</div>",
      "</aside>",
    ].join("");
  }

  function renderLayout(content, subject) {
    var layout = document.getElementById("layout");
    layout.className = "layout" + (subject ? " with-sidebar" : "");
    layout.innerHTML = renderSidebar(subject) + '<main class="main" id="main">' + content + "</main>";
  }

  function renderList() {
    var content = [
      '<section class="panel hero">',
      '<p class="eyebrow">Offline Library</p>',
      "<h1>Downloaded courses</h1>",
      '<p class="muted">These courses are stored on this device and open without the TrackLearn server.</p>',
      "</section>",
      '<section class="grid">',
      state.courses.map(function (record) {
        var subject = record.subject;
        return '<article class="card">' +
          '<div class="row"><div><p class="eyebrow">Downloaded</p><h2 style="margin-top:12px">' + escapeHtml(subject.title) + '</h2></div><span class="status-pill status-offline">Offline</span></div>' +
          (subject.description ? '<p class="muted">' + escapeHtml(subject.description) + '</p>' : "") +
          '<p class="muted">' + formatCount(subject.modules.length, "module") + " - " + formatCount(subject.materials.length, "material") + "</p>" +
          '<div class="module-actions"><button class="button-primary" data-open-course="' + escapeHtml(subject.id) + '">Open</button></div>' +
          "</article>";
      }).join(""),
      "</section>",
      !state.courses.length ? '<section class="panel hero"><p class="muted">No downloaded courses are stored on this device.</p></section>' : "",
    ].join("");

    renderLayout(content, null);
  }

  function renderCourse(subject) {
    var content = [
      '<section class="panel hero">',
      '<p class="eyebrow">Course Overview</p>',
      "<h1>" + escapeHtml(subject.title) + "</h1>",
      subject.description ? '<p class="muted">' + escapeHtml(subject.description) + "</p>" : "",
      '<p class="muted">This downloaded copy contains ' + formatCount(subject.materials.length, "material") + " and " + formatCount(subject.modules.length, "module") + ".</p>",
      "</section>",
      subject.materials.length ? '<section class="stack"><div class="row"><p class="eyebrow">Materials</p><span class="muted">' + formatCount(subject.materials.length, "material") + '</span></div><div class="grid">' +
        subject.materials.map(function (material) { return entryCard(material, "materials"); }).join("") +
        "</div></section>" : "",
      '<section class="stack"><div class="row"><p class="eyebrow">Modules</p><span class="muted">' + formatCount(subject.modules.length, "module") + '</span></div><div class="grid">' +
        subject.modules.map(function (module) { return entryCard(module, "modules", subject); }).join("") +
        "</div></section>",
    ].join("");

    renderLayout(content, subject);
  }

  function entryCard(entry, kind, subject) {
    var record = subject && entry.kind === "module" ? currentModuleRecord(subject, entry) : null;
    var badges = record && (record.done || record.needsRevision)
      ? '<div>' + (record.done ? '<span class="status-pill status-done">Done</span> ' : "") + (record.needsRevision ? '<span class="status-pill status-revise">Revise</span>' : "") + "</div>"
      : '<span class="muted">' + formatCount(entry.headings.length, "section") + "</span>";

    return '<button class="card" data-open="' + kind + '" data-slug="' + escapeHtml(entry.slug) + '">' +
      '<div class="row"><p class="eyebrow">' + (kind === "modules" ? "Module" : "Material") + "</p>" + badges + "</div>" +
      '<h2 style="margin-top:12px">' + escapeHtml(entry.title) + "</h2>" +
      (entry.description ? '<p class="muted">' + escapeHtml(entry.description) + "</p>" : "") +
      '<p class="muted">Open ' + (kind === "modules" ? "module" : "material") + "</p>" +
      "</button>";
  }

  function renderModule(subject, module) {
    markVisited(subject, module);
    var index = subject.modules.findIndex(function (item) { return item.slug === module.slug; });
    var previous = index > 0 ? subject.modules[index - 1] : null;
    var next = index < subject.modules.length - 1 ? subject.modules[index + 1] : null;
    var record = currentModuleRecord(subject, module) || {};

    var content = [
      '<section class="panel hero">',
      '<p class="muted"><button class="button-secondary" data-open-course="' + escapeHtml(subject.id) + '">Course overview</button></p>',
      "<h1>" + escapeHtml(module.title) + "</h1>",
      module.description ? '<p class="muted">' + escapeHtml(module.description) + "</p>" : "",
      '<div class="module-actions">',
      '<button class="' + (record.done ? "button-primary" : "button-secondary") + '" data-toggle="done">' + (record.done ? "Marked Done" : "Mark as Done") + "</button>",
      '<button class="' + (record.needsRevision ? "button-primary" : "button-secondary") + '" data-toggle="needsRevision">' + (record.needsRevision ? "Needs Revision" : "Flag Revision") + "</button>",
      "</div>",
      previous || next ? '<div class="grid" style="margin-top:20px">' +
        (previous ? '<button class="card" data-open="modules" data-slug="' + escapeHtml(previous.slug) + '"><p class="eyebrow">Previous</p><h2>' + escapeHtml(previous.title) + "</h2></button>" : "<span></span>") +
        (next ? '<button class="card" data-open="modules" data-slug="' + escapeHtml(next.slug) + '"><p class="eyebrow">Next</p><h2>' + escapeHtml(next.title) + "</h2></button>" : "") +
        "</div>" : "",
      "</section>",
      '<article class="panel markdown-body">' + renderMarkdown(module.content) + "</article>",
    ].join("");

    renderLayout(content, subject);
  }

  function renderMaterial(subject, material) {
    var content = [
      '<section class="panel hero">',
      '<p class="eyebrow">Material</p>',
      "<h1>" + escapeHtml(material.title) + "</h1>",
      material.description ? '<p class="muted">' + escapeHtml(material.description) + "</p>" : "",
      '<p class="muted">External links in this material open in a new tab.</p>',
      "</section>",
      '<article class="panel markdown-body">' + renderMarkdown(material.content) + "</article>",
    ].join("");

    renderLayout(content, subject);
  }

  function renderMissing() {
    renderLayout(
      '<section class="panel hero"><p class="eyebrow">Offline Library</p><h1>Course is not downloaded</h1><p class="muted">Download this course from your library before opening it offline.</p><button class="button-primary" data-clear>Downloaded Courses</button></section>',
      null,
    );
  }

  function render() {
    applyPreferences();

    if (!state.loaded) {
      renderLayout('<section class="panel hero"><p class="eyebrow">Offline Library</p><h1>Loading downloaded courses...</h1><p class="muted">Opening local device storage.</p></section>', null);
      return;
    }

    var record = selectedRecord();

    if (!state.selection.subjectId) {
      renderList();
      return;
    }

    if (!record) {
      renderMissing();
      return;
    }

    var subject = record.subject;

    if (state.selection.kind === "modules" && state.selection.slug) {
      var module = subject.modules.find(function (item) { return item.slug === state.selection.slug; });
      module ? renderModule(subject, module) : renderCourse(subject);
      return;
    }

    if (state.selection.kind === "materials" && state.selection.slug) {
      var material = subject.materials.find(function (item) { return item.slug === state.selection.slug; });
      material ? renderMaterial(subject, material) : renderCourse(subject);
      return;
    }

    renderCourse(subject);
  }

  document.addEventListener("click", function (event) {
    var target = event.target.closest("button, a");
    var record = selectedRecord();

    if (!target) return;

    if (target.id === "theme-toggle") {
      cycleTheme();
      target.textContent = state.history.preferences.theme === "light" ? "L" : state.history.preferences.theme === "dark" ? "D" : "R";
      return;
    }

    if (target.id === "font-toggle") {
      toggleFont();
      return;
    }

    if (target.id === "go-online") {
      goOnline();
      return;
    }

    if (target.dataset.clear !== undefined) {
      clearSelection();
      return;
    }

    if (target.dataset.openCourse) {
      setSelection(target.dataset.openCourse);
      return;
    }

    if (target.dataset.open && target.dataset.slug && record) {
      setSelection(record.subject.id, target.dataset.open, target.dataset.slug);
      return;
    }

    if (target.dataset.toggle && record) {
      var subject = record.subject;
      var module = subject.modules.find(function (item) { return item.slug === state.selection.slug; });
      if (module) toggleModuleField(subject, module, target.dataset.toggle);
    }
  });

  window.addEventListener("hashchange", function () {
    state.selection = readSelection();
    render();
  });

  document.getElementById("theme-toggle").textContent = state.history.preferences.theme === "light" ? "L" : state.history.preferences.theme === "dark" ? "D" : "R";
  document.getElementById("font-toggle").style.fontFamily = state.history.preferences.font === "serif" ? "Georgia, serif" : "inherit";
  applyPreferences();
  render();
  loadCourses();
})();
