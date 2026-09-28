import { NextResponse } from "next/server";
import { REQUIREMENT_ITEM_KINDS, requirementItemRepo, requirementRepo, type RequirementItemKind } from "@/lib/db/repos";

function kindOf(value: string | null): RequirementItemKind | null {
  const k = value ?? "functional";
  return (REQUIREMENT_ITEM_KINDS as readonly string[]).includes(k) ? (k as RequirementItemKind) : null;
}

/** GET ?kind=functional — ordered bullets of a requirement. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kind = kindOf(new URL(req.url).searchParams.get("kind"));
  if (!kind) return NextResponse.json({ error: "unknown kind" }, { status: 400 });
  return NextResponse.json(requirementItemRepo.list(id, kind));
}

/** POST { text, kind?, index? } — adds a bullet (at `index`, or at the end). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const kind = kindOf(body?.kind ?? null);
  if (!kind) return NextResponse.json({ error: "unknown kind" }, { status: 400 });
  if (typeof body?.text !== "string") return NextResponse.json({ error: "text is required" }, { status: 400 });
  if (!requirementRepo.get(id)) return NextResponse.json({ error: "requirement not found" }, { status: 404 });
  const index = Number.isInteger(body.index) ? body.index : undefined;
  const itemId = requirementItemRepo.create(id, kind, body.text, index);
  return NextResponse.json(requirementItemRepo.get(itemId), { status: 201 });
}
