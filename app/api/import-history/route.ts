import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export function GET() {
  const rows = db.prepare(`
    SELECT h.id, h.file_name, h.imported_at, h.mode, h.initiative_id, i.name as initiative_name
    FROM import_history h
    LEFT JOIN initiatives i ON i.id = h.initiative_id
    ORDER BY h.imported_at DESC
  `).all();
  return NextResponse.json(rows);
}
