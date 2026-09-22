import { NextResponse } from "next/server";
import { epicRepo } from "@/lib/db/repos";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  epicRepo.delete(id);
  return NextResponse.json({ ok: true });
}
