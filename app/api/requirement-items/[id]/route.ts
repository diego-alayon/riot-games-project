import { NextResponse } from "next/server";
import { requirementItemRepo } from "@/lib/db/repos";
import { ITEM_TAG_KEYS, isItemTag } from "@/lib/requirements/tags";

/** PUT { text?, tag? } — edits a drawer entry. `tag: null` clears its review tag (resolved). */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const hasText = typeof body?.text === "string";
  const hasTag = !!body && "tag" in body;
  if (!hasText && !hasTag) return NextResponse.json({ error: "text or tag is required" }, { status: 400 });
  if (hasTag && body.tag !== null && !isItemTag(body.tag))
    return NextResponse.json({ error: `tag must be null or one of ${ITEM_TAG_KEYS.join(", ")}` }, { status: 400 });
  if (!requirementItemRepo.get(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (hasText) requirementItemRepo.update(id, body.text);
  if (hasTag) requirementItemRepo.setTag(id, body.tag);
  return NextResponse.json(requirementItemRepo.get(id));
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  requirementItemRepo.delete(id);
  return NextResponse.json({ ok: true });
}
