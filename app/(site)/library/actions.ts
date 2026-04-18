"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import {
  createEntryForUser,
  createSubjectForUser,
  deleteEntryForUser,
  deleteSubjectForUser,
  submitEntryForReview,
  submitSubjectForReview,
  updateEntryForUser,
  updateSubjectForUser,
} from "@/lib/content-management";

export async function createSubjectAction(formData: FormData) {
  const viewer = await requireUser();
  const subjectId = await createSubjectForUser(viewer.userId!, formData);
  revalidatePath("/library");
  revalidatePath("/library/manage");
  redirect(`/library/subjects/${subjectId}`);
}

export async function updateSubjectAction(subjectId: string, formData: FormData) {
  const viewer = await requireUser();
  await updateSubjectForUser(viewer.userId!, subjectId, formData);
  revalidatePath("/library");
  revalidatePath("/library/manage");
  revalidatePath(`/library/subjects/${subjectId}`);
  redirect(`/library/subjects/${subjectId}`);
}

export async function deleteSubjectAction(subjectId: string) {
  const viewer = await requireUser();
  await deleteSubjectForUser(viewer.userId!, subjectId);
  revalidatePath("/library");
  revalidatePath("/library/manage");
  redirect("/library");
}

export async function submitSubjectAction(subjectId: string) {
  const viewer = await requireUser();
  await submitSubjectForReview(viewer.userId!, subjectId);
  revalidatePath("/library");
  revalidatePath("/library/manage");
  revalidatePath(`/library/subjects/${subjectId}`);
  redirect(`/library/subjects/${subjectId}?submitted=${Date.now()}`);
}

export async function createEntryAction(formData: FormData) {
  const viewer = await requireUser();
  const entryId = await createEntryForUser(viewer.userId!, formData);
  revalidatePath("/library");
  revalidatePath("/library/manage");
  redirect(`/library/entries/${entryId}`);
}

export async function updateEntryAction(entryId: string, formData: FormData) {
  const viewer = await requireUser();
  await updateEntryForUser(viewer.userId!, entryId, formData);
  revalidatePath("/library");
  revalidatePath("/library/manage");
  revalidatePath(`/library/entries/${entryId}`);
  redirect("/library/manage?saved=entry");
}

export async function deleteEntryAction(entryId: string) {
  const viewer = await requireUser();
  await deleteEntryForUser(viewer.userId!, entryId);
  revalidatePath("/library");
  revalidatePath("/library/manage");
  redirect("/library");
}

export async function submitEntryAction(entryId: string) {
  const viewer = await requireUser();
  await submitEntryForReview(viewer.userId!, entryId);
  revalidatePath("/library");
  revalidatePath("/library/manage");
  revalidatePath(`/library/entries/${entryId}`);
  redirect(`/library/entries/${entryId}`);
}
