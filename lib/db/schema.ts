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
  `);
}
