import Link from "next/link";
import { AdminEntryEditor } from "@/components/admin/AdminEntryEditor";
import { ContentViewer } from "@/components/content/ContentViewer";
import { AppShell } from "@/components/layout/AppShell";
import {
  reviewRequestAction,
  unpublishEntryAction,
  unpublishSubjectAction,
  updatePublicEntryAction,
} from "@/app/(site)/admin/actions";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  getNavigationTree,
  getPublicationRequestById,
  getPublicEntryById,
  listPublicationRequests,
  listPublishedCatalog,
} from "@/lib/content";
import type { EntryKind, EntrySummary, SubjectSummary } from "@/types/content";

export const dynamic = "force-dynamic";

type AdminQueryParams = {
  status?: string;
  requestType?: string;
  requestId?: string;
  editEntryId?: string;
  catalogQuery?: string;
  catalogSubject?: string;
  catalogKind?: string;
};

interface AdminPageProps {
  searchParams: Promise<AdminQueryParams>;
}

const REQUEST_STATUS_FILTERS = [
  { label: "All", value: undefined },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
] as const;

function buildAdminHref(params: AdminQueryParams) {
  const searchParams = new URLSearchParams();

  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }

  if (params.requestType && params.requestType !== "all") {
    searchParams.set("requestType", params.requestType);
  }

  if (params.requestId) {
    searchParams.set("requestId", params.requestId);
  }

  if (params.editEntryId) {
    searchParams.set("editEntryId", params.editEntryId);
  }

  if (params.catalogQuery) {
    searchParams.set("catalogQuery", params.catalogQuery);
  }

  if (params.catalogSubject) {
    searchParams.set("catalogSubject", params.catalogSubject);
  }

  if (params.catalogKind && params.catalogKind !== "all") {
    searchParams.set("catalogKind", params.catalogKind);
  }

  const queryString = searchParams.toString();
  return queryString ? `/admin?${queryString}` : "/admin";
}

function normalizeEntryKindFilter(value?: string): EntryKind | "all" {
  return value === "module" || value === "material" ? value : "all";
}

function matchesCatalogQuery(subject: SubjectSummary, entry: EntrySummary | null, query: string) {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.toLowerCase();
  const subjectSearchBlob = [subject.title, subject.slug, subject.description ?? ""]
    .join(" ")
    .toLowerCase();

  if (subjectSearchBlob.includes(normalizedQuery)) {
    return true;
  }

  if (!entry) {
    return false;
  }

  const entrySearchBlob = [
    entry.title,
    entry.slug,
    entry.description ?? "",
    entry.kind,
    entry.subjectTitle,
    entry.subjectSlug,
  ]
    .join(" ")
    .toLowerCase();

  return entrySearchBlob.includes(normalizedQuery);
}

function getStatusClasses(status: string) {
  switch (status) {
    case "approved":
      return "bg-emerald-500/15 text-emerald-700";
    case "rejected":
      return "bg-rose-500/15 text-rose-700";
    default:
      return "bg-sky-500/15 text-sky-700";
  }
}

function getEntryKindClasses(kind: EntryKind) {
  return kind === "module"
    ? "bg-amber-500/15 text-amber-700"
    : "bg-cyan-500/15 text-cyan-700";
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const viewer = await requireAdmin();
  const filters = await searchParams;
  const catalogQuery = filters.catalogQuery?.trim() ?? "";
  const catalogSubject = filters.catalogSubject?.trim() ?? "";
  const catalogKind = normalizeEntryKindFilter(filters.catalogKind);

  const [subjects, requests, selectedRequest, catalog, editingEntry] = await Promise.all([
    getNavigationTree(viewer),
    listPublicationRequests({
      status: filters.status,
      requestType: filters.requestType,
    }),
    filters.requestId ? getPublicationRequestById(filters.requestId) : null,
    listPublishedCatalog(),
    filters.editEntryId ? getPublicEntryById(filters.editEntryId) : null,
  ]);

  const adminFilters: AdminQueryParams = {
    status: filters.status,
    requestType: filters.requestType,
    requestId: filters.requestId,
    catalogQuery,
    catalogSubject,
    catalogKind,
  };

  const editorReturnHref = buildAdminHref({
    status: filters.status,
    requestType: filters.requestType,
    requestId: filters.requestId,
    catalogQuery,
    catalogSubject,
    catalogKind,
  });

  const boundUpdatePublicEntryAction = editingEntry
    ? updatePublicEntryAction.bind(null, editingEntry.id, editorReturnHref)
    : null;

  const catalogGroups = catalog.subjects
    .map((subject) => {
      const subjectMatchesFilter =
        !catalogSubject || catalogSubject === subject.id || catalogSubject === subject.slug;
      const visibleModules =
        catalogKind === "material"
          ? []
          : subject.modules.filter((entry) => matchesCatalogQuery(subject, entry, catalogQuery));
      const visibleMaterials =
        catalogKind === "module"
          ? []
          : subject.materials.filter((entry) => matchesCatalogQuery(subject, entry, catalogQuery));
      const visibleEntryCount = visibleModules.length + visibleMaterials.length;
      const subjectMatchesQuery = matchesCatalogQuery(subject, null, catalogQuery);
      const shouldInclude =
        subjectMatchesFilter &&
        (visibleEntryCount > 0 || subjectMatchesQuery || (!catalogQuery && catalogKind === "all"));

      return {
        subject,
        visibleModules,
        visibleMaterials,
        visibleEntryCount,
        shouldInclude,
      };
    })
    .filter((group) => group.shouldInclude);

  const displayedEntryCount = catalogGroups.reduce((sum, group) => sum + group.visibleEntryCount, 0);

  return (
    <AppShell
      subjects={subjects}
      currentPathLabel="Admin Dashboard"
      currentPathHint="Review publication requests, moderate shared catalog content, and edit public markdown."
    >
      <div className="space-y-4">
        <section className="panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Publication review and public catalog moderation.
          </h1>
        </section>

        {editingEntry && boundUpdatePublicEntryAction ? (
          <AdminEntryEditor
            entry={editingEntry}
            action={boundUpdatePublicEntryAction}
            cancelHref={editorReturnHref}
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="panel rounded-[2rem] p-6">
              <div className="flex flex-wrap gap-2">
                {REQUEST_STATUS_FILTERS.map((filter) => {
                  const isActive = (filters.status ?? "all") === (filter.value ?? "all");

                  return (
                    <Link
                      key={filter.label}
                      href={buildAdminHref({
                        ...adminFilters,
                        requestId: undefined,
                        status: filter.value,
                      })}
                      className={[
                        "px-4 py-2 text-sm font-semibold",
                        isActive ? "button-primary" : "button-secondary",
                      ].join(" ")}
                    >
                      {filter.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3">
                {requests.length ? (
                  requests.map((request) => (
                    <Link
                      key={request.id}
                      href={buildAdminHref({
                        ...adminFilters,
                        requestId: request.id,
                        editEntryId: undefined,
                      })}
                      className="block rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4 transition hover:border-[var(--accent)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{request.snapshot.title}</p>
                          <p className="mt-1 text-sm capitalize text-[var(--muted)]">
                            {formatLabel(request.requestType)}
                          </p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {request.requesterName ?? request.requesterEmail ?? request.requesterUserId}
                          </p>
                        </div>
                        <span className={`status-pill ${getStatusClasses(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                    No publication requests match the current filter.
                  </div>
                )}
              </div>
            </section>

            <section className="panel rounded-[2rem] p-6">
              {selectedRequest ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                      Review Detail
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">{selectedRequest.snapshot.title}</h2>
                    <p className="mt-2 text-sm capitalize text-[var(--muted)]">
                      {formatLabel(selectedRequest.requestType)} · {selectedRequest.status}
                    </p>
                  </div>

                  <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4 text-sm">
                    <p>
                      <span className="font-semibold">Slug:</span> {selectedRequest.snapshot.slug}
                    </p>
                    <p className="mt-2">
                      <span className="font-semibold">Subject:</span>{" "}
                      {selectedRequest.snapshot.subjectTitle ?? "No subject snapshot"}
                    </p>
                    {selectedRequest.snapshot.description ? (
                      <p className="mt-2 text-[var(--muted)]">{selectedRequest.snapshot.description}</p>
                    ) : null}
                  </div>

                  {selectedRequest.snapshot.markdown ? (
                    <ContentViewer content={selectedRequest.snapshot.markdown} />
                  ) : null}

                  <form action={reviewRequestAction.bind(null, selectedRequest.id)} className="space-y-3">
                    <textarea
                      name="reviewNotes"
                      className="field min-h-32"
                      defaultValue={selectedRequest.reviewNotes ?? ""}
                      placeholder="Optional admin notes"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        name="decision"
                        value="approve"
                        className="button-primary px-4 py-3 text-sm font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="reject"
                        className="button-secondary px-4 py-3 text-sm font-semibold"
                      >
                        Reject / Request Changes
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                  Select a request to review its snapshot and moderation controls.
                </div>
              )}
            </section>
          </div>
        )}

        <section className="panel rounded-[2rem] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Public Catalog
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Find a public subject, module, or material fast.</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Grouped by subject with server-side filters so you can jump straight to editing or unpublishing.
              </p>
            </div>

            <div className="grid min-w-[15rem] gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Subjects
                </p>
                <p className="mt-2 text-2xl font-semibold">{catalogGroups.length}</p>
              </div>
              <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Entries Shown
                </p>
                <p className="mt-2 text-2xl font-semibold">{displayedEntryCount}</p>
              </div>
              <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Total Entries
                </p>
                <p className="mt-2 text-2xl font-semibold">{catalog.entries.length}</p>
              </div>
            </div>
          </div>

          <form action="/admin" className="mt-5 grid gap-3 rounded-[1.6rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4 lg:grid-cols-[1.4fr_0.9fr_0.8fr_auto]">
            {filters.status ? <input type="hidden" name="status" value={filters.status} /> : null}
            {filters.requestType ? <input type="hidden" name="requestType" value={filters.requestType} /> : null}
            {filters.requestId ? <input type="hidden" name="requestId" value={filters.requestId} /> : null}

            <input
              type="search"
              name="catalogQuery"
              className="field"
              placeholder="Search by subject, module, material, or slug"
              defaultValue={catalogQuery}
            />

            <select name="catalogSubject" className="field" defaultValue={catalogSubject}>
              <option value="">All subjects</option>
              {catalog.subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.title}
                </option>
              ))}
            </select>

            <select name="catalogKind" className="field" defaultValue={catalogKind}>
              <option value="all">Modules and materials</option>
              <option value="module">Modules only</option>
              <option value="material">Materials only</option>
            </select>

            <div className="flex flex-wrap gap-2">
              <button type="submit" className="button-primary px-4 py-3 text-sm font-semibold">
                Apply
              </button>
              <Link
                href={buildAdminHref({
                  status: filters.status,
                  requestType: filters.requestType,
                  requestId: filters.requestId,
                })}
                className="button-secondary px-4 py-3 text-sm font-semibold"
              >
                Clear
              </Link>
            </div>
          </form>

          <div className="mt-5 grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="space-y-3">
              <div className="rounded-[1.6rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Quick Jump
                </p>
                <div className="mt-4 space-y-2">
                  {catalogGroups.length ? (
                    catalogGroups.map((group) => (
                      <Link
                        key={group.subject.id}
                        href={`#catalog-subject-${group.subject.id}`}
                        className="block rounded-[1.1rem] border border-[var(--border)] bg-[var(--panel)] px-3 py-3 transition hover:border-[var(--accent)]"
                      >
                        <p className="font-semibold">{group.subject.title}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {group.visibleModules.length} modules · {group.visibleMaterials.length} materials
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--muted)]">
                      No subjects match the current catalog filters.
                    </p>
                  )}
                </div>
              </div>
            </aside>

            <div className="space-y-4">
              {catalogGroups.length ? (
                catalogGroups.map((group) => {
                  const subjectPanelHref = buildAdminHref({
                    ...adminFilters,
                    catalogSubject: group.subject.id,
                    requestId: filters.requestId,
                  });

                  return (
                    <article
                      key={group.subject.id}
                      id={`catalog-subject-${group.subject.id}`}
                      className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--panel-alt)] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold">{group.subject.title}</h3>
                            <span className="status-pill bg-emerald-500/15 text-emerald-700">
                              {group.subject.slug}
                            </span>
                          </div>
                          {group.subject.description ? (
                            <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
                              {group.subject.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={subjectPanelHref}
                            className="button-secondary px-4 py-2 text-sm font-semibold"
                          >
                            Focus Subject
                          </Link>
                          <Link
                            href={group.subject.href}
                            className="button-secondary px-4 py-2 text-sm font-semibold"
                          >
                            View Live
                          </Link>
                          <form action={unpublishSubjectAction.bind(null, group.subject.id)}>
                            <button type="submit" className="button-secondary px-4 py-2 text-sm font-semibold">
                              Unpublish Subject
                            </button>
                          </form>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                            Visible Modules
                          </p>
                          <p className="mt-2 text-xl font-semibold">{group.visibleModules.length}</p>
                        </div>
                        <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                            Visible Materials
                          </p>
                          <p className="mt-2 text-xl font-semibold">{group.visibleMaterials.length}</p>
                        </div>
                        <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                            Total Entries
                          </p>
                          <p className="mt-2 text-xl font-semibold">
                            {group.subject.modules.length + group.subject.materials.length}
                          </p>
                        </div>
                      </div>

                      {group.visibleEntryCount ? (
                        <div className="mt-5 grid gap-4 xl:grid-cols-2">
                          {group.visibleModules.length ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                                  Modules
                                </p>
                                <span className="text-xs text-[var(--muted)]">
                                  {group.visibleModules.length} shown
                                </span>
                              </div>

                              {group.visibleModules.map((entry) => (
                                <form
                                  key={entry.id}
                                  action={unpublishEntryAction.bind(null, entry.id)}
                                  className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-4"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold">{entry.title}</p>
                                        <span className={`status-pill ${getEntryKindClasses(entry.kind)}`}>
                                          {entry.kind}
                                        </span>
                                      </div>
                                      <p className="mt-1 text-sm text-[var(--muted)]">{entry.slug}</p>
                                      {entry.description ? (
                                        <p className="mt-2 text-sm text-[var(--muted)]">{entry.description}</p>
                                      ) : null}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      <Link
                                        href={buildAdminHref({
                                          ...adminFilters,
                                          editEntryId: entry.id,
                                          requestId: filters.requestId,
                                        })}
                                        className="button-secondary px-3 py-2 text-xs font-semibold"
                                      >
                                        Edit
                                      </Link>
                                      <Link
                                        href={entry.href}
                                        className="button-secondary px-3 py-2 text-xs font-semibold"
                                      >
                                        View
                                      </Link>
                                      <button type="submit" className="button-secondary px-3 py-2 text-xs font-semibold">
                                        Unpublish
                                      </button>
                                    </div>
                                  </div>
                                </form>
                              ))}
                            </div>
                          ) : null}

                          {group.visibleMaterials.length ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                                  Materials
                                </p>
                                <span className="text-xs text-[var(--muted)]">
                                  {group.visibleMaterials.length} shown
                                </span>
                              </div>

                              {group.visibleMaterials.map((entry) => (
                                <form
                                  key={entry.id}
                                  action={unpublishEntryAction.bind(null, entry.id)}
                                  className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-4"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold">{entry.title}</p>
                                        <span className={`status-pill ${getEntryKindClasses(entry.kind)}`}>
                                          {entry.kind}
                                        </span>
                                      </div>
                                      <p className="mt-1 text-sm text-[var(--muted)]">{entry.slug}</p>
                                      {entry.description ? (
                                        <p className="mt-2 text-sm text-[var(--muted)]">{entry.description}</p>
                                      ) : null}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      <Link
                                        href={buildAdminHref({
                                          ...adminFilters,
                                          editEntryId: entry.id,
                                          requestId: filters.requestId,
                                        })}
                                        className="button-secondary px-3 py-2 text-xs font-semibold"
                                      >
                                        Edit
                                      </Link>
                                      <Link
                                        href={entry.href}
                                        className="button-secondary px-3 py-2 text-xs font-semibold"
                                      >
                                        View
                                      </Link>
                                      <button type="submit" className="button-secondary px-3 py-2 text-xs font-semibold">
                                        Unpublish
                                      </button>
                                    </div>
                                  </div>
                                </form>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="mt-5 rounded-[1.3rem] border border-dashed border-[var(--border)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]">
                          No modules or materials within this subject match the current filters.
                        </div>
                      )}
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">
                  No public catalog content matches the current filters.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
