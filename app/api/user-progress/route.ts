import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { saveUserProgress, getUserProgress } from "@/lib/user-progress-store";
import { normalizeHistoryState } from "@/lib/history";

export async function GET(request: Request) {
  const session = await getSession(request.headers);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await getUserProgress(session.user.id);
  return NextResponse.json(progress);
}

export async function PUT(request: Request) {
  const session = await getSession(request.headers);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    state?: unknown;
    migratedFromLocalAt?: string | null;
  };

  await saveUserProgress({
    userId: session.user.id,
    state: normalizeHistoryState(payload.state),
    migratedFromLocalAt: payload.migratedFromLocalAt ?? null,
  });

  return NextResponse.json({ ok: true });
}
