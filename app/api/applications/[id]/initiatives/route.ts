import { NextResponse } from "next/server";
import { appRepo } from "@/lib/db/repos";

export function GET(_: Request, { params }: { params: { id: string } }) {
  const app = appRepo.get(params.id);
  if (!app) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(appRepo.initiatives(params.id));
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { initiativeId } = await req.json();
  if (!initiativeId) return NextResponse.json({ error: "initiativeId required" }, { status: 400 });
  appRepo.linkInitiative(params.id, initiativeId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { initiativeId } = await req.json();
  if (!initiativeId) return NextResponse.json({ error: "initiativeId required" }, { status: 400 });
  appRepo.unlinkInitiative(params.id, initiativeId);
  return NextResponse.json({ ok: true });
}
