"use client";

import type { DownloadedCourseRecord } from "@/types/offline";

const DATABASE_NAME = "tracklearn-offline";
const DATABASE_VERSION = 1;
const COURSE_STORE = "courses";

function openOfflineDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not available."));
      return;
    }

    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(COURSE_STORE)) {
        database.createObjectStore(COURSE_STORE, { keyPath: "subject.id" });
      }
    };

    request.onerror = () => reject(request.error ?? new Error("Unable to open offline storage."));
    request.onsuccess = () => resolve(request.result);
  });
}

async function withCourseStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const database = await openOfflineDatabase();

  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(COURSE_STORE, mode);
    const store = transaction.objectStore(COURSE_STORE);
    const request = callback(store);

    request.onerror = () => reject(request.error ?? new Error("Offline storage request failed."));
    request.onsuccess = () => resolve(request.result);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Offline storage transaction failed."));
    };
  });
}

export async function saveDownloadedCourse(record: DownloadedCourseRecord) {
  await withCourseStore("readwrite", (store) => store.put(record));
}

export async function removeDownloadedCourse(subjectId: string) {
  await withCourseStore("readwrite", (store) => store.delete(subjectId));
}

export async function getDownloadedCourse(subjectId: string) {
  return withCourseStore<DownloadedCourseRecord | undefined>("readonly", (store) =>
    store.get(subjectId),
  );
}

export async function listDownloadedCourses() {
  return withCourseStore<DownloadedCourseRecord[]>("readonly", (store) => store.getAll());
}

export async function isCourseDownloaded(subjectId: string) {
  return Boolean(await getDownloadedCourse(subjectId));
}
