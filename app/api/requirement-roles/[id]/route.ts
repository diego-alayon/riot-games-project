import { NextResponse } from "next/server";
import { requirementRoleRepo } from "@/lib/db/repos";
import { roleFields } from "@/lib/requirements/roles";

/** PUT { role, capability, precondition? } — replaces a role row. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fields = roleFields(await req.json().catch(() => null));
  if (typeof fields === "string") return NextResponse.json({ error: fields }, { status: 400 });
  if (!requirementRoleRepo.get(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  requirementRoleRepo.update(id, fields);
  return NextResponse.json(requirementRoleRepo.get(id));
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  requirementRoleRepo.delete(id);
  return NextResponse.json({ ok: true });
}
