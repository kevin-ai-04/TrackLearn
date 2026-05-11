"use client";

import type { OfflineCourseSnapshot, OfflineProgressMutation } from "@/types/offline";

const DATABASE_NAME = "tracklearn-offline";
const DATABASE_VERSION = 1;
const SETTINGS_KEY = "offline-support";
const DEVICE_KEY = "tracklearn.offline-device-id.v1";

type StoreName = "settings" | "courses" | "progressQueue";

interface OfflineSettingRecord {
  key: typeof SETTINGS_KEY;
  enabled: boolean;
}

function supportsIndexedDB() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getOfflineDeviceId() {
  if (typeof window === "undefined") {
    return "server";
  }

  try {
    const existing = window.localStorage.getItem(DEVICE_KEY);
    if (existing) {
      return existing;
    }

    const nextId = createId();
    window.localStorage.setItem(DEVICE_KEY, nextId);
    return nextId;
  } catch {
    return createId();
  }
}

function openOfflineDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!supportsIndexedDB()) {
      reject(new Error("IndexedDB is not supported."));
      return;
    }

    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

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
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));
  });
}

async function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>,
) {
  const database = await openOfflineDatabase();

  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    let settled = false;

    transaction.oncomplete = () => {
      database.close();
    };
    transaction.onerror = () => {
      database.close();
      if (!settled) {
        settled = true;
        reject(transaction.error ?? new Error("IndexedDB transaction failed."));
      }
    };

    try {
      const result = operation(store);

      if (result instanceof IDBRequest) {
        result.onsuccess = () => {
          if (!settled) {
            settled = true;
            resolve(result.result);
          }
        };
        result.onerror = () => {
          if (!settled) {
            settled = true;
            reject(result.error ?? new Error("IndexedDB request failed."));
          }
        };
        return;
      }

      Promise.resolve(result)
        .then((value) => {
          if (!settled) {
            settled = true;
            resolve(value);
          }
        })
        .catch((error) => {
          if (!settled) {
            settled = true;
            reject(error);
          }
        });
    } catch (error) {
      if (!settled) {
        settled = true;
        reject(error);
      }
    }
  });
}

export async function getOfflineSupportEnabled() {
  try {
    const record = await withStore<OfflineSettingRecord | undefined>(
      "settings",
      "readonly",
      (store) => store.get(SETTINGS_KEY),
    );

    return Boolean(record?.enabled);
  } catch {
    return false;
  }
}

export async function setOfflineSupportEnabled(enabled: boolean) {
  await withStore<IDBValidKey>("settings", "readwrite", (store) =>
    store.put({ key: SETTINGS_KEY, enabled } satisfies OfflineSettingRecord),
  );
}

export async function listDownloadedCourses() {
  try {
    return await withStore<OfflineCourseSnapshot[]>("courses", "readonly", (store) =>
      store.getAll(),
    );
  } catch {
    return [];
  }
}

export async function getDownloadedCourse(courseId: string) {
  try {
    return await withStore<OfflineCourseSnapshot | undefined>("courses", "readonly", (store) =>
      store.get(courseId),
    );
  } catch {
    return undefined;
  }
}

export async function getDownloadedCourseByRoute(routeSegment: string) {
  const courses = await listDownloadedCourses();
  return courses.find((course) => course.routeSegment === routeSegment);
}

export async function saveDownloadedCourse(course: OfflineCourseSnapshot) {
  await withStore<IDBValidKey>("courses", "readwrite", (store) => store.put(course));
}

export async function removeDownloadedCourse(courseId: string) {
  await withStore<undefined>("courses", "readwrite", (store) => store.delete(courseId));
}

export async function clearDownloadedCourses() {
  await withStore<undefined>("courses", "readwrite", (store) => store.clear());
}

export async function enqueueProgressMutation(mutation: OfflineProgressMutation) {
  await withStore<IDBValidKey>("progressQueue", "readwrite", (store) => store.put(mutation));
}

export async function listProgressMutations() {
  try {
    const items = await withStore<OfflineProgressMutation[]>("progressQueue", "readonly", (store) =>
      store.getAll(),
    );

    return items.sort((left, right) => left.clientCreatedAt.localeCompare(right.clientCreatedAt));
  } catch {
    return [];
  }
}

export async function removeProgressMutations(ids: string[]) {
  if (!ids.length) {
    return;
  }

  const database = await openOfflineDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("progressQueue", "readwrite");
    const store = transaction.objectStore("progressQueue");

    ids.forEach((id) => store.delete(id));
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Failed to remove progress mutations."));
    };
  });
}

export function createOfflineProgressMutation(
  mutation: Omit<OfflineProgressMutation, "id" | "schemaVersion" | "deviceId" | "clientCreatedAt">,
): OfflineProgressMutation {
  return {
    ...mutation,
    id: createId(),
    schemaVersion: 1,
    deviceId: getOfflineDeviceId(),
    clientCreatedAt: new Date().toISOString(),
  };
}
