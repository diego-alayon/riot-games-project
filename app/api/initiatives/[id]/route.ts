import { NextResponse } from "next/server";
import { initiativeRepo } from "@/lib/db/repos";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  initiativeRepo.delete(id);
  return NextResponse.json({ ok: true });
}
