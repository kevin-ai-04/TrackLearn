import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { ObjectId } from "mongodb";
import { getDatabase, getMongoClient, isDatabaseConfigured, isGoogleAuthConfigured } from "@/lib/mongodb";
import type { UserRole } from "@/types/content";
import type { AuthUserDocument } from "@/types/database";

async function resolveUserRole(userId: string | undefined | null) {
  if (!userId || !isDatabaseConfigured()) {
    return "user" as const;
  }

  const db = await getDatabase();
  const user = await db.collection<AuthUserDocument>("users").findOne({
    _id: new ObjectId(userId),
  });

  if (!user) {
    return "user" as const;
  }

  if (!user.role) {
    await db.collection<AuthUserDocument>("users").updateOne(
      { _id: user._id },
      { $set: { role: "user" } },
    );
  }

  return user.role ?? "user";
}

const providers = isGoogleAuthConfigured()
  ? [
      Google({
        allowDangerousEmailAccountLinking: true,
      }),
    ]
  : [];

const adapter = isDatabaseConfigured() ? MongoDBAdapter(getMongoClient()) : undefined;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  session: {
    strategy: adapter ? "database" : "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.role = (user.role as UserRole | undefined) ?? (await resolveUserRole(user.id));
      } else if (token.sub && !token.role) {
        token.role = await resolveUserRole(token.sub);
      }

      return token;
    },
    async session({ session, token, user }) {
      const userId = user?.id || token?.sub;
      const userRole = user?.role || token?.role;

      if (session.user && userId) {
        session.user.id = userId;
        session.user.role = (userRole as UserRole | undefined) ?? (await resolveUserRole(userId));
      }

      return session;
    },
    async signIn({ user }) {
      if (user.id && isDatabaseConfigured() && ObjectId.isValid(user.id)) {
        const db = await getDatabase();
        await db.collection<AuthUserDocument>("users").updateOne(
          { _id: new ObjectId(user.id) },
          { $set: { role: user.role ?? "user" } },
        );
      }

      return true;
    },
  },
});
