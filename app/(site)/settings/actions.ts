"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { parseUserRole } from "@/lib/auth-roles";
import { persistUserRole } from "@/lib/auth-role-store";
import { isDatabaseConfigured } from "@/lib/mongodb";

export async function updateViewerRole(nextRoleValue: unknown) {
  const nextRole = parseUserRole(nextRoleValue);

  if (!nextRole) {
    throw new Error("Invalid role selection.");
  }

  if (!isDatabaseConfigured()) {
    throw new Error("Role updates require MongoDB configuration.");
  }

  const viewer = await requireUser();

  if (!viewer.userId) {
    throw new Error("Authenticated user id is missing.");
  }

  await persistUserRole(viewer.userId, nextRole);

  redirect("/settings?roleUpdated=1");
}
