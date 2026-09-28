import { NextResponse } from "next/server";
import { requirementRepo, requirementRoleRepo } from "@/lib/db/repos";
import { roleFields } from "@/lib/requirements/roles";

/** GET — roles the requirement supports, in order. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(requirementRoleRepo.list(id));
}

/** POST { role, capability, precondition? } — appends a role row. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fields = roleFields(await req.json().catch(() => null));
  if (typeof fields === "string") return NextResponse.json({ error: fields }, { status: 400 });
  if (!requirementRepo.get(id)) return NextResponse.json({ error: "requirement not found" }, { status: 404 });
  const rowId = requirementRoleRepo.create(id, fields);
  return NextResponse.json(requirementRoleRepo.get(rowId), { status: 201 });
}
