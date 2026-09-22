import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { epicRepo, storyRepo, requirementRepo } from "@/lib/db/repos";
import { randomUUID } from "crypto";

interface FRInput   { code: string; description: string; area: string; classification: string; }
interface StoryInput{ name: string; frs: FRInput[]; }
interface EpicInput { name: string; stories: StoryInput[]; }
interface ImportBody{ mode: "replace" | "merge"; epics: EpicInput[]; fileName?: string; fileContent?: string; }

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: initiativeId } = await params;
  const body: ImportBody = await req.json();

  if (!body.mode || !Array.isArray(body.epics)) {
    return NextResponse.json({ error: "mode and epics required" }, { status: 400 });
  }

  // Use a transaction for atomicity
  const run = db.transaction(() => {
    if (body.mode === "replace") {
      // Cascade deletes stories, tasks, and requirements via FK
      db.prepare("DELETE FROM epics WHERE initiative_id = ?").run(initiativeId);
    }

    let epicCount = 0, storyCount = 0, frCount = 0;

    for (const epicInput of body.epics) {
      const epicId = epicRepo.create(initiativeId, epicInput.name);
      epicCount++;

      for (const storyInput of epicInput.stories) {
        const storyId = storyRepo.create(epicId, storyInput.name);
        storyCount++;

        for (const frInput of storyInput.frs) {
          // Ensure code uniqueness — skip if already exists in replace mode
          try {
            requirementRepo.create({
              initiativeId,
              epicId,
              storyId,
              code:           frInput.code,
              area:           frInput.area ?? "—",
              description:    frInput.description,
              classification: frInput.classification ?? "build",
            });
            frCount++;
          } catch {
            // duplicate code — skip
          }
        }
      }
    }

    return { epics: epicCount, stories: storyCount, requirements: frCount };
  });

  try {
    const result = run();

    // Persist import history record with full file content
    if (body.fileName && body.fileContent) {
      db.prepare(`INSERT INTO import_history (id, file_name, file_content, initiative_id, mode) VALUES (?,?,?,?,?)`)
        .run(randomUUID(), body.fileName, body.fileContent, initiativeId, body.mode);
    }

    return NextResponse.json({ ok: true, inserted: result }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
