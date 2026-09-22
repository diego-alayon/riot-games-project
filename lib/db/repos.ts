import { db } from "./client";
import { runMigrations } from "./schema";
import { randomUUID } from "crypto";

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
    db.prepare("SELECT * FROM epics WHERE initiative_id=? ORDER BY start_date").all(initiativeId),
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
      return { ...epic, stories };
    });
    return { ...init, app: app ?? null, epics };
  });
}
