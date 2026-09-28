import { NextResponse } from "next/server";
import { readSourceFile, SourcePathError, ARTIFACT_KINDS, type ArtifactKind } from "@/lib/import/source-repo";
import { parsePrdMarkdown } from "@/lib/import/prd-parser";

/**
 * Reads one artifact from an allow-listed local repo and returns it parsed.
 *
 * `kind=prd` returns the PRD metadata plus its defined FRs. Other kinds return
 * the raw content for now; the client-side epics parser still owns epics.md.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("path") ?? "";
  const kind = (searchParams.get("kind") ?? "prd") as ArtifactKind;

  if (!ARTIFACT_KINDS.includes(kind)) {
    return NextResponse.json(
      { error: `Unknown artifact kind "${kind}". Expected one of: ${ARTIFACT_KINDS.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const { path: realPath, content } = await readSourceFile(filePath);

    if (kind === "prd") {
      const parsed = parsePrdMarkdown(content);
      return NextResponse.json({ path: realPath, kind, content, parsed });
    }

    return NextResponse.json({ path: realPath, kind, content });
  } catch (err) {
    if (err instanceof SourcePathError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Could not read the artifact.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
