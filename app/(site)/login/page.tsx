import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, getSession } from "@/auth";
import { userRoleOptions } from "@/lib/auth-roles";
import { isDatabaseConfigured, isGoogleAuthConfigured } from "@/lib/mongodb";
import type { UserRole } from "@/types/content";

export const dynamic = "force-dynamic";

async function signInWithGoogle(selectedRole: UserRole) {
  "use server";

  const result = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL: selectedRole === "admin" ? "/admin" : "/my-library",
      additionalData: {
        role: selectedRole,
      },
    },
  });

  if (result.url) {
    redirect(result.url);
  }

  throw new Error("Google sign-in did not return a redirect URL.");
}

export default async function LoginPage() {
  const session = await getSession();

  if (session?.user.id) {
    redirect(session.user.role === "admin" ? "/admin" : "/my-library");
  }

  const googleReady = isGoogleAuthConfigured() && isDatabaseConfigured();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center px-4 py-8 md:px-6">
      <section className="panel w-full rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Login
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Choose a testing role.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Pick the role to test as, then sign in with Google. The selected role is stored in MongoDB and can also be
          changed later from the settings page.
        </p>

        {googleReady ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {userRoleOptions.map((roleOption) => (
              <form
                key={roleOption.value}
                action={signInWithGoogle.bind(null, roleOption.value)}
                className="rounded-[1.6rem] border border-[var(--border)] bg-[var(--panel-alt)] p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  {roleOption.label}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Join as {roleOption.label}
                </h2>
                <p className="mt-3 min-h-20 text-sm leading-6 text-[var(--muted)]">
                  {roleOption.description}
                </p>
                <button type="submit" className="button-primary mt-6 w-full px-5 py-3 text-sm font-semibold">
                  Continue With Google
                </button>
              </form>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[1.4rem] border border-amber-300/60 bg-amber-100/70 p-4 text-sm text-amber-900">
            Google sign-in is not configured yet. Set `MONGODB_URI`, `AUTH_SECRET`,
            `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` to enable authentication.
          </div>
        )}

        {googleReady ? (
          <p className="mt-6 text-sm text-[var(--muted)]">
            The selected role can be changed later in settings. For evaluation purposes only.
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link href="/" className="button-secondary px-4 py-3 font-semibold">
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}
