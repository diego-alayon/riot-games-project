import { NextResponse } from "next/server";
import { getInitiativeTree } from "@/lib/db/repos";

export function GET() {
  const tree = getInitiativeTree();
  return NextResponse.json(tree);
}
