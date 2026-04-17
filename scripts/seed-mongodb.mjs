import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const rootDir = process.cwd();
const subjectsRoot = path.join(rootDir, "data", "subjects");
const databaseName = process.env.MONGODB_DB ?? "tracklearn";

function ensureEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable "${name}".`);
  }

  return value;
}

function normalizeRouteSegment(value) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/['â€™]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || value.trim().toLowerCase().replace(/\s+/g, "-");
}

async function loadJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function readChildDirectories(rootDirPath) {
  try {
    const entries = await readdir(rootDirPath, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory());
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

function extractMarkdownHeadings(markdown) {
  const headings = [];
  const slugCounts = new Map();

  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (!match) {
      continue;
    }

    const level = match[1].length;
    const text = match[2].trim();
    const baseSlug = normalizeRouteSegment(text);
    const count = slugCounts.get(baseSlug) ?? 0;
    slugCounts.set(baseSlug, count + 1);

    headings.push({
      id: count === 0 ? baseSlug : `${baseSlug}-${count}`,
      text,
      level,
    });
  }

  return headings;
}

async function main() {
  const uri = ensureEnv("MONGODB_URI");
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();

  const db = client.db(databaseName);
  const now = new Date().toISOString();

  try {
    const subjectDirs = await readdir(subjectsRoot, { withFileTypes: true });

    for (const subjectDir of subjectDirs.filter((entry) => entry.isDirectory())) {
      const subjectSlug = normalizeRouteSegment(subjectDir.name);
      const subjectMeta = await loadJson(path.join(subjectsRoot, subjectDir.name, "meta.json"));

      let subjectId;
      const existingSubject = await db.collection("subjects").findOne({
        visibility: "public",
        ownerUserId: null,
        slug: subjectSlug,
      });

      if (existingSubject) {
        subjectId = existingSubject._id.toHexString();
        await db.collection("subjects").updateOne(
          { _id: existingSubject._id },
          {
            $set: {
              title: subjectMeta.title.trim(),
              description: subjectMeta.description?.trim(),
              order: typeof subjectMeta.order === "number" ? subjectMeta.order : undefined,
              status: "published",
              updatedAt: now,
            },
          },
        );
      } else {
        const result = await db.collection("subjects").insertOne({
          title: subjectMeta.title.trim(),
          slug: subjectSlug,
          description: subjectMeta.description?.trim(),
          order: typeof subjectMeta.order === "number" ? subjectMeta.order : undefined,
          visibility: "public",
          status: "published",
          ownerUserId: null,
          createdAt: now,
          updatedAt: now,
        });
        subjectId = result.insertedId.toHexString();
      }

      for (const kind of ["modules", "materials"]) {
        const kindValue = kind === "modules" ? "module" : "material";
        const entryDirs = await readChildDirectories(path.join(subjectsRoot, subjectDir.name, kind));

        for (const entryDir of entryDirs) {
          const entrySlug = normalizeRouteSegment(entryDir.name);
          const meta = await loadJson(path.join(subjectsRoot, subjectDir.name, kind, entryDir.name, "meta.json"));
          const markdown = await readFile(
            path.join(subjectsRoot, subjectDir.name, kind, entryDir.name, "content.md"),
            "utf8",
          );

          const existingEntry = await db.collection("entries").findOne({
            visibility: "public",
            ownerUserId: null,
            subjectId,
            kind: kindValue,
            slug: entrySlug,
          });

          const update = {
            title: meta.title.trim(),
            slug: entrySlug,
            description: meta.description?.trim(),
            order: typeof meta.order === "number" ? meta.order : undefined,
            markdown,
            headings: extractMarkdownHeadings(markdown),
            visibility: "public",
            status: "published",
            ownerUserId: null,
            subjectId,
            kind: kindValue,
            updatedAt: now,
          };

          if (existingEntry) {
            await db.collection("entries").updateOne({ _id: existingEntry._id }, { $set: update });
          } else {
            await db.collection("entries").insertOne({
              ...update,
              _id: new ObjectId(),
              createdAt: now,
            });
          }
        }
      }
    }

    console.log("Seed complete.");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
