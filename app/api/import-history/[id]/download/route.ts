import { db } from "@/lib/db/client";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = db.prepare("SELECT file_name, file_content FROM import_history WHERE id = ?").get(id) as
    { file_name: string; file_content: string } | undefined;

  if (!row) return new Response("Not found", { status: 404 });

  return new Response(row.file_content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${row.file_name}"`,
    },
  });
}
