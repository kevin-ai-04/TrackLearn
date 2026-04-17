import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="panel w-full rounded-[2rem] p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Missing Content
        </p>
        <h1 className="mt-4 text-4xl font-semibold">That study page does not exist.</h1>
        <p className="mt-4 text-base text-[var(--muted)]">
          Check the shared catalog routes or go back to the subject index.
        </p>
        <Link
          href="/"
          className="button-primary mt-8 inline-flex items-center justify-center px-5 py-3 text-sm font-semibold"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
