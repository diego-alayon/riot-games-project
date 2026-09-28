import { NextResponse } from "next/server";
import { REQUIREMENT_ITEM_KINDS, requirementItemRepo, requirementRepo, type RequirementItemKind } from "@/lib/db/repos";
import { PLATFORM_KEYS, type PlatformKey } from "@/lib/requirements/platforms";

function kindOf(value: string | null | undefined): RequirementItemKind | null {
  const k = value ?? "functional";
  return (REQUIREMENT_ITEM_KINDS as readonly string[]).includes(k) ? (k as RequirementItemKind) : null;
}

function platformOf(value: string | null | undefined): PlatformKey | null {
  return value && (PLATFORM_KEYS as readonly string[]).includes(value) ? (value as PlatformKey) : null;
}

/** GET ?platform=riftbound|smartvenues&kind=functional — ordered bullets of one platform block. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = new URL(req.url).searchParams;
  const kind = kindOf(q.get("kind"));
  const platform = platformOf(q.get("platform"));
  if (!kind) return NextResponse.json({ error: "unknown kind" }, { status: 400 });
  if (!platform) return NextResponse.json({ error: `platform must be one of ${PLATFORM_KEYS.join(", ")}` }, { status: 400 });
  return NextResponse.json(requirementItemRepo.list(id, kind, platform));
}

/** POST { text, platform, kind?, index? } — adds a bullet (at `index`, or at the end). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const kind = kindOf(body?.kind);
  const platform = platformOf(body?.platform);
  if (!kind) return NextResponse.json({ error: "unknown kind" }, { status: 400 });
  if (!platform) return NextResponse.json({ error: `platform must be one of ${PLATFORM_KEYS.join(", ")}` }, { status: 400 });
  if (typeof body?.text !== "string") return NextResponse.json({ error: "text is required" }, { status: 400 });
  if (!requirementRepo.get(id)) return NextResponse.json({ error: "requirement not found" }, { status: 404 });
  const index = Number.isInteger(body.index) ? body.index : undefined;
  const itemId = requirementItemRepo.create(id, kind, platform, body.text, index);
  return NextResponse.json(requirementItemRepo.get(itemId), { status: 201 });
}
