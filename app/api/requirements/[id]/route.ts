import { NextResponse } from "next/server";
import { requirementRepo } from "@/lib/db/repos";
import { serializePlatforms, type PlatformKey } from "@/lib/requirements/platforms";

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
    "page", "feature", "priority", "status", "wo_ref", "owner", "comments", "platforms", "due_date"];
  const fields: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) fields[key] = body[key];
  if ("platforms" in fields) {
    if (!Array.isArray(fields.platforms)) return NextResponse.json({ error: "platforms must be an array" }, { status: 400 });
    fields.platforms = serializePlatforms(fields.platforms as PlatformKey[]);
  }
  if ("due_date" in fields && fields.due_date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(String(fields.due_date))) {
    return NextResponse.json({ error: "due_date must be YYYY-MM-DD or null" }, { status: 400 });
  }
  if (Object.keys(fields).length === 0) return NextResponse.json({ error: "no fields" }, { status: 400 });
  requirementRepo.update(id, fields);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  requirementRepo.delete(id);
  return NextResponse.json({ ok: true });
}
