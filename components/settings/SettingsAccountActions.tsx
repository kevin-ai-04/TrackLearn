"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

interface SettingsAccountActionsProps {
  isAdmin: boolean;
}

export function SettingsAccountActions({ isAdmin }: SettingsAccountActionsProps) {
  const router = useRouter();
  const [isSignOutPending, setIsSignOutPending] = useState(false);

  const handleSignOutClick = async () => {
    if (!isSignOutPending) {
      setIsSignOutPending(true);
      return;
    }

    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/library" className="button-secondary px-4 py-3 font-semibold">
          Open Library
        </Link>
        {isAdmin ? (
          <Link href="/admin" className="button-secondary px-4 py-3 font-semibold">
            Open Admin Dashboard
          </Link>
        ) : null}
        <button
          type="button"
          onClick={handleSignOutClick}
          className={`px-4 py-3 font-semibold transition ${
            isSignOutPending ? "rounded-full bg-rose-600 text-white hover:bg-rose-700" : "button-secondary"
          }`}
        >
          {isSignOutPending ? "Confirm Sign Out" : "Sign Out"}
        </button>
        {isSignOutPending ? (
          <button
            type="button"
            onClick={() => setIsSignOutPending(false)}
            className="button-secondary px-4 py-3 font-semibold"
          >
            Cancel
          </button>
        ) : null}
      </div>
      {isSignOutPending ? (
        <p className="mt-4 text-sm text-rose-600">
          Signing out will end the current session on this device.
        </p>
      ) : null}
    </div>
  );
}
