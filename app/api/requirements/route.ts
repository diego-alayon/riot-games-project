import { NextResponse } from "next/server";
import { requirementRepo } from "@/lib/db/repos";

export function GET() {
  return NextResponse.json(requirementRepo.all());
}

export async function POST(req: Request) {
  const body = await req.json();
  const { initiativeId, epicId, storyId, code, area, description, source, classification, note, view } = body;
  if (!code || !description) {
    return NextResponse.json({ error: "code and description required" }, { status: 400 });
  }
  const id = requirementRepo.create({ initiativeId, epicId, storyId, code, area: area ?? "—", description, source, classification, note, view });
  return NextResponse.json({ id }, { status: 201 });
}
