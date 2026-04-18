import type { UserRole } from "@/types/content";

export const userRoleOptions: Array<{
  value: UserRole;
  label: string;
  description: string;
}> = [
  {
    value: "user",
    label: "User",
    description: "Browse the study app, sync progress, and manage private library content.",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Review publication requests, test moderation flows, and manage the shared catalog.",
  },
];

export function isUserRole(value: unknown): value is UserRole {
  return value === "user" || value === "admin";
}

export function parseUserRole(value: unknown): UserRole | null {
  return isUserRole(value) ? value : null;
}
