import { NextResponse } from "next/server";
import { initiativeRepo } from "@/lib/db/repos";

export function GET() {
  const data = initiativeRepo.all();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { name, description } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const id = initiativeRepo.create(name, description ?? "");
  return NextResponse.json({ id }, { status: 201 });
}
