import "server-only";

import { ObjectId } from "mongodb";
import { getDatabaseInstance, isDatabaseConfigured } from "@/lib/mongodb";
import type { UserRole } from "@/types/content";
import type { AuthUserDocument } from "@/types/database";

export interface UserAccountProfile {
  userId: string;
  name: string | null;
  username: string | null;
  email: string | null;
  emailVerified: boolean;
  role: UserRole;
  joinedAt: string | null;
  updatedAt: string | null;
}

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_-]{2,31}$/;

function toMongoUserId(userId: string) {
  try {
    return new ObjectId(userId);
  } catch {
    throw new Error("Invalid auth user id.");
  }
}

function toIsoString(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function mapUserProfile(user: AuthUserDocument): UserAccountProfile {
  return {
    userId: user._id.toHexString(),
    name: user.name ?? null,
    username: user.username ?? null,
    email: user.email ?? null,
    emailVerified: Boolean(user.emailVerified),
    role: user.role ?? "user",
    joinedAt: toIsoString(user.createdAt),
    updatedAt: toIsoString(user.updatedAt),
  };
}

export function normalizeUsernameInput(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const username = value.trim().toLowerCase();

  if (!username) {
    return null;
  }

  if (!USERNAME_PATTERN.test(username)) {
    throw new Error(
      "Use 3 to 32 characters: lowercase letters, numbers, underscores, or hyphens.",
    );
  }

  return username;
}

export async function getUserAccountProfile(userId: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const user = await getDatabaseInstance()
    .collection<AuthUserDocument>("user")
    .findOne({ _id: toMongoUserId(userId) });

  return user ? mapUserProfile(user) : null;
}

export async function updateUserUsername(userId: string, rawUsername: unknown) {
  if (!isDatabaseConfigured()) {
    throw new Error("Profile updates require MongoDB configuration.");
  }

  const userObjectId = toMongoUserId(userId);
  const username = normalizeUsernameInput(rawUsername);
  const users = getDatabaseInstance().collection<AuthUserDocument>("user");

  if (username) {
    const existing = await users.findOne({
      usernameNormalized: username,
      _id: { $ne: userObjectId },
    });

    if (existing) {
      throw new Error("That username is already taken.");
    }
  }

  const result = await users.updateOne(
    { _id: userObjectId },
    username
      ? {
          $set: {
            username,
            usernameNormalized: username,
            updatedAt: new Date(),
          },
        }
      : {
          $set: {
            updatedAt: new Date(),
          },
          $unset: {
            username: "",
            usernameNormalized: "",
          },
        },
  );

  if (result.matchedCount !== 1) {
    throw new Error("Authenticated user record was not found in MongoDB.");
  }

  return username;
}
