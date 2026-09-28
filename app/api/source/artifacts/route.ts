import { NextResponse } from "next/server";
import { listInitiativeFolders, sourceRoots } from "@/lib/import/source-repo";

/** Lists the BMAD initiative folders available on disk and which artifacts each has. */
export async function GET() {
  try {
    const folders = await listInitiativeFolders();
    return NextResponse.json({ roots: sourceRoots(), folders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not list source artifacts.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
