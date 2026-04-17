"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  reviewPublicationRequest,
  unpublishPublicContent,
  updatePublicEntryAsAdmin,
} from "@/lib/content-management";

export async function reviewRequestAction(requestId: string, formData: FormData) {
  const viewer = await requireAdmin();
  const decision = String(formData.get("decision") ?? "reject") === "approve" ? "approve" : "reject";
  const reviewNotes = String(formData.get("reviewNotes") ?? "");

  await reviewPublicationRequest({
    adminUserId: viewer.userId!,
    requestId,
    decision,
    reviewNotes,
  });

  revalidatePath("/admin");
  redirect("/admin");
}

export async function unpublishSubjectAction(subjectId: string) {
  await requireAdmin();
  await unpublishPublicContent({ subjectId });
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function unpublishEntryAction(entryId: string) {
  await requireAdmin();
  await unpublishPublicContent({ entryId });
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updatePublicEntryAction(entryId: string, formData: FormData) {
  await requireAdmin();
  const result = await updatePublicEntryAsAdmin(entryId, formData);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/${result.subjectSlug}`);
  revalidatePath(result.previousPath);
  revalidatePath(result.nextPath);

  redirect(`/admin?editEntryId=${entryId}`);
}
