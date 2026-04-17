import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { UserRole } from "@/types/content";

export interface Viewer {
  userId: string | null;
  role: UserRole;
  name?: string | null;
  email?: string | null;
  isAuthenticated: boolean;
}

export async function getViewer(): Promise<Viewer> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      userId: null,
      role: "user",
      isAuthenticated: false,
    };
  }

  return {
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    isAuthenticated: true,
  };
}

export async function requireUser() {
  const viewer = await getViewer();

  if (!viewer.userId) {
    redirect("/login");
  }

  return viewer;
}

export async function requireAdmin() {
  const viewer = await requireUser();

  if (viewer.role !== "admin") {
    redirect("/");
  }

  return viewer;
}
