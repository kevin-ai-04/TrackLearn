import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { extractMarkdownHeadings } from "@/lib/markdown";
import { normalizeRouteSegment } from "@/lib/utils";
import type {
  ContentMeta,
  MaterialContent,
  MaterialSummary,
  ModuleContent,
  ModuleSummary,
  SubjectContent,
  SubjectSummary,
} from "@/types/content";

const SUBJECTS_ROOT = path.join(process.cwd(), "data", "subjects");

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseMeta(meta: unknown, label: string): ContentMeta {
  if (!isRecord(meta) || typeof meta.title !== "string" || !meta.title.trim()) {
    throw new Error(`Invalid metadata in ${label}: "title" is required.`);
  }

  return {
    title: meta.title.trim(),
    order: typeof meta.order === "number" ? meta.order : undefined,
    description: typeof meta.description === "string" ? meta.description.trim() : undefined,
  };
}

function sortByOrderThenTitle<T extends ContentMeta>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.title.localeCompare(right.title);
  });
}

async function loadJson(filePath: string) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as unknown;
}

async function readChildDirectories(rootDir: string) {
  try {
    const entries = await readdir(rootDir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory());
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    ) {
      return [];
    }

    throw error;
  }
}

async function loadModule(subjectSlug: string, subjectTitle: string, moduleDirName: string) {
  const moduleDir = path.join(SUBJECTS_ROOT, subjectSlug, "modules", moduleDirName);
  const meta = parseMeta(await loadJson(path.join(moduleDir, "meta.json")), moduleDir);
  const content = await readFile(path.join(moduleDir, "content.md"), "utf8");
  const moduleSlug = normalizeRouteSegment(moduleDirName);

  const moduleContent: ModuleContent = {
    ...meta,
    slug: moduleSlug,
    subjectSlug,
    subjectTitle,
    content,
    headings: extractMarkdownHeadings(content),
    href: `/${subjectSlug}/${moduleSlug}`,
  };

  return moduleContent;
}

async function loadMaterial(subjectSlug: string, subjectTitle: string, materialDirName: string) {
  const materialDir = path.join(SUBJECTS_ROOT, subjectSlug, "materials", materialDirName);
  const meta = parseMeta(await loadJson(path.join(materialDir, "meta.json")), materialDir);
  const content = await readFile(path.join(materialDir, "content.md"), "utf8");
  const materialSlug = normalizeRouteSegment(materialDirName);

  const materialContent: MaterialContent = {
    ...meta,
    slug: materialSlug,
    subjectSlug,
    subjectTitle,
    content,
    headings: extractMarkdownHeadings(content),
    href: `/${subjectSlug}/materials/${materialSlug}`,
  };

  return materialContent;
}

async function loadSubject(subjectSlug: string) {
  const subjectDir = path.join(SUBJECTS_ROOT, subjectSlug);
  const meta = parseMeta(await loadJson(path.join(subjectDir, "meta.json")), subjectDir);
  const [materialEntries, moduleEntries] = await Promise.all([
    readChildDirectories(path.join(subjectDir, "materials")),
    readChildDirectories(path.join(subjectDir, "modules")),
  ]);

  const uniqueMaterialEntries = materialEntries.reduce<Map<string, (typeof materialEntries)[number]>>(
    (collection, entry) => {
      const materialSlug = normalizeRouteSegment(entry.name);
      const existingEntry = collection.get(materialSlug);

      if (!existingEntry || (entry.name === materialSlug && existingEntry.name !== materialSlug)) {
        collection.set(materialSlug, entry);
      }

      return collection;
    },
    new Map(),
  );

  const uniqueModuleEntries = moduleEntries.reduce<Map<string, (typeof moduleEntries)[number]>>(
    (collection, entry) => {
      const moduleSlug = normalizeRouteSegment(entry.name);
      const existingEntry = collection.get(moduleSlug);

      if (!existingEntry || (entry.name === moduleSlug && existingEntry.name !== moduleSlug)) {
        collection.set(moduleSlug, entry);
      }

      return collection;
    },
    new Map(),
  );

  const [materials, modules] = await Promise.all([
    Promise.all(
      Array.from(uniqueMaterialEntries.values()).map((entry) =>
        loadMaterial(subjectSlug, meta.title, entry.name),
      ),
    ),
    Promise.all(
      Array.from(uniqueModuleEntries.values()).map((entry) =>
        loadModule(subjectSlug, meta.title, entry.name),
      ),
    ),
  ]);

  const subject: SubjectContent = {
    ...meta,
    slug: subjectSlug,
    materials: sortByOrderThenTitle(materials),
    modules: sortByOrderThenTitle(modules),
  };

  return subject;
}

export const getContentTree = cache(async () => {
  const subjectEntries = await readdir(SUBJECTS_ROOT, { withFileTypes: true });
  const subjects = await Promise.all(
    subjectEntries.filter((entry) => entry.isDirectory()).map((entry) => loadSubject(entry.name)),
  );

  return sortByOrderThenTitle(subjects);
});

function toMaterialSummary(material: MaterialContent): MaterialSummary {
  return {
    title: material.title,
    order: material.order,
    description: material.description,
    slug: material.slug,
    subjectSlug: material.subjectSlug,
    subjectTitle: material.subjectTitle,
    headings: material.headings,
    href: material.href,
  };
}

function toModuleSummary(module: ModuleContent): ModuleSummary {
  return {
    title: module.title,
    order: module.order,
    description: module.description,
    slug: module.slug,
    subjectSlug: module.subjectSlug,
    subjectTitle: module.subjectTitle,
    headings: module.headings,
    href: module.href,
  };
}

function toSubjectSummary(subject: SubjectContent): SubjectSummary {
  return {
    title: subject.title,
    order: subject.order,
    description: subject.description,
    slug: subject.slug,
    materials: subject.materials.map(toMaterialSummary),
    modules: subject.modules.map(toModuleSummary),
  };
}

export const getNavigationTree = cache(async () => {
  const subjects = await getContentTree();
  return subjects.map(toSubjectSummary);
});

export const getSubjectBySlug = cache(async (subjectSlug: string) => {
  const subjects = await getContentTree();
  return subjects.find((subject) => subject.slug === subjectSlug) ?? null;
});

export const getModuleBySlugs = cache(async (subjectSlug: string, moduleSlug: string) => {
  const subject = await getSubjectBySlug(subjectSlug);

  if (!subject) {
    return null;
  }

  const normalizedModuleSlug = normalizeRouteSegment(moduleSlug);
  const module = subject.modules.find((item) => item.slug === normalizedModuleSlug) ?? null;

  if (!module) {
    return null;
  }

  const currentIndex = subject.modules.findIndex((item) => item.slug === normalizedModuleSlug);

  return {
    subject,
    module,
    previousModule: currentIndex > 0 ? subject.modules[currentIndex - 1] : null,
    nextModule: currentIndex < subject.modules.length - 1 ? subject.modules[currentIndex + 1] : null,
  };
});

export const getMaterialBySlugs = cache(async (subjectSlug: string, materialSlug: string) => {
  const subject = await getSubjectBySlug(subjectSlug);

  if (!subject) {
    return null;
  }

  const normalizedMaterialSlug = normalizeRouteSegment(materialSlug);
  const material = subject.materials.find((item) => item.slug === normalizedMaterialSlug) ?? null;

  if (!material) {
    return null;
  }

  return {
    subject,
    material,
  };
});

export async function getAllModuleParams() {
  const subjects = await getContentTree();

  return subjects.flatMap((subject) =>
    subject.modules.map((module) => ({
      subject: subject.slug,
      module: module.slug,
    })),
  );
}

export async function getAllMaterialParams() {
  const subjects = await getContentTree();

  return subjects.flatMap((subject) =>
    subject.materials.map((material) => ({
      subject: subject.slug,
      material: material.slug,
    })),
  );
}
