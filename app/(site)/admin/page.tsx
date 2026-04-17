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

export const dynamic = "force-dynamic";

interface AdminPageProps {
  searchParams: Promise<{
    status?: string;
    requestType?: string;
    requestId?: string;
    editEntryId?: string;
  }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const viewer = await requireAdmin();
  const filters = await searchParams;
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

  const boundUpdatePublicEntryAction = editingEntry
    ? updatePublicEntryAction.bind(null, editingEntry.id)
    : null;

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
            cancelHref="/admin"
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="panel rounded-[2rem] p-6">
              <div className="flex flex-wrap gap-2">
                <Link href="/admin" className="button-secondary px-4 py-2 text-sm font-semibold">
                  All
                </Link>
                <Link href="/admin?status=pending" className="button-secondary px-4 py-2 text-sm font-semibold">
                  Pending
                </Link>
                <Link href="/admin?status=approved" className="button-secondary px-4 py-2 text-sm font-semibold">
                  Approved
                </Link>
                <Link href="/admin?status=rejected" className="button-secondary px-4 py-2 text-sm font-semibold">
                  Rejected
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {requests.length ? (
                  requests.map((request) => (
                    <Link
                      key={request.id}
                      href={`/admin?requestId=${request.id}`}
                      className="block rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4 transition hover:border-[var(--accent)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{request.snapshot.title}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {request.requestType.replaceAll("_", " ")}
                          </p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {request.requesterName ?? request.requesterEmail ?? request.requesterUserId}
                          </p>
                        </div>
                        <span className="status-pill bg-sky-500/15 text-sky-700">
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
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {selectedRequest.requestType.replaceAll("_", " ")} · {selectedRequest.status}
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
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Public Catalog
            </p>
            <span className="text-xs text-[var(--muted)]">
              {catalog.subjects.length} subjects · {catalog.entries.length} entries
            </span>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <div className="space-y-3">
              {catalog.subjects.map((subject) => (
                <form
                  key={subject.id}
                  action={unpublishSubjectAction.bind(null, subject.id)}
                  className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{subject.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{subject.slug}</p>
                    </div>
                    <button type="submit" className="button-secondary px-3 py-2 text-xs font-semibold">
                      Unpublish
                    </button>
                  </div>
                </form>
              ))}
            </div>

            <div className="space-y-3">
              {catalog.entries.map((entry) => (
                <form
                  key={entry.id}
                  action={unpublishEntryAction.bind(null, entry.id)}
                  className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{entry.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {entry.subjectTitle} · {entry.kind}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin?editEntryId=${entry.id}`}
                        className="button-secondary px-3 py-2 text-xs font-semibold"
                      >
                        Edit
                      </Link>
                      <button type="submit" className="button-secondary px-3 py-2 text-xs font-semibold">
                        Unpublish
                      </button>
                    </div>
                  </div>
                </form>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
