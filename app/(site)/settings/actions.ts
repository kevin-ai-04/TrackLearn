"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { parseUserRole } from "@/lib/auth-roles";
import { persistUserRole } from "@/lib/auth-role-store";
import { isDatabaseConfigured } from "@/lib/mongodb";
import { updateUserUsername } from "@/lib/user-profile-store";

export interface UsernameUpdateState {
  status: "idle" | "success" | "error";
  message: string;
}

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

export async function updateViewerUsername(
  _currentState: UsernameUpdateState,
  formData: FormData,
): Promise<UsernameUpdateState> {
  const viewer = await requireUser();

  if (!viewer.userId) {
    return {
      status: "error",
      message: "Authenticated user id is missing.",
    };
  }

  try {
    const username = await updateUserUsername(viewer.userId, formData.get("username"));
    revalidatePath("/settings");

    return {
      status: "success",
      message: username ? "Username updated." : "Username cleared.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to update username.",
    };
  }
}
