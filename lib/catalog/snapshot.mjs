/**
 * The requirement catalog as a versioned file: data/catalog/<initiative-id>.json.
 *
 * data/app.db is local and gitignored, so everything written in the manager
 * (drawer bullets, roles, out of scope, acceptance criteria, catalog edits) is
 * mirrored into this file, which lives in git. On an empty database the file
 * is loaded back (restoreCatalog). Timestamps are left out and keys are sorted,
 * so the file changes only when the content does.
 *
 * Plain ESM so the manager (lib/db/catalog-sync.ts) and the `npm run fr` CLI share it.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";

/** @typedef {import("better-sqlite3").Database} Database */
/** @typedef {Record<string, unknown>} Row */

export const CATALOG_DIR = path.join(process.cwd(), "data", "catalog");
const FORMAT = "catalog/1";
const TIMESTAMPS = ["created_at", "updated_at"];

/**
 * Copy of `row` without timestamps or the `drop` keys. `first` keys lead and the
 * rest follow alphabetically, so the column order of a given database never shows in the file.
 * @param {Row} row
 * @param {string[]} first
 * @param {string[]} [drop]
 */
function clean(row, first, drop = []) {
  const skip = new Set([...TIMESTAMPS, ...drop]);
  const keys = Object.keys(row).filter(k => !skip.has(k));
  const rest = keys.filter(k => !first.includes(k)).sort();
  /** @type {Row} */
  const out = {};
  for (const k of [...first.filter(k => keys.includes(k)), ...rest]) out[k] = row[k];
  return out;
}

/**
 * @param {Database} db
 * @param {Row} init
 */
function buildSnapshot(db, init) {
  const id = init.id;
  const applications = db.prepare(`SELECT a.* FROM applications a JOIN app_initiative_links l ON l.app_id = a.id
    WHERE l.initiative_id = ? ORDER BY a.id`).all(id);
  const epics = db.prepare("SELECT * FROM epics WHERE initiative_id = ? ORDER BY sort_order IS NULL, sort_order, code, id").all(id);
  const stories = db.prepare(`SELECT s.* FROM stories s JOIN epics e ON e.id = s.epic_id
    WHERE e.initiative_id = ? ORDER BY s.epic_id, s.start_date, s.id`).all(id);
  const tasks = db.prepare(`SELECT t.* FROM tasks t JOIN stories s ON s.id = t.story_id JOIN epics e ON e.id = s.epic_id
    WHERE e.initiative_id = ? ORDER BY t.story_id, t.start_date, t.id`).all(id);

  const items = db.prepare(`SELECT id, kind, platform, seq, sort_order, text FROM requirement_items
    WHERE requirement_id = ? ORDER BY CASE kind WHEN 'functional' THEN 0 WHEN 'acceptance' THEN 1 ELSE 2 END, platform, sort_order, seq, id`);
  const roles = db.prepare(`SELECT id, role, capability, precondition, sort_order FROM requirement_roles
    WHERE requirement_id = ? ORDER BY sort_order, id`);
  const counters = db.prepare("SELECT kind, last_seq FROM requirement_item_counters WHERE requirement_id = ? ORDER BY kind");

  const requirements = /** @type {Row[]} */ (db.prepare("SELECT * FROM requirements WHERE initiative_id = ? ORDER BY code, id").all(id))
    .map(r => ({
      ...clean(r, ["id", "code", "feature", "description", "epic_id", "story_id"], ["initiative_id"]),
      items: items.all(r.id),
      roles: roles.all(r.id),
      counters: Object.fromEntries(/** @type {{kind: string, last_seq: number}[]} */ (counters.all(r.id)).map(c => [c.kind, c.last_seq])),
    }));

  return {
    format: FORMAT,
    initiative: clean(/** @type {Row} */ (init), ["id", "name", "description"]),
    applications: /** @type {Row[]} */ (applications).map(a => clean(a, ["id", "name", "slug"])),
    epics: /** @type {Row[]} */ (epics).map(e => clean(e, ["id", "code", "name"], ["initiative_id"])),
    stories: /** @type {Row[]} */ (stories).map(s => clean(s, ["id", "epic_id", "name"])),
    tasks: /** @type {Row[]} */ (tasks).map(t => clean(t, ["id", "story_id", "name"])),
    requirements,
  };
}

/**
 * Writes one file per initiative, only when its content changed.
 * @param {Database} db
 * @returns {string[]} the files written
 */
export function snapshotCatalog(db) {
  mkdirSync(CATALOG_DIR, { recursive: true });
  const written = [];
  for (const init of /** @type {Row[]} */ (db.prepare("SELECT * FROM initiatives ORDER BY id").all())) {
    const file = path.join(CATALOG_DIR, `${init.id}.json`);
    const json = `${JSON.stringify(buildSnapshot(db, init), null, 2)}\n`;
    if (existsSync(file) && readFileSync(file, "utf8") === json) continue;
    writeFileSync(file, json);
    written.push(file);
  }
  return written;
}

/**
 * Inserts `row` into `table`, keeping only columns the table has, so a file
 * written by an older or newer schema still loads.
 * @param {Database} db
 * @param {string} table
 * @param {Row} row
 */
function insert(db, table, row) {
  const cols = new Set(/** @type {{name: string}[]} */ (db.prepare(`PRAGMA table_info(${table})`).all()).map(c => c.name));
  const keys = Object.keys(row).filter(k => cols.has(k) && row[k] !== undefined);
  db.prepare(`INSERT OR IGNORE INTO ${table} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`)
    .run(...keys.map(k => row[k]));
}

/**
 * Loads every catalog file into an empty database. Does nothing when the
 * database already holds requirements, so it never overwrites local work.
 * @param {Database} db
 * @returns {number} requirements restored
 */
export function restoreCatalog(db) {
  if (!existsSync(CATALOG_DIR)) return 0;
  const { n } = /** @type {{n: number}} */ (db.prepare("SELECT COUNT(*) AS n FROM requirements").get());
  if (n > 0) return 0;

  let restored = 0;
  db.transaction(() => {
    for (const name of readdirSync(CATALOG_DIR).filter(f => f.endsWith(".json")).sort()) {
      const doc = JSON.parse(readFileSync(path.join(CATALOG_DIR, name), "utf8"));
      if (doc.format !== FORMAT) continue;
      const initiativeId = doc.initiative.id;
      insert(db, "initiatives", doc.initiative);
      for (const a of doc.applications ?? []) {
        insert(db, "applications", a);
        insert(db, "app_initiative_links", { app_id: a.id, initiative_id: initiativeId });
      }
      for (const e of doc.epics ?? []) insert(db, "epics", { ...e, initiative_id: initiativeId });
      for (const s of doc.stories ?? []) insert(db, "stories", s);
      for (const t of doc.tasks ?? []) insert(db, "tasks", t);
      for (const { items = [], roles = [], counters = {}, ...r } of doc.requirements ?? []) {
        insert(db, "requirements", { ...r, initiative_id: initiativeId });
        for (const it of items) insert(db, "requirement_items", { ...it, requirement_id: r.id });
        for (const ro of roles) insert(db, "requirement_roles", { ...ro, requirement_id: r.id });
        for (const [kind, last_seq] of Object.entries(counters)) insert(db, "requirement_item_counters", { requirement_id: r.id, kind, last_seq });
        restored++;
      }
    }
  })();
  return restored;
}
