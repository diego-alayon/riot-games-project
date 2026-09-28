import { NextResponse } from "next/server";
import { appRepo } from "@/lib/db/repos";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = appRepo.get(id);
  if (!app) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(appRepo.initiatives(id));
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { initiativeId } = await req.json();
  if (!initiativeId) return NextResponse.json({ error: "initiativeId required" }, { status: 400 });
  appRepo.linkInitiative(id, initiativeId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { initiativeId } = await req.json();
  if (!initiativeId) return NextResponse.json({ error: "initiativeId required" }, { status: 400 });
  appRepo.unlinkInitiative(id, initiativeId);
  return NextResponse.json({ ok: true });
}
