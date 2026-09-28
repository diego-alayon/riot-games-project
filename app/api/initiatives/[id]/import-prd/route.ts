import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/schema";
import { readSourceFile, SourcePathError } from "@/lib/import/source-repo";
import { parsePrdMarkdown } from "@/lib/import/prd-parser";

// This route talks to the database directly rather than through repos.ts, so it
// has to ensure the schema exists the same way repos.ts does.
runMigrations();

interface Body {
  /** Artifact path inside an allow-listed source root. */
  path: string;
}

/**
 * Imports a BMAD prd.md into an initiative.
 *
 * The PRD is the phase that *defines* functional requirements, so it owns each
 * FR's canonical description and business area: an existing FR with the same
 * code is updated rather than duplicated, and epic/story links made by a
 * previous epics.md import are left untouched.
 *
 * The file is re-read and re-parsed here rather than trusting the client's
 * preview payload.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: initiativeId } = await params;

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.path) {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  const initiative = db.prepare("SELECT id, name FROM initiatives WHERE id = ?").get(initiativeId) as
    | { id: string; name: string }
    | undefined;
  if (!initiative) {
    return NextResponse.json({ error: "Initiative not found." }, { status: 404 });
  }

  let artifactPath: string;
  let content: string;
  try {
    const file = await readSourceFile(body.path);
    artifactPath = file.path;
    content = file.content;
  } catch (err) {
    if (err instanceof SourcePathError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const prd = parsePrdMarkdown(content);

  const selectByCode = db.prepare(
    "SELECT id FROM requirements WHERE initiative_id = ? AND code = ?",
  );
  const updateExisting = db.prepare(
    "UPDATE requirements SET description = ?, area = ?, source = ? WHERE id = ?",
  );
  const insertNew = db.prepare(
    `INSERT INTO requirements (id, initiative_id, code, area, description, source, classification)
     VALUES (?,?,?,?,?,?,'build')`,
  );
  const recordSource = db.prepare(
    `INSERT INTO requirement_sources (id, initiative_id, code, phase, artifact_path, description, area)
     VALUES (?,?,?,'prd',?,?,?)
     ON CONFLICT (initiative_id, code, phase) DO UPDATE SET
       artifact_path = excluded.artifact_path,
       description   = excluded.description,
       area          = excluded.area,
       imported_at   = datetime('now')`,
  );

  const run = db.transaction(() => {
    let created = 0;
    let updated = 0;

    for (const fr of prd.requirements) {
      const existing = selectByCode.get(initiativeId, fr.code) as { id: string } | undefined;

      if (existing) {
        updateExisting.run(fr.description, fr.area, "prd", existing.id);
        updated++;
      } else {
        insertNew.run(randomUUID(), initiativeId, fr.code, fr.area, fr.description, "prd");
        created++;
      }

      recordSource.run(randomUUID(), initiativeId, fr.code, artifactPath, fr.description, fr.area);
    }

    return { created, updated };
  });

  try {
    const result = run();

    db.prepare(
      `INSERT INTO import_history (id, file_name, file_content, initiative_id, mode)
       VALUES (?,?,?,?,?)`,
    ).run(randomUUID(), artifactPath, content, initiativeId, "prd");

    return NextResponse.json(
      {
        ok: true,
        artifactPath,
        metadata: prd.metadata,
        requirements: { created: result.created, updated: result.updated, total: prd.requirements.length },
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
