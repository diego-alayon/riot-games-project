#!/usr/bin/env node
/**
 * Functional-requirement bullets from the command line — the same data the
 * requirement drawer edits (requirement_items). Writes straight to SQLite, so
 * the dev server does not need to be running; reopen the drawer to see changes.
 *
 *   npm run fr -- list [CODE]
 *   npm run fr -- add CODE <riftbound|smartvenues> "text" ["text" ...]
 *   npm run fr -- edit ITEM_ID "new text"
 *   npm run fr -- rm ITEM_ID [ITEM_ID ...]
 *
 *   npm run fr -- roles [CODE]
 *   npm run fr -- role-add CODE "Rol" "Funcionalidad soportada" ["Precondición"]
 *   npm run fr -- role-edit ROLE_ID "Rol" "Funcionalidad soportada" ["Precondición"]
 *   npm run fr -- role-rm ROLE_ID [ROLE_ID ...]
 *
 * CODE is the PRD requirement ID (e.g. ACC-01). ITEM_ID prefixes (first 8
 * characters, as printed by `list`) are accepted.
 */

import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import path from "path";

const PLATFORMS = { riftbound: "Riftbound Ticketing Portal", smartvenues: "SmartVenues" };
const KIND = "functional";

const db = new Database(path.join(process.cwd(), "data", "app.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const fail = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

const hasTable = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='requirement_items'").get();
if (!hasTable) fail("requirement_items does not exist yet — start the manager once (npm run dev) so it runs its migrations.");
const cols = db.prepare("PRAGMA table_info(requirement_items)").all().map((c) => c.name);
if (!cols.includes("platform")) db.exec("ALTER TABLE requirement_items ADD COLUMN platform TEXT NOT NULL DEFAULT 'riftbound'");

function requirement(code) {
  const rows = db
    .prepare("SELECT r.id, r.code, r.feature, i.name AS initiative FROM requirements r LEFT JOIN initiatives i ON i.id = r.initiative_id WHERE upper(r.code) = upper(?)")
    .all(code);
  if (rows.length === 0) fail(`No requirement with code ${code}.`);
  if (rows.length > 1) fail(`${code} exists in several initiatives: ${rows.map((r) => r.initiative).join(", ")}.`);
  return rows[0];
}

function item(idOrPrefix) {
  const rows = db.prepare("SELECT * FROM requirement_items WHERE id LIKE ?").all(`${idOrPrefix}%`);
  if (rows.length === 0) fail(`No item ${idOrPrefix}.`);
  if (rows.length > 1) fail(`${idOrPrefix} matches ${rows.length} items — use more characters.`);
  return rows[0];
}

function list(code) {
  if (code) requirement(code);
  const rows = db
    .prepare(
      `SELECT r.code, r.feature, i.id, i.platform, i.text FROM requirement_items i
       JOIN requirements r ON r.id = i.requirement_id
       WHERE i.kind = ? AND (? IS NULL OR upper(r.code) = upper(?))
       ORDER BY r.code, i.platform, i.sort_order, i.created_at`,
    )
    .all(KIND, code ?? null, code ?? null);
  if (rows.length === 0) return console.log(code ? `${code.toUpperCase()}: no functional requirements yet.` : "No functional requirements yet.");
  let last = "";
  for (const r of rows) {
    const head = `${r.code} · ${r.feature ?? ""}  —  ${PLATFORMS[r.platform] ?? r.platform}`;
    if (head !== last) console.log(`\n${head}`);
    last = head;
    console.log(`  ${r.id.slice(0, 8)}  • ${r.text}`);
  }
}

function add(code, platform, texts) {
  if (!PLATFORMS[platform]) fail(`Platform must be one of: ${Object.keys(PLATFORMS).join(", ")}.`);
  const clean = texts.map((t) => t.trim()).filter(Boolean);
  if (clean.length === 0) fail("Nothing to add.");
  const req = requirement(code);
  db.transaction(() => {
    let order = db
      .prepare("SELECT COALESCE(MAX(sort_order) + 1, 0) AS n FROM requirement_items WHERE requirement_id=? AND kind=? AND platform=?")
      .get(req.id, KIND, platform).n;
    const ins = db.prepare("INSERT INTO requirement_items (id, requirement_id, kind, platform, text, sort_order) VALUES (?,?,?,?,?,?)");
    for (const text of clean) ins.run(randomUUID(), req.id, KIND, platform, text, order++);
  })();
  console.log(`✓ ${clean.length} added to ${req.code} · ${req.feature ?? ""} (${PLATFORMS[platform]})`);
  list(req.code);
}

/* ── Roles table (requirement_roles) ─────────────────────────────────────── */

const KNOWN_ROLES = [
  "Visitante anónimo", "Fan autenticado", "Operador Riot (backoffice)", "Staff de check-in",
  "Beneficiario de cortesía", "Soporte a fans de Riot", "Soporte de plataforma de Globant",
];

function ensureRolesTable() {
  const ok = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='requirement_roles'").get();
  if (!ok) fail("requirement_roles does not exist yet — start the manager once (npm run dev) so it runs its migrations.");
}

/** Matches a known role case-insensitively; unknown roles are kept as written, with a warning. */
function roleName(input) {
  const hit = KNOWN_ROLES.find((r) => r.toLowerCase() === input.trim().toLowerCase());
  if (!hit) console.warn(`! "${input}" is not one of the PRD roles (${KNOWN_ROLES.join(", ")}). Saved as written.`);
  return hit ?? input.trim();
}

function roleRow(idOrPrefix) {
  const rows = db.prepare("SELECT * FROM requirement_roles WHERE id LIKE ?").all(`${idOrPrefix}%`);
  if (rows.length === 0) fail(`No role row ${idOrPrefix}.`);
  if (rows.length > 1) fail(`${idOrPrefix} matches ${rows.length} rows — use more characters.`);
  return rows[0];
}

function listRoles(code) {
  ensureRolesTable();
  if (code) requirement(code);
  const rows = db
    .prepare(
      `SELECT r.code, r.feature, x.id, x.role, x.capability, x.precondition FROM requirement_roles x
       JOIN requirements r ON r.id = x.requirement_id
       WHERE (? IS NULL OR upper(r.code) = upper(?))
       ORDER BY r.code, x.sort_order, x.created_at`,
    )
    .all(code ?? null, code ?? null);
  if (rows.length === 0) return console.log(code ? `${code.toUpperCase()}: no roles yet.` : "No roles yet.");
  let last = "";
  for (const r of rows) {
    const head = `${r.code} · ${r.feature ?? ""}`;
    if (head !== last) console.log(`\n${head}`);
    last = head;
    console.log(`  ${r.id.slice(0, 8)}  ${r.role} — ${r.capability}${r.precondition ? `  [precondición: ${r.precondition}]` : ""}`);
  }
}

const [cmd, ...args] = process.argv.slice(2);
switch (cmd) {
  case "list":
    list(args[0]);
    break;
  case "add":
    if (args.length < 3) fail('Usage: add CODE <riftbound|smartvenues> "text" ["text" ...]');
    add(args[0], args[1].toLowerCase(), args.slice(2));
    break;
  case "edit": {
    if (args.length < 2 || !args[1].trim()) fail('Usage: edit ITEM_ID "new text"');
    const it = item(args[0]);
    db.prepare("UPDATE requirement_items SET text=?, updated_at=datetime('now') WHERE id=?").run(args[1].trim(), it.id);
    console.log(`✓ Updated ${it.id.slice(0, 8)}`);
    break;
  }
  case "rm":
    if (args.length === 0) fail("Usage: rm ITEM_ID [ITEM_ID ...]");
    for (const a of args) {
      const it = item(a);
      db.prepare("DELETE FROM requirement_items WHERE id=?").run(it.id);
      console.log(`✓ Removed ${it.id.slice(0, 8)} — ${it.text}`);
    }
    break;
  case "roles":
    listRoles(args[0]);
    break;
  case "role-add": {
    ensureRolesTable();
    if (args.length < 3 || !args[2].trim()) fail('Usage: role-add CODE "Rol" "Funcionalidad soportada" ["Precondición"]');
    const req = requirement(args[0]);
    const next = db.prepare("SELECT COALESCE(MAX(sort_order) + 1, 0) AS n FROM requirement_roles WHERE requirement_id=?").get(req.id).n;
    db.prepare("INSERT INTO requirement_roles (id, requirement_id, role, capability, precondition, sort_order) VALUES (?,?,?,?,?,?)")
      .run(randomUUID(), req.id, roleName(args[1]), args[2].trim(), args[3]?.trim() || null, next);
    console.log(`✓ Role added to ${req.code} · ${req.feature ?? ""}`);
    listRoles(req.code);
    break;
  }
  case "role-edit": {
    ensureRolesTable();
    if (args.length < 3 || !args[2].trim()) fail('Usage: role-edit ROLE_ID "Rol" "Funcionalidad soportada" ["Precondición"]');
    const row = roleRow(args[0]);
    db.prepare("UPDATE requirement_roles SET role=?, capability=?, precondition=?, updated_at=datetime('now') WHERE id=?")
      .run(roleName(args[1]), args[2].trim(), args[3]?.trim() || null, row.id);
    console.log(`✓ Updated ${row.id.slice(0, 8)}`);
    break;
  }
  case "role-rm":
    ensureRolesTable();
    if (args.length === 0) fail("Usage: role-rm ROLE_ID [ROLE_ID ...]");
    for (const a of args) {
      const row = roleRow(a);
      db.prepare("DELETE FROM requirement_roles WHERE id=?").run(row.id);
      console.log(`✓ Removed ${row.id.slice(0, 8)} — ${row.role}`);
    }
    break;
  default:
    console.log('Usage:\n  npm run fr -- list [CODE]\n  npm run fr -- add CODE <riftbound|smartvenues> "text" ["text" ...]\n  npm run fr -- edit ITEM_ID "new text"\n  npm run fr -- rm ITEM_ID [ITEM_ID ...]\n  npm run fr -- roles [CODE]\n  npm run fr -- role-add CODE "Rol" "Funcionalidad soportada" ["Precondición"]\n  npm run fr -- role-edit ROLE_ID "Rol" "Funcionalidad soportada" ["Precondición"]\n  npm run fr -- role-rm ROLE_ID [ROLE_ID ...]');
}
