import { db } from "./client";

export function runMigrations() {
  db.exec(`
    -- ── APPLICATIONS ──────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS applications (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      slug        TEXT NOT NULL UNIQUE,
      description TEXT,
      status      TEXT NOT NULL DEFAULT 'active',  -- active | reserved
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ── DESIGN SYSTEMS ────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS design_systems (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      version     TEXT NOT NULL DEFAULT '1.0.0',
      description TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ── DESIGN SYSTEM ↔ APPLICATION (many-to-many) ────────────────────────
    CREATE TABLE IF NOT EXISTS ds_application_links (
      ds_id  TEXT NOT NULL REFERENCES design_systems(id) ON DELETE CASCADE,
      app_id TEXT NOT NULL REFERENCES applications(id)   ON DELETE CASCADE,
      PRIMARY KEY (ds_id, app_id)
    );

    -- ── INITIATIVES ───────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS initiatives (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      status      TEXT NOT NULL DEFAULT 'active',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ── EPICS ─────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS epics (
      id             TEXT PRIMARY KEY,
      initiative_id  TEXT NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
      name           TEXT NOT NULL,
      description    TEXT,
      start_date     TEXT,
      due_date       TEXT,
      assignee       TEXT,
      progress       INTEGER NOT NULL DEFAULT 0,
      created_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ── USER STORIES ──────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS stories (
      id          TEXT PRIMARY KEY,
      epic_id     TEXT NOT NULL REFERENCES epics(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      description TEXT,
      start_date  TEXT,
      due_date    TEXT,
      assignee    TEXT,
      progress    INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ── TECHNICAL TASKS ───────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS tasks (
      id          TEXT PRIMARY KEY,
      story_id    TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      description TEXT,
      start_date  TEXT,
      due_date    TEXT,
      assignee    TEXT,
      progress    INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ── FUNCTIONAL REQUIREMENTS ───────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS requirements (
      id                  TEXT PRIMARY KEY,
      initiative_id       TEXT REFERENCES initiatives(id) ON DELETE SET NULL,
      code                TEXT NOT NULL UNIQUE,
      area                TEXT NOT NULL,
      description         TEXT NOT NULL,
      source              TEXT,
      classification      TEXT NOT NULL DEFAULT 'build',  -- build | native | out
      implementation_note TEXT,
      prototype_view      TEXT,
      created_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ── ARCHITECTURE DOCUMENTS ────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS documents (
      id           TEXT PRIMARY KEY,
      section      TEXT NOT NULL,  -- Architecture | Infrastructure
      title        TEXT NOT NULL,
      content      TEXT,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ── PROTOTYPES ────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS prototypes (
      id          TEXT PRIMARY KEY,
      app_id      TEXT REFERENCES applications(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      description TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ── PROTOTYPE PAGES ───────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS prototype_pages (
      id           TEXT PRIMARY KEY,
      prototype_id TEXT NOT NULL REFERENCES prototypes(id) ON DELETE CASCADE,
      name         TEXT NOT NULL,
      order_idx    INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- ── TRACEABILITY: requirement ↔ prototype_page ────────────────────────
    CREATE TABLE IF NOT EXISTS req_page_links (
      req_id  TEXT NOT NULL REFERENCES requirements(id)      ON DELETE CASCADE,
      page_id TEXT NOT NULL REFERENCES prototype_pages(id)   ON DELETE CASCADE,
      PRIMARY KEY (req_id, page_id)
    );

    -- ── TRACEABILITY: requirement ↔ task ──────────────────────────────────
    CREATE TABLE IF NOT EXISTS req_task_links (
      req_id  TEXT NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
      task_id TEXT NOT NULL REFERENCES tasks(id)        ON DELETE CASCADE,
      PRIMARY KEY (req_id, task_id)
    );

    -- ── APPLICATION ↔ INITIATIVE (many-to-many) ───────────────────────────
    CREATE TABLE IF NOT EXISTS app_initiative_links (
      app_id        TEXT NOT NULL REFERENCES applications(id)  ON DELETE CASCADE,
      initiative_id TEXT NOT NULL REFERENCES initiatives(id)   ON DELETE CASCADE,
      PRIMARY KEY (app_id, initiative_id)
    );
  `);

  // Additive migrations — safe to run on existing DB (errors are expected if columns already exist)
  try { db.exec(`ALTER TABLE requirements ADD COLUMN story_id TEXT REFERENCES stories(id) ON DELETE SET NULL`); } catch {}
  try { db.exec(`ALTER TABLE requirements ADD COLUMN epic_id  TEXT REFERENCES epics(id)   ON DELETE SET NULL`); } catch {}
  // PRD table columns (ID · Página · Funcionalidad · Descripción · Prioridad · Estado ·
  // Fuente · Ref. WO · Owner · Comentarios). `code`, `description` and `source` already exist.
  // `platforms` (JSON array of platform keys) and `due_date` (ISO date) are edited in the catalog.
  for (const col of ["page", "feature", "priority", "status", "wo_ref", "owner", "comments", "platforms", "due_date"]) {
    try { db.exec(`ALTER TABLE requirements ADD COLUMN ${col} TEXT`); } catch {}
  }
  // PRD epics carry their own code (EP-ACC, EP-FND…).
  try { db.exec(`ALTER TABLE epics ADD COLUMN code TEXT`); } catch {}
  try { db.exec(`ALTER TABLE epics ADD COLUMN sort_order INTEGER`); } catch {}
  // The original schema declared `code TEXT NOT NULL UNIQUE`, making a requirement
  // code globally unique. Codes are only unique *within* an initiative — every
  // BMAD initiative numbers its requirements from FR1 — so that constraint let
  // only one initiative own "FR1" and made every later import silently drop the
  // colliding rows. SQLite cannot alter a constraint, so rebuild the table once.
  rebuildRequirementsUniqueConstraint();

  // Tracks, per FR code, which planning artifact it appeared in. The same FR is
  // defined in the PRD, designed in architecture.md and implemented in epics.md;
  // one row per (initiative, code, phase) records that coverage plus whatever the
  // artifact contributed, so a later import cannot silently drop an earlier phase.
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS requirement_sources (
      id            TEXT PRIMARY KEY,
      initiative_id TEXT NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
      code          TEXT NOT NULL,
      phase         TEXT NOT NULL,           -- prd | architecture | epics
      artifact_path TEXT NOT NULL,
      description   TEXT,
      area          TEXT,
      imported_at   TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (initiative_id, code, phase)
    )`);
  } catch {}

  // Ordered detail lines of a requirement, shown as bullets in its drawer.
  // `kind` keeps room for other lists (e.g. acceptance criteria) in the same table.
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS requirement_items (
      id             TEXT PRIMARY KEY,
      requirement_id TEXT NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
      kind           TEXT NOT NULL DEFAULT 'functional',
      text           TEXT NOT NULL,
      sort_order     INTEGER NOT NULL DEFAULT 0,
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_requirement_items_req ON requirement_items (requirement_id, kind, sort_order)`);
  } catch {}
  // Each bullet belongs to one delivery platform (riftbound | smartvenues); the
  // drawer shows one block per platform. Bullets written before this default to Riftbound.
  try { db.exec(`ALTER TABLE requirement_items ADD COLUMN platform TEXT NOT NULL DEFAULT 'riftbound'`); } catch {}

  // Roles table in the requirement drawer: which role the requirement supports,
  // what it lets that role do, and any special precondition.
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS requirement_roles (
      id             TEXT PRIMARY KEY,
      requirement_id TEXT NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
      role           TEXT NOT NULL,
      capability     TEXT NOT NULL,
      precondition   TEXT,
      sort_order     INTEGER NOT NULL DEFAULT 0,
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_requirement_roles_req ON requirement_roles (requirement_id, sort_order)`);
  } catch {}

  try {
    db.exec(`CREATE TABLE IF NOT EXISTS import_history (
      id            TEXT PRIMARY KEY,
      file_name     TEXT NOT NULL,
      file_content  TEXT NOT NULL,
      initiative_id TEXT REFERENCES initiatives(id) ON DELETE SET NULL,
      mode          TEXT NOT NULL DEFAULT 'replace',
      imported_at   TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
  } catch {}
}

/**
 * Replaces the global UNIQUE on requirements.code with UNIQUE (initiative_id, code).
 *
 * No-op once the table already carries the composite constraint. Deliberately
 * not wrapped in a silent catch: this rewrites a table, so a failure must
 * surface rather than leave the schema half-migrated.
 */
function rebuildRequirementsUniqueConstraint() {
  interface IndexRow { name: string; unique: number; origin: string }
  interface IndexCol { name: string }

  const indexes = db.prepare("PRAGMA index_list(requirements)").all() as IndexRow[];
  const hasGlobalCodeUnique = indexes.some(idx => {
    if (!idx.unique || idx.origin !== "u") return false;
    const cols = (db.prepare(`PRAGMA index_info("${idx.name}")`).all() as IndexCol[]).map(c => c.name);
    return cols.length === 1 && cols[0] === "code";
  });

  if (!hasGlobalCodeUnique) return;

  // PRAGMA foreign_keys is a no-op inside a transaction, so it is toggled around it.
  db.pragma("foreign_keys = OFF");
  try {
    db.transaction(() => {
      db.exec(`
        DROP TABLE IF EXISTS requirements_rebuild;

        CREATE TABLE requirements_rebuild (
          id                  TEXT PRIMARY KEY,
          initiative_id       TEXT REFERENCES initiatives(id) ON DELETE SET NULL,
          code                TEXT NOT NULL,
          area                TEXT NOT NULL,
          description         TEXT NOT NULL,
          source              TEXT,
          classification      TEXT NOT NULL DEFAULT 'build',
          implementation_note TEXT,
          prototype_view      TEXT,
          created_at          TEXT NOT NULL DEFAULT (datetime('now')),
          story_id            TEXT REFERENCES stories(id) ON DELETE SET NULL,
          epic_id             TEXT REFERENCES epics(id)   ON DELETE SET NULL,
          UNIQUE (initiative_id, code)
        );

        INSERT INTO requirements_rebuild
          (id, initiative_id, code, area, description, source, classification,
           implementation_note, prototype_view, created_at, story_id, epic_id)
        SELECT
           id, initiative_id, code, area, description, source, classification,
           implementation_note, prototype_view, created_at, story_id, epic_id
        FROM requirements;

        DROP TABLE requirements;
        ALTER TABLE requirements_rebuild RENAME TO requirements;
      `);
    })();
  } finally {
    db.pragma("foreign_keys = ON");
  }
}
