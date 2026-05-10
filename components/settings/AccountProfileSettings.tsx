"use client";

import { useActionState } from "react";
import type { UserRole } from "@/types/content";
import type { UsernameUpdateState } from "@/app/(site)/settings/actions";
import { updateViewerUsername } from "@/app/(site)/settings/actions";

interface AccountProfileSettingsProps {
  profile: {
    name: string | null;
    username: string | null;
    email: string | null;
    emailVerified: boolean;
    role: UserRole;
    joinedAtLabel: string;
    updatedAtLabel: string;
  };
}

const initialState: UsernameUpdateState = {
  status: "idle",
  message: "",
};

function formatRole(role: UserRole) {
  return role === "admin" ? "Admin" : "User";
}

export function AccountProfileSettings({ profile }: AccountProfileSettingsProps) {
  const [state, formAction, pending] = useActionState(updateViewerUsername, initialState);

  return (
    <section className="panel mb-4 rounded-xl p-6 sm:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Account
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Profile details
          </h2>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-[var(--panel-alt)] p-4">
              <dt className="text-sm text-[var(--muted)]">Display name</dt>
              <dd className="mt-1 break-words font-semibold">{profile.name ?? "Not set"}</dd>
            </div>
            <div className="rounded-lg bg-[var(--panel-alt)] p-4">
              <dt className="text-sm text-[var(--muted)]">Email</dt>
              <dd className="mt-1 break-words font-semibold">{profile.email ?? "Not available"}</dd>
              <dd className="mt-1 text-xs text-[var(--muted)]">
                {profile.emailVerified ? "Verified" : "Verification status unavailable"}
              </dd>
            </div>
            <div className="rounded-lg bg-[var(--panel-alt)] p-4">
              <dt className="text-sm text-[var(--muted)]">Date joined</dt>
              <dd className="mt-1 font-semibold">{profile.joinedAtLabel}</dd>
            </div>
            <div className="rounded-lg bg-[var(--panel-alt)] p-4">
              <dt className="text-sm text-[var(--muted)]">Current role</dt>
              <dd className="mt-1 font-semibold">{formatRole(profile.role)}</dd>
            </div>
          </dl>

          <p className="mt-4 text-sm text-[var(--muted)]">
            Last profile update: {profile.updatedAtLabel}
          </p>
        </div>

        <form
          action={formAction}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel-alt)] p-5 xl:max-w-md"
        >
          <label htmlFor="username" className="text-sm font-semibold">
            Custom username
          </label>
          <input
            id="username"
            name="username"
            className="field mt-3"
            defaultValue={profile.username ?? ""}
            minLength={3}
            maxLength={32}
            pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,31}"
            placeholder="username"
          />
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            3 to 32 characters. Letters, numbers, underscores, and hyphens are allowed.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="button-primary mt-4 w-full px-4 py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? "Saving..." : "Save Username"}
          </button>
          {state.message ? (
            <p
              className={`mt-3 text-sm ${
                state.status === "error" ? "text-rose-600" : "text-[var(--accent)]"
              }`}
              aria-live="polite"
            >
              {state.message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
