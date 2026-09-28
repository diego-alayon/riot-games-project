import { NextResponse } from "next/server";
import { requirementRepo } from "@/lib/db/repos";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const req = requirementRepo.get(id);
  if (!req) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(req);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const allowed = ["code", "area", "description", "source", "classification", "implementation_note", "prototype_view", "initiative_id", "epic_id", "story_id",
    "page", "feature", "priority", "status", "wo_ref", "owner", "comments"];
  const fields: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) fields[key] = body[key];
  if (Object.keys(fields).length === 0) return NextResponse.json({ error: "no fields" }, { status: 400 });
  requirementRepo.update(id, fields);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  requirementRepo.delete(id);
  return NextResponse.json({ ok: true });
}
