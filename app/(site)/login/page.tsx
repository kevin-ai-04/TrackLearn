import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, getSession } from "@/auth";
import { isDatabaseConfigured, isGoogleAuthConfigured } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

async function signInWithGoogle() {
  "use server";

  const result = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL: "/my-library",
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
    redirect("/my-library");
  }

  const googleReady = isGoogleAuthConfigured() && isDatabaseConfigured();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center px-4 py-8 md:px-6">
      <section className="panel w-full rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Login
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Sign in to sync progress, manage private notes, and submit content for review.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
          TrackLearn uses Google sign-in through Better Auth. Once you sign in, your study progress can
          sync across devices and you can manage private subjects, modules, and materials.
        </p>

        {googleReady ? (
          <form action={signInWithGoogle} className="mt-8">
            <button type="submit" className="button-primary px-5 py-3 text-sm font-semibold">
              Continue With Google
            </button>
          </form>
        ) : (
          <div className="mt-8 rounded-[1.4rem] border border-amber-300/60 bg-amber-100/70 p-4 text-sm text-amber-900">
            Google sign-in is not configured yet. Set `MONGODB_URI`, `AUTH_SECRET`,
            `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` to enable authentication.
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link href="/" className="button-secondary px-4 py-3 font-semibold">
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}
