import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
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

export const auth = betterAuth({
  appName: "TrackLearn",
  baseURL: resolveBaseUrl(),
  basePath: "/api/auth",
  database,
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
