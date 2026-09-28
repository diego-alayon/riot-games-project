/**
 * Imports a PRD functional-requirements table (see data/prd/*.json) into an
 * initiative: Initiative → Epic (EP-XXX) → FR. The PRD has no user stories, so
 * requirements hang directly off their epic (story_id stays null).
 *
 * Idempotent: epics are matched by code, requirements by (initiative, code), so
 * importing a newer PRD version updates rows in place instead of duplicating.
 */

import { randomUUID } from "crypto";
import { db } from "../db/client";

export interface PrdTableRequirement {
  code: string;
  page: string;
  feature: string;
  description: string;
  priority: string;
  status: string;
  source: string;
  woRef: string;
  owner: string;
  comments: string;
}

export interface PrdTableEpic {
  code: string;
  name: string;
  requirements: PrdTableRequirement[];
}

export interface PrdTableDocument {
  document: string;
  version: string;
  date?: string;
  epics: PrdTableEpic[];
}

export function isPrdTableDocument(x: unknown): x is PrdTableDocument {
  const d = x as PrdTableDocument;
  return !!d && typeof d.version === "string" && Array.isArray(d.epics) &&
    d.epics.every(e => typeof e.code === "string" && Array.isArray(e.requirements));
}

export function importPrdTable(initiativeId: string, doc: PrdTableDocument, fileName: string) {
  let epicsCreated = 0, created = 0, updated = 0;

  db.transaction(() => {
    doc.epics.forEach((epic, order) => {
      let row = db.prepare("SELECT id FROM epics WHERE initiative_id=? AND code=?").get(initiativeId, epic.code) as { id: string } | undefined;
      if (!row) {
        row = { id: randomUUID() };
        db.prepare("INSERT INTO epics (id, initiative_id, code, name, sort_order) VALUES (?,?,?,?,?)")
          .run(row.id, initiativeId, epic.code, epic.name, order);
        epicsCreated++;
      } else {
        db.prepare("UPDATE epics SET name=?, sort_order=? WHERE id=?").run(epic.name, order, row.id);
      }

      for (const r of epic.requirements) {
        const fields = {
          epic_id: row.id, story_id: null, area: epic.code.replace(/^EP-/, ""),
          page: r.page, feature: r.feature, description: r.description, priority: r.priority,
          status: r.status, source: r.source, wo_ref: r.woRef, owner: r.owner, comments: r.comments,
        };
        const existing = db.prepare("SELECT id FROM requirements WHERE initiative_id=? AND code=?").get(initiativeId, r.code) as { id: string } | undefined;
        if (existing) {
          const keys = Object.keys(fields);
          db.prepare(`UPDATE requirements SET ${keys.map(k => `${k}=?`).join(",")} WHERE id=?`).run(...Object.values(fields), existing.id);
          updated++;
        } else {
          const cols = ["id", "initiative_id", "code", ...Object.keys(fields)];
          db.prepare(`INSERT INTO requirements (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`)
            .run(randomUUID(), initiativeId, r.code, ...Object.values(fields));
          created++;
        }
      }
    });

    db.prepare("INSERT INTO import_history (id, file_name, file_content, initiative_id, mode) VALUES (?,?,?,?,?)")
      .run(randomUUID(), fileName, JSON.stringify(doc, null, 2), initiativeId, "prd-table");
  })();

  const total = doc.epics.reduce((a, e) => a + e.requirements.length, 0);
  return { epicsCreated, created, updated, total };
}
