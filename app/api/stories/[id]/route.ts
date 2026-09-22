import { NextResponse } from "next/server";
import { storyRepo } from "@/lib/db/repos";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  storyRepo.delete(id);
  return NextResponse.json({ ok: true });
}
