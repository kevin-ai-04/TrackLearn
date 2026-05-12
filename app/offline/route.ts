import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const markup = await readFile(path.join(process.cwd(), "public", "offline", "index.html"), "utf8");

  return new Response(markup, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0",
    },
  });
}
