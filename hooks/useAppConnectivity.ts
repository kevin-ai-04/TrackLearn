"use client";

import { useEffect, useState } from "react";

export type AppConnectivity = "checking" | "online" | "offline";

async function canReachAppServer() {
  if (!navigator.onLine) {
    return false;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 1800);

  try {
    const response = await fetch(`/api/health?ts=${Date.now()}`, {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function useAppConnectivity() {
  const [status, setStatus] = useState<AppConnectivity>("checking");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const reachable = await canReachAppServer();

      if (!cancelled) {
        setStatus(reachable ? "online" : "offline");
      }
    };

    void check();

    const interval = window.setInterval(check, 5000);
    window.addEventListener("online", check);
    window.addEventListener("offline", check);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("online", check);
      window.removeEventListener("offline", check);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  return status;
}
