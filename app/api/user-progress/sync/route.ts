import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { syncUserProgressMutations } from "@/lib/user-progress-store";
import type { OfflineProgressMutation } from "@/types/offline";

export const dynamic = "force-dynamic";

function isProgressMutation(value: unknown): value is OfflineProgressMutation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const mutation = value as Partial<OfflineProgressMutation>;
  const moduleRef = mutation.moduleRef;

  return (
    typeof mutation.id === "string" &&
    mutation.schemaVersion === 1 &&
    typeof mutation.deviceId === "string" &&
    typeof mutation.clientCreatedAt === "string" &&
    (mutation.type === "visit" || mutation.type === "done" || mutation.type === "needsRevision") &&
    Boolean(moduleRef) &&
    typeof moduleRef?.subjectSlug === "string" &&
    typeof moduleRef?.moduleSlug === "string"
  );
}

export async function POST(request: Request) {
  const session = await getSession(request.headers);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    mutations?: unknown;
  };
  const mutations = Array.isArray(payload.mutations)
    ? payload.mutations.filter(isProgressMutation)
    : [];

  if (!mutations.length) {
    return NextResponse.json({ appliedMutationIds: [] });
  }

  const result = await syncUserProgressMutations({
    userId: session.user.id,
    mutations,
  });

  return NextResponse.json(result);
}
