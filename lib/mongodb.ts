import "server-only";

import { MongoClient, ServerApiVersion, type Db } from "mongodb";

const databaseName = process.env.MONGODB_DB ?? "tracklearn";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let indexesPromise: Promise<void> | null = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

export function isGoogleAuthConfigured() {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

function createMongoClient() {
  return new MongoClient(process.env.MONGODB_URI!, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
}

export function getMongoClientInstance() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing environment variable "MONGODB_URI".');
  }

  if (!client) {
    client = createMongoClient();
  }

  return client;
}

export async function getMongoClient() {
  if (!clientPromise) {
    clientPromise = getMongoClientInstance().connect();
  }

  return clientPromise;
}

export function getDatabaseInstance(): Db {
  return getMongoClientInstance().db(databaseName);
}

export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(databaseName);
}

export async function ensureAppIndexes() {
  if (!isDatabaseConfigured()) {
    return;
  }

  if (!indexesPromise) {
    indexesPromise = (async () => {
      const db = await getDatabase();

      await Promise.all([
        db.collection("user").createIndex({ role: 1 }, { name: "user_role_idx" }),
        db.collection("subjects").createIndex(
          { visibility: 1, ownerUserId: 1, slug: 1 },
          { unique: true, name: "subjects_visibility_owner_slug_uq" },
        ),
        db.collection("subjects").createIndex(
          { visibility: 1, status: 1, updatedAt: -1 },
          { name: "subjects_visibility_status_updated_idx" },
        ),
        db.collection("entries").createIndex(
          { visibility: 1, ownerUserId: 1, subjectId: 1, kind: 1, slug: 1 },
          { unique: true, name: "entries_visibility_owner_subject_kind_slug_uq" },
        ),
        db.collection("entries").createIndex(
          { linkedPublicEntryId: 1, ownerUserId: 1, updatedAt: -1 },
          { name: "entries_linked_public_owner_updated_idx" },
        ),
        db.collection("publicationRequests").createIndex(
          { status: 1, createdAt: -1 },
          { name: "publication_requests_status_created_idx" },
        ),
        db.collection("publicationRequests").createIndex(
          { requesterUserId: 1, createdAt: -1 },
          { name: "publication_requests_requester_created_idx" },
        ),
        db.collection("userProgress").createIndex(
          { userId: 1 },
          { unique: true, name: "user_progress_user_uq" },
        ),
      ]);
    })();
  }

  return indexesPromise;
}
