export function GET() {
  return Response.json({
    ok: true,
    checkedAt: new Date().toISOString(),
  });
}
