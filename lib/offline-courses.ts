"use client";

import type { DownloadedCourseRecord } from "@/types/offline";

const DATABASE_NAME = "tracklearn-offline";
const DATABASE_VERSION = 1;
const COURSE_STORE = "courses";
const COURSE_INDEX_KEY = "tracklearn.offline-courses.index.v1";
const COURSE_RECORD_PREFIX = "tracklearn.offline-courses.record.v1:";

function courseRecordKey(subjectId: string) {
  return `${COURSE_RECORD_PREFIX}${subjectId}`;
}

function readLocalCourseIndex() {
  try {
    const raw = window.localStorage.getItem(COURSE_INDEX_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];

    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function writeLocalCourseIndex(subjectIds: string[]) {
  const uniqueSubjectIds = [...new Set(subjectIds)];

  try {
    window.localStorage.setItem(COURSE_INDEX_KEY, JSON.stringify(uniqueSubjectIds));
  } catch {
    // IndexedDB remains the primary storage when localStorage quota is unavailable.
  }
}

function saveLocalCourseRecord(record: DownloadedCourseRecord) {
  const subjectIds = readLocalCourseIndex();

  try {
    window.localStorage.setItem(courseRecordKey(record.subject.id), JSON.stringify(record));
    writeLocalCourseIndex([...subjectIds, record.subject.id]);
  } catch {
    // Large courses can exceed localStorage quotas; IndexedDB remains primary.
  }
}

function removeLocalCourseRecord(subjectId: string) {
  try {
    window.localStorage.removeItem(courseRecordKey(subjectId));
    writeLocalCourseIndex(readLocalCourseIndex().filter((item) => item !== subjectId));
  } catch {
    // Ignore storage errors.
  }
}

function getLocalCourseRecord(subjectId: string) {
  try {
    const raw = window.localStorage.getItem(courseRecordKey(subjectId));
    return raw ? (JSON.parse(raw) as DownloadedCourseRecord) : undefined;
  } catch {
    return undefined;
  }
}

function listLocalCourseRecords() {
  return readLocalCourseIndex().flatMap((subjectId) => {
    const record = getLocalCourseRecord(subjectId);
    return record ? [record] : [];
  });
}

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
  saveLocalCourseRecord(record);

  try {
    await withCourseStore("readwrite", (store) => store.put(record));
  } catch {
    if (!getLocalCourseRecord(record.subject.id)) {
      throw new Error("Unable to save downloaded course.");
    }
  }
}

export async function removeDownloadedCourse(subjectId: string) {
  removeLocalCourseRecord(subjectId);

  try {
    await withCourseStore("readwrite", (store) => store.delete(subjectId));
  } catch {
    // Local mirror has already been removed.
  }
}

export async function getDownloadedCourse(subjectId: string) {
  try {
    return (
      (await withCourseStore<DownloadedCourseRecord | undefined>("readonly", (store) =>
        store.get(subjectId),
      )) ?? getLocalCourseRecord(subjectId)
    );
  } catch {
    return getLocalCourseRecord(subjectId);
  }
}

export async function listDownloadedCourses() {
  try {
    const indexedDbRecords = await withCourseStore<DownloadedCourseRecord[]>("readonly", (store) =>
      store.getAll(),
    );
    const recordsById = new Map(
      [...indexedDbRecords, ...listLocalCourseRecords()].map((record) => [
        record.subject.id,
        record,
      ]),
    );

    return [...recordsById.values()];
  } catch {
    return listLocalCourseRecords();
  }
}

export async function clearDownloadedCourses() {
  for (const subjectId of readLocalCourseIndex()) {
    removeLocalCourseRecord(subjectId);
  }

  writeLocalCourseIndex([]);

  try {
    await withCourseStore("readwrite", (store) => store.clear());
  } catch {
    // Local mirror has already been cleared.
  }
}

export async function isCourseDownloaded(subjectId: string) {
  return Boolean(await getDownloadedCourse(subjectId));
}
