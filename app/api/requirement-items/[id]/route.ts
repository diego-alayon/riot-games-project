import { NextResponse } from "next/server";
import { requirementItemRepo } from "@/lib/db/repos";

/** PUT { text } — edits a requirement bullet. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (typeof body?.text !== "string") return NextResponse.json({ error: "text is required" }, { status: 400 });
  if (!requirementItemRepo.get(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  requirementItemRepo.update(id, body.text);
  return NextResponse.json(requirementItemRepo.get(id));
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  requirementItemRepo.delete(id);
  return NextResponse.json({ ok: true });
}
