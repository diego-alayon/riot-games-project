import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/schema";
import { importPrdTable, isPrdTableDocument } from "@/lib/import/prd-table";

// Talks to the database directly, so it ensures the schema like repos.ts does.
runMigrations();

/**
 * Imports a PRD functional-requirements table (JSON, see data/prd/) into an
 * initiative. Body: { fileName, document }.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: initiativeId } = await params;

  let body: { fileName?: string; document?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isPrdTableDocument(body.document)) {
    return NextResponse.json({ error: "document must be a PRD table (version + epics[])." }, { status: 400 });
  }
  if (!db.prepare("SELECT 1 FROM initiatives WHERE id=?").get(initiativeId)) {
    return NextResponse.json({ error: "Initiative not found." }, { status: 404 });
  }

  const result = importPrdTable(initiativeId, body.document, body.fileName ?? `PRD ${body.document.version}.json`);
  return NextResponse.json({ requirements: result });
}
