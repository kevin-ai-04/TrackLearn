import { AppShell } from "@/components/layout/AppShell";

function LoadingBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[color:color-mix(in_srgb,var(--panel-alt)_92%,transparent)] ${className}`}
    />
  );
}

export default function SiteLoading() {
  return (
    <AppShell
      subjects={[]}
      currentPathLabel="Loading page"
      currentPathHint="Preparing the next view."
      loading
    >
      <div className="space-y-4">
        <section className="panel rounded-xl p-6 sm:p-8">
          <LoadingBlock className="h-3 w-28" />
          <LoadingBlock className="mt-4 h-10 w-full max-w-2xl" />
          <LoadingBlock className="mt-4 h-4 w-full max-w-3xl" />
          <LoadingBlock className="mt-2 h-4 w-full max-w-2xl" />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <LoadingBlock className="h-56 w-full rounded-xl" />
            <LoadingBlock className="h-56 w-full rounded-xl" />
          </div>
          <LoadingBlock className="h-[28rem] w-full rounded-xl" />
        </section>
      </div>
    </AppShell>
  );
}
