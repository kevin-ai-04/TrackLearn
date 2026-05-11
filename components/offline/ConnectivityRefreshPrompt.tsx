"use client";

import { useEffect, useRef, useState } from "react";
import { useAppConnectivity } from "@/hooks/useAppConnectivity";

export function ConnectivityRefreshPrompt() {
  const connectivity = useAppConnectivity();
  const startedOfflineRef = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (connectivity === "offline") {
      startedOfflineRef.current = true;
      setVisible(false);
      return;
    }

    if (connectivity === "online" && startedOfflineRef.current) {
      setVisible(true);
    }
  }, [connectivity]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex max-w-xl flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-xl sm:flex-row sm:items-center">
        <p className="text-sm leading-6 text-[var(--muted)]">
          You are back online. Refresh to load the latest courses and sync pending progress.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="button-primary px-3 py-2 text-sm font-semibold"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="button-secondary px-3 py-2 text-sm font-semibold"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
