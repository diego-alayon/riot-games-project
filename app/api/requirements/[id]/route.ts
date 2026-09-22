import { NextResponse } from "next/server";
import { requirementRepo } from "@/lib/db/repos";

export function GET(_: Request, { params }: { params: { id: string } }) {
  const req = requirementRepo.get(params.id);
  if (!req) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(req);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const allowed = ["code", "area", "description", "source", "classification", "implementation_note", "prototype_view", "initiative_id", "epic_id", "story_id"];
  const fields: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) fields[key] = body[key];
  if (Object.keys(fields).length === 0) return NextResponse.json({ error: "no fields" }, { status: 400 });
  requirementRepo.update(params.id, fields);
  return NextResponse.json({ ok: true });
}

export function DELETE(_: Request, { params }: { params: { id: string } }) {
  requirementRepo.delete(params.id);
  return NextResponse.json({ ok: true });
}
