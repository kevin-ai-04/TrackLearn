"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { getViewer } from "@/lib/auth-helpers";
import {
  addCourseToUserLibrary,
  removeCourseFromUserLibrary,
} from "@/lib/course-library";
import {
  createPrivateSubjectCopyFromPublic,
  createEntryForUser,
  createSubjectForUser,
  deleteEntryForUser,
  deleteSubjectForUser,
  submitEntryForReview,
  submitSubjectForReview,
  syncPrivateSubjectCopyFromPublic,
  updateEntryForUser,
  updateSubjectForUser,
} from "@/lib/content-management";

function readRequiredFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required.`);
  }

  return value.trim();
}

export async function addCourseToLibraryAction(formData: FormData) {
  const viewer = await getViewer();

  if (!viewer.userId) {
    redirect("/login");
  }

  const subjectId = readRequiredFormString(formData, "subjectId");
  await addCourseToUserLibrary(viewer.userId, subjectId);
  revalidatePath("/explore");
  revalidatePath("/library");
  redirect(`/explore?added=${subjectId}`);
}

export async function removeCourseFromLibraryAction(formData: FormData) {
  const viewer = await requireUser();
  const subjectId = readRequiredFormString(formData, "subjectId");
  await removeCourseFromUserLibrary(viewer.userId!, subjectId);
  revalidatePath("/library");
}

export async function createPrivateCourseCopyAction(formData: FormData) {
  const viewer = await requireUser();
  const subjectId = readRequiredFormString(formData, "subjectId");
  await addCourseToUserLibrary(viewer.userId!, subjectId);
  const privateSubjectId = await createPrivateSubjectCopyFromPublic(viewer.userId!, subjectId);
  revalidatePath("/library");
  redirect(`/library/subjects/${privateSubjectId}`);
}

export async function syncPrivateCourseCopyAction(formData: FormData) {
  const viewer = await requireUser();
  const privateSubjectId = readRequiredFormString(formData, "privateSubjectId");
  await syncPrivateSubjectCopyFromPublic(viewer.userId!, privateSubjectId);
  revalidatePath("/library");
  revalidatePath(`/library/subjects/${privateSubjectId}`);
  redirect(`/library/subjects/${privateSubjectId}?synced=public`);
}

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
  redirect(`/library/entries/${entryId}`);
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
