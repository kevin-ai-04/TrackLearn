import "server-only";

import { ObjectId } from "mongodb";
import type { UserRole } from "@/types/content";
import { getDatabaseInstance, isDatabaseConfigured } from "@/lib/mongodb";

function toMongoUserId(userId: string) {
  try {
    return new ObjectId(userId);
  } catch {
    throw new Error("Invalid auth user id.");
  }
}

export async function persistUserRole(userId: string, role: UserRole) {
  if (!isDatabaseConfigured()) {
    throw new Error("Role persistence requires MongoDB configuration.");
  }

  const result = await getDatabaseInstance().collection("user").updateOne(
    { _id: toMongoUserId(userId) },
    {
      $set: {
        role,
        updatedAt: new Date(),
      },
    },
  );

  if (result.matchedCount !== 1) {
    throw new Error("Authenticated user record was not found in MongoDB.");
  }
}
