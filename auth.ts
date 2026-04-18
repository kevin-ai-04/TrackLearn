import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getOAuthState } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { parseUserRole } from "@/lib/auth-roles";
import { persistUserRole } from "@/lib/auth-role-store";
import {
  getDatabaseInstance,
  getMongoClientInstance,
  isDatabaseConfigured,
  isGoogleAuthConfigured,
} from "@/lib/mongodb";

function resolveBaseUrl() {
  const configuredBaseUrl =
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  return configuredBaseUrl ?? "http://localhost:3000";
}

const database = isDatabaseConfigured()
  ? mongodbAdapter(getDatabaseInstance(), {
      client: getMongoClientInstance(),
      transaction: false,
    })
  : undefined;

async function getSelectedRoleFromOAuthState() {
  const oauthState = await getOAuthState();
  return parseUserRole(oauthState?.role);
}

async function syncSelectedRoleForUser(userId: string | null | undefined) {
  if (!userId || !isDatabaseConfigured()) {
    return;
  }

  const selectedRole = await getSelectedRoleFromOAuthState();

  if (!selectedRole) {
    return;
  }

  await persistUserRole(userId, selectedRole);
}

export const auth = betterAuth({
  appName: "TrackLearn",
  baseURL: resolveBaseUrl(),
  basePath: "/api/auth",
  database,
  session: {
    // Role switching in this project needs to reflect immediately after a Mongo update.
    // Cookie-cached session snapshots can keep the previous role around briefly.
    cookieCache: {
      enabled: false,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  account: {
    accountLinking: {
      trustedProviders: ["google"],
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const selectedRole = await getSelectedRoleFromOAuthState();

          if (!selectedRole) {
            return;
          }

          return {
            data: {
              ...user,
              role: selectedRole,
            },
          };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          await syncSelectedRoleForUser(
            typeof session.userId === "string" ? session.userId : String(session.userId),
          );
        },
      },
    },
  },
  socialProviders:
    isGoogleAuthConfigured() && isDatabaseConfigured()
      ? {
          google: {
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          },
        }
      : {},
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;

export async function getSession(requestHeaders?: Headers): Promise<AuthSession | null> {
  return auth.api.getSession({
    headers: requestHeaders ?? (await headers()),
  });
}
