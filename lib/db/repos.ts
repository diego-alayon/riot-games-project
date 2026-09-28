import { db } from "./client";
import { runMigrations } from "./schema";
import { randomUUID } from "crypto";
import type { PlatformKey } from "../requirements/platforms";
import type { RoleFields } from "../requirements/roles";

// Ensure schema exists on first import (server-side only)
runMigrations();

// ── Helpers ──────────────────────────────────────────────────────────────────
const uuid = () => randomUUID();

// ── Applications ─────────────────────────────────────────────────────────────
export const appRepo = {
  all: () => db.prepare("SELECT * FROM applications ORDER BY name").all(),
  get: (id: string) => db.prepare("SELECT * FROM applications WHERE id = ?").get(id),
  create: (name: string, slug: string, description: string, status = "active") => {
    const id = uuid();
    db.prepare("INSERT INTO applications (id,name,slug,description,status) VALUES (?,?,?,?,?)").run(id, name, slug, description, status);
    return id;
  },
  linkInitiative: (appId: string, initiativeId: string) =>
    db.prepare("INSERT OR IGNORE INTO app_initiative_links (app_id, initiative_id) VALUES (?,?)").run(appId, initiativeId),
  unlinkInitiative: (appId: string, initiativeId: string) =>
    db.prepare("DELETE FROM app_initiative_links WHERE app_id=? AND initiative_id=?").run(appId, initiativeId),
  initiatives: (appId: string) =>
    db.prepare(`SELECT i.* FROM initiatives i
      JOIN app_initiative_links l ON i.id = l.initiative_id
      WHERE l.app_id = ? ORDER BY i.name`).all(appId),
  appForInitiative: (initiativeId: string) =>
    db.prepare(`SELECT a.* FROM applications a
      JOIN app_initiative_links l ON a.id = l.app_id
      WHERE l.initiative_id = ? LIMIT 1`).get(initiativeId),
};

// ── Design Systems ────────────────────────────────────────────────────────────
export const dsRepo = {
  all: () => db.prepare("SELECT * FROM design_systems ORDER BY name").all(),
  get: (id: string) => db.prepare("SELECT * FROM design_systems WHERE id = ?").get(id),
  create: (name: string, version: string, description: string) => {
    const id = uuid();
    db.prepare("INSERT INTO design_systems (id,name,version,description) VALUES (?,?,?,?)").run(id, name, version, description);
    return id;
  },
  linkApp: (dsId: string, appId: string) =>
    db.prepare("INSERT OR IGNORE INTO ds_application_links (ds_id,app_id) VALUES (?,?)").run(dsId, appId),
  appsForDs: (dsId: string) =>
    db.prepare("SELECT a.* FROM applications a JOIN ds_application_links l ON a.id=l.app_id WHERE l.ds_id=?").all(dsId),
};

// ── Initiatives ───────────────────────────────────────────────────────────────
export const initiativeRepo = {
  all: () => db.prepare("SELECT * FROM initiatives ORDER BY name").all(),
  get: (id: string) => db.prepare("SELECT * FROM initiatives WHERE id = ?").get(id),
  create: (name: string, description: string) => {
    const id = uuid();
    db.prepare("INSERT INTO initiatives (id,name,description) VALUES (?,?,?)").run(id, name, description);
    return id;
  },
  update: (id: string, fields: Record<string, unknown>) => {
    const sets = Object.keys(fields).map(k => `${k}=?`).join(",");
    db.prepare(`UPDATE initiatives SET ${sets} WHERE id=?`).run(...Object.values(fields), id);
  },
  delete: (id: string) => db.prepare("DELETE FROM initiatives WHERE id=?").run(id),
};

// ── Epics ─────────────────────────────────────────────────────────────────────
export const epicRepo = {
  forInitiative: (initiativeId: string) =>
    db.prepare("SELECT * FROM epics WHERE initiative_id=? ORDER BY sort_order IS NULL, sort_order, start_date").all(initiativeId),
  get: (id: string) => db.prepare("SELECT * FROM epics WHERE id=?").get(id),
  create: (initiativeId: string, name: string, fields: Record<string, unknown> = {}) => {
    const id = uuid();
    db.prepare("INSERT INTO epics (id,initiative_id,name,start_date,due_date,assignee,progress) VALUES (?,?,?,?,?,?,?)")
      .run(id, initiativeId, name, fields.start_date ?? null, fields.due_date ?? null, fields.assignee ?? null, fields.progress ?? 0);
    return id;
  },
  update: (id: string, fields: Record<string, unknown>) => {
    const sets = Object.keys(fields).map(k => `${k}=?`).join(",");
    db.prepare(`UPDATE epics SET ${sets} WHERE id=?`).run(...Object.values(fields), id);
  },
  delete: (id: string) => db.prepare("DELETE FROM epics WHERE id=?").run(id),
};

// ── Stories ───────────────────────────────────────────────────────────────────
export const storyRepo = {
  forEpic: (epicId: string) =>
    db.prepare("SELECT * FROM stories WHERE epic_id=? ORDER BY start_date").all(epicId),
  get: (id: string) => db.prepare("SELECT * FROM stories WHERE id=?").get(id),
  create: (epicId: string, name: string, fields: Record<string, unknown> = {}) => {
    const id = uuid();
    db.prepare("INSERT INTO stories (id,epic_id,name,start_date,due_date,assignee,progress) VALUES (?,?,?,?,?,?,?)")
      .run(id, epicId, name, fields.start_date ?? null, fields.due_date ?? null, fields.assignee ?? null, fields.progress ?? 0);
    return id;
  },
  update: (id: string, fields: Record<string, unknown>) => {
    const sets = Object.keys(fields).map(k => `${k}=?`).join(",");
    db.prepare(`UPDATE stories SET ${sets} WHERE id=?`).run(...Object.values(fields), id);
  },
  delete: (id: string) => db.prepare("DELETE FROM stories WHERE id=?").run(id),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const taskRepo = {
  forStory: (storyId: string) =>
    db.prepare("SELECT * FROM tasks WHERE story_id=? ORDER BY start_date").all(storyId),
  get: (id: string) => db.prepare("SELECT * FROM tasks WHERE id=?").get(id),
  create: (storyId: string, name: string, fields: Record<string, unknown> = {}) => {
    const id = uuid();
    db.prepare("INSERT INTO tasks (id,story_id,name,start_date,due_date,assignee,progress) VALUES (?,?,?,?,?,?,?)")
      .run(id, storyId, name, fields.start_date ?? null, fields.due_date ?? null, fields.assignee ?? null, fields.progress ?? 0);
    return id;
  },
  update: (id: string, fields: Record<string, unknown>) => {
    const sets = Object.keys(fields).map(k => `${k}=?`).join(",");
    db.prepare(`UPDATE tasks SET ${sets} WHERE id=?`).run(...Object.values(fields), id);
  },
  delete: (id: string) => db.prepare("DELETE FROM tasks WHERE id=?").run(id),
};

// ── Requirements ──────────────────────────────────────────────────────────────
export const requirementRepo = {
  all: () => db.prepare("SELECT * FROM requirements ORDER BY code").all(),
  byInitiative: (initiativeId: string) =>
    db.prepare("SELECT * FROM requirements WHERE initiative_id=? ORDER BY code").all(initiativeId),
  byStory: (storyId: string) =>
    db.prepare("SELECT * FROM requirements WHERE story_id=? ORDER BY code").all(storyId),
  /** Requirements attached to the epic itself (PRD tables have no stories). */
  byEpicDirect: (epicId: string) =>
    db.prepare("SELECT * FROM requirements WHERE epic_id=? AND story_id IS NULL ORDER BY code").all(epicId),
  forInitiative: (initiativeId: string) =>
    db.prepare("SELECT * FROM requirements WHERE initiative_id=? ORDER BY code").all(initiativeId),
  get: (id: string) => db.prepare("SELECT * FROM requirements WHERE id=?").get(id),
  create: (data: {
    initiativeId?: string; epicId?: string; storyId?: string;
    code: string; area: string; description: string;
    source?: string; classification?: string; note?: string; view?: string;
  }) => {
    const id = uuid();
    db.prepare(`INSERT INTO requirements
      (id, initiative_id, epic_id, story_id, code, area, description, source, classification, implementation_note, prototype_view)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, data.initiativeId ?? null, data.epicId ?? null, data.storyId ?? null,
           data.code, data.area, data.description,
           data.source ?? null, data.classification ?? "build",
           data.note ?? null, data.view ?? null);
    return id;
  },
  update: (id: string, fields: Record<string, unknown>) => {
    const sets = Object.keys(fields).map(k => `${k}=?`).join(",");
    db.prepare(`UPDATE requirements SET ${sets} WHERE id=?`).run(...Object.values(fields), id);
  },
  delete: (id: string) => db.prepare("DELETE FROM requirements WHERE id=?").run(id),
};

// ── Requirement items (bullets in the requirement drawer) ────────────────────
export const REQUIREMENT_ITEM_KINDS = ["functional"] as const;
export type RequirementItemKind = (typeof REQUIREMENT_ITEM_KINDS)[number];

export const requirementItemRepo = {
  list: (requirementId: string, kind: RequirementItemKind, platform: PlatformKey) =>
    db.prepare("SELECT * FROM requirement_items WHERE requirement_id=? AND kind=? AND platform=? ORDER BY sort_order, created_at")
      .all(requirementId, kind, platform),
  get: (id: string) => db.prepare("SELECT * FROM requirement_items WHERE id=?").get(id),
  /** Inserts at `index` (0-based) or at the end of that platform's list, shifting the items after it. */
  create: (requirementId: string, kind: RequirementItemKind, platform: PlatformKey, text: string, index?: number) => {
    const id = uuid();
    db.transaction(() => {
      const ids = (requirementItemRepo.list(requirementId, kind, platform) as Array<{ id: string }>).map(r => r.id);
      const at = index === undefined ? ids.length : Math.max(0, Math.min(index, ids.length));
      ids.splice(at, 0, id);
      db.prepare("INSERT INTO requirement_items (id, requirement_id, kind, platform, text, sort_order) VALUES (?,?,?,?,?,?)")
        .run(id, requirementId, kind, platform, text, at);
      const setOrder = db.prepare("UPDATE requirement_items SET sort_order=? WHERE id=?");
      ids.forEach((itemId, i) => setOrder.run(i, itemId));
    })();
    return id;
  },
  update: (id: string, text: string) =>
    db.prepare("UPDATE requirement_items SET text=?, updated_at=datetime('now') WHERE id=?").run(text, id),
  delete: (id: string) => db.prepare("DELETE FROM requirement_items WHERE id=?").run(id),
};

// ── Requirement roles (roles table in the requirement drawer) ────────────────
export type RequirementRoleFields = RoleFields;

export const requirementRoleRepo = {
  list: (requirementId: string) =>
    db.prepare("SELECT * FROM requirement_roles WHERE requirement_id=? ORDER BY sort_order, created_at").all(requirementId),
  get: (id: string) => db.prepare("SELECT * FROM requirement_roles WHERE id=?").get(id),
  create: (requirementId: string, f: RequirementRoleFields) => {
    const id = uuid();
    const next = (db.prepare("SELECT COALESCE(MAX(sort_order) + 1, 0) AS n FROM requirement_roles WHERE requirement_id=?").get(requirementId) as { n: number }).n;
    db.prepare("INSERT INTO requirement_roles (id, requirement_id, role, capability, precondition, sort_order) VALUES (?,?,?,?,?,?)")
      .run(id, requirementId, f.role, f.capability, f.precondition || null, next);
    return id;
  },
  update: (id: string, f: RequirementRoleFields) =>
    db.prepare("UPDATE requirement_roles SET role=?, capability=?, precondition=?, updated_at=datetime('now') WHERE id=?")
      .run(f.role, f.capability, f.precondition || null, id),
  delete: (id: string) => db.prepare("DELETE FROM requirement_roles WHERE id=?").run(id),
};

// ── Documents ─────────────────────────────────────────────────────────────────
export const documentRepo = {
  forSection: (section: string) =>
    db.prepare("SELECT * FROM documents WHERE section=? ORDER BY created_at").all(section),
  get: (id: string) => db.prepare("SELECT * FROM documents WHERE id=?").get(id),
  create: (section: string, title: string, content = "") => {
    const id = uuid();
    db.prepare("INSERT INTO documents (id,section,title,content) VALUES (?,?,?,?)").run(id, section, title, content);
    return id;
  },
  update: (id: string, fields: Record<string, unknown>) => {
    const sets = Object.keys(fields).map(k => `${k}=?`).join(",");
    db.prepare(`UPDATE documents SET ${sets} WHERE id=?`).run(...Object.values(fields), id);
  },
  delete: (id: string) => db.prepare("DELETE FROM documents WHERE id=?").run(id),
};

// ── Full initiative tree (for timeline/table) ─────────────────────────────────
export function getInitiativeTree() {
  const initiatives = initiativeRepo.all() as any[];
  return initiatives.map((init) => {
    const app = appRepo.appForInitiative(init.id);
    const epics = (epicRepo.forInitiative(init.id) as any[]).map((epic) => {
      const stories = (storyRepo.forEpic(epic.id) as any[]).map((story) => {
        const tasks = taskRepo.forStory(story.id) as any[];
        const requirements = requirementRepo.byStory(story.id) as any[];
        return { ...story, tasks, requirements };
      });
      const requirements = requirementRepo.byEpicDirect(epic.id) as any[];
      return { ...epic, stories, requirements };
    });
    return { ...init, app: app ?? null, epics };
  });
}
