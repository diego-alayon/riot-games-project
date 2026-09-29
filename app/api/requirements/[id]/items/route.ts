import { NextResponse } from "next/server";
import { PER_PLATFORM_KINDS, REQUIREMENT_ITEM_KINDS, requirementItemRepo, requirementRepo, type RequirementItemKind } from "@/lib/db/repos";
import { PLATFORM_KEYS, type ItemScope } from "@/lib/requirements/platforms";

function kindOf(value: string | null | undefined): RequirementItemKind | null {
  const k = value ?? "functional";
  return (REQUIREMENT_ITEM_KINDS as readonly string[]).includes(k) ? (k as RequirementItemKind) : null;
}

/** Per-platform kinds need riftbound | smartvenues; the others always use "all". */
function scopeOf(kind: RequirementItemKind, value: string | null | undefined): ItemScope | null {
  if (!PER_PLATFORM_KINDS.includes(kind)) return "all";
  return value && (PLATFORM_KEYS as readonly string[]).includes(value) ? (value as ItemScope) : null;
}

/** GET ?kind=functional&platform=riftbound|smartvenues, or ?kind=out_of_scope — ordered bullets of one list. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = new URL(req.url).searchParams;
  const kind = kindOf(q.get("kind"));
  if (!kind) return NextResponse.json({ error: "unknown kind" }, { status: 400 });
  const platform = scopeOf(kind, q.get("platform"));
  if (!platform) return NextResponse.json({ error: `platform must be one of ${PLATFORM_KEYS.join(", ")}` }, { status: 400 });
  return NextResponse.json(requirementItemRepo.list(id, kind, platform));
}

/** POST { text, kind?, platform?, index? } — adds a bullet (at `index`, or at the end). `platform` is required for functional bullets. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const kind = kindOf(body?.kind);
  if (!kind) return NextResponse.json({ error: "unknown kind" }, { status: 400 });
  const platform = scopeOf(kind, body?.platform);
  if (!platform) return NextResponse.json({ error: `platform must be one of ${PLATFORM_KEYS.join(", ")}` }, { status: 400 });
  if (typeof body?.text !== "string") return NextResponse.json({ error: "text is required" }, { status: 400 });
  if (!requirementRepo.get(id)) return NextResponse.json({ error: "requirement not found" }, { status: 404 });
  const index = Number.isInteger(body.index) ? body.index : undefined;
  const itemId = requirementItemRepo.create(id, kind, platform, body.text, index);
  return NextResponse.json(requirementItemRepo.get(itemId), { status: 201 });
}
