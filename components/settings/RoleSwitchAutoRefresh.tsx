"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const ROLE_REFRESH_DELAY_MS = 300;

export function RoleSwitchAutoRefresh() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetch } = authClient.useSession();
  const roleUpdated = searchParams.get("roleUpdated");

  useEffect(() => {
    if (roleUpdated !== "1") {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      await refetch();
      router.replace(pathname, { scroll: false });
      router.refresh();
    }, ROLE_REFRESH_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname, refetch, roleUpdated, router]);

  return null;
}
