#!/usr/bin/env node
/**
 * Functional-requirement bullets from the command line — the same data the
 * requirement drawer edits (requirement_items). Writes straight to SQLite, so
 * the dev server does not need to be running; reopen the drawer to see changes.
 *
 *   npm run fr -- list [CODE]
 *   npm run fr -- add CODE <riftbound|smartvenues|acceptance|out-of-scope|comment> "text" ["text" ...]
 *   npm run fr -- edit ID "new text"
 *   npm run fr -- tag ID <pending-riot|pending-architecture|pending-engineering|pending-product|out-of-scope|none>
 *   npm run fr -- rm ID [ID ...]
 *
 *   npm run fr -- roles [CODE]
 *   npm run fr -- role-add CODE "Rol" "Funcionalidad soportada" ["Precondición"]
 *   npm run fr -- role-edit ROLE_ID "Rol" "Funcionalidad soportada" ["Precondición"]
 *   npm run fr -- role-rm ROLE_ID [ROLE_ID ...]
 *
 *   npm run fr -- snapshot     rewrite data/catalog/*.json from the database
 *
 * Every change is also written to data/catalog/*.json (lib/catalog/snapshot.mjs),
 * the git-tracked copy of the catalog.
 *
 * CODE is the PRD requirement ID (e.g. ACC-01). ID is an entry's stable ID as
 * printed by `list` (FND-06.2, FND-06.AC1, FND-06.OOS1, FND-06.C1) or a UUID prefix.
 * `tag … none` clears the tag (the point is resolved).
 */

import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import path from "path";
import { snapshotCatalog } from "../lib/catalog/snapshot.mjs";

const PLATFORMS = { riftbound: "Riftbound Ticketing Portal", smartvenues: "SmartVenues" };
/** CLI target → (kind, scope) in requirement_items. */
const TARGETS = {
  riftbound: { kind: "functional", scope: "riftbound", label: PLATFORMS.riftbound },
  smartvenues: { kind: "functional", scope: "smartvenues", label: PLATFORMS.smartvenues },
  acceptance: { kind: "acceptance", scope: "all", label: "Criterios de aceptación" },
  "out-of-scope": { kind: "out_of_scope", scope: "all", label: "Out of scope" },
  comment: { kind: "comment", scope: "all", label: "Comentarios" },
};
const PREFIX = { functional: "", acceptance: "AC", out_of_scope: "OOS", comment: "C" }; // keep in sync with lib/requirements/items.ts
// Keep in sync with ITEM_TAGS in lib/requirements/tags.ts.
const TAGS = {
  "pending-riot": "Pending Riot Games confirmation",
  "pending-architecture": "Pending architectural confirmation",
  "pending-engineering": "Pending engineering confirmation",
  "pending-product": "Pending product definition",
  "out-of-scope": "Out of scope",
};
const SECTION_LABEL = { out_of_scope: "Out of scope", acceptance: "Criterios de aceptación", comment: "Comentarios" };
const labelOf = (kind, scope) => SECTION_LABEL[kind] ?? PLATFORMS[scope] ?? scope;
const KIND_ORDER = "CASE i.kind WHEN 'functional' THEN 0 WHEN 'acceptance' THEN 1 WHEN 'out_of_scope' THEN 2 ELSE 3 END";
const stableId = (code, kind, seq) => (seq ? `${code}.${PREFIX[kind] ?? ""}${seq}` : "(sin ID)");

/** Next stable sequence number for (requirement, kind); never reuses a deleted one. */
function nextSeq(requirementId, kind) {
  return db
    .prepare(
      `INSERT INTO requirement_item_counters (requirement_id, kind, last_seq)
       VALUES (?, ?, COALESCE((SELECT MAX(seq) FROM requirement_items WHERE requirement_id = ? AND kind = ?), 0) + 1)
       ON CONFLICT (requirement_id, kind) DO UPDATE SET last_seq = last_seq + 1
       RETURNING last_seq`,
    )
    .get(requirementId, kind, requirementId, kind).last_seq;
}

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
if (!cols.includes("platform") || !cols.includes("seq") || !cols.includes("tag") ||
    !db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='requirement_item_counters'").get())
  fail("The database schema is out of date — start the manager once (npm run dev) so it runs its migrations.");

function requirement(code) {
  const rows = db
    .prepare("SELECT r.id, r.code, r.feature, i.name AS initiative FROM requirements r LEFT JOIN initiatives i ON i.id = r.initiative_id WHERE upper(r.code) = upper(?)")
    .all(code);
  if (rows.length === 0) fail(`No requirement with code ${code}.`);
  if (rows.length > 1) fail(`${code} exists in several initiatives: ${rows.map((r) => r.initiative).join(", ")}.`);
  return rows[0];
}

/** Finds an entry by stable ID (FND-06.2, FND-06.AC1, FND-06.OOS1, FND-06.C1) or by UUID prefix. */
function item(ref) {
  const m = ref.match(/^([A-Z0-9]+-[A-Z0-9]+)\.(AC|OOS|C)?(\d+)$/i);
  if (m) {
    const req = requirement(m[1]);
    const kind = { AC: "acceptance", OOS: "out_of_scope", C: "comment" }[(m[2] ?? "").toUpperCase()] ?? "functional";
    const row = db.prepare("SELECT * FROM requirement_items WHERE requirement_id=? AND kind=? AND seq=?").get(req.id, kind, Number(m[3]));
    if (!row) fail(`No entry ${ref.toUpperCase()}.`);
    return row;
  }
  const rows = db.prepare("SELECT * FROM requirement_items WHERE id LIKE ?").all(`${ref}%`);
  if (rows.length === 0) fail(`No entry ${ref}.`);
  if (rows.length > 1) fail(`${ref} matches ${rows.length} entries — use more characters or the stable ID.`);
  return rows[0];
}

function list(code) {
  if (code) requirement(code);
  const rows = db
    .prepare(
      `SELECT r.code, r.feature, i.id, i.kind, i.platform, i.seq, i.tag, i.text FROM requirement_items i
       JOIN requirements r ON r.id = i.requirement_id
       WHERE (? IS NULL OR upper(r.code) = upper(?))
       ORDER BY r.code, ${KIND_ORDER}, i.platform, i.sort_order, i.created_at`,
    )
    .all(code ?? null, code ?? null);
  if (rows.length === 0) return console.log(code ? `${code.toUpperCase()}: no bullets yet.` : "No bullets yet.");
  let last = "";
  for (const r of rows) {
    const head = `${r.code} · ${r.feature ?? ""}  —  ${labelOf(r.kind, r.platform)}`;
    if (head !== last) console.log(`\n${head}`);
    last = head;
    const tag = r.tag ? `  [${TAGS[r.tag] ?? r.tag}]` : "";
    console.log(`  ${stableId(r.code, r.kind, r.seq).padEnd(14)} ${r.kind === "out_of_scope" ? "⊘" : "•"} ${r.text}${tag}`);
  }
}

function add(code, target, texts) {
  const t = TARGETS[target];
  if (!t) fail(`Target must be one of: ${Object.keys(TARGETS).join(", ")}.`);
  const clean = texts.map((x) => x.trim()).filter(Boolean);
  if (clean.length === 0) fail("Nothing to add.");
  const req = requirement(code);
  db.transaction(() => {
    let order = db
      .prepare("SELECT COALESCE(MAX(sort_order) + 1, 0) AS n FROM requirement_items WHERE requirement_id=? AND kind=? AND platform=?")
      .get(req.id, t.kind, t.scope).n;
    const ins = db.prepare("INSERT INTO requirement_items (id, requirement_id, kind, platform, text, sort_order, seq) VALUES (?,?,?,?,?,?,?)");
    for (const text of clean) ins.run(randomUUID(), req.id, t.kind, t.scope, text, order++, nextSeq(req.id, t.kind));
  })();
  console.log(`✓ ${clean.length} added to ${req.code} · ${req.feature ?? ""} (${t.label})`);
  list(req.code);
}

/* ── Roles table (requirement_roles) ─────────────────────────────────────── */

// Keep in sync with ROLES in lib/requirements/roles.ts.
const KNOWN_ROLES = ["Fan", "Chief Sales Operator"];

function ensureRolesTable() {
  const ok = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='requirement_roles'").get();
  if (!ok) fail("requirement_roles does not exist yet — start the manager once (npm run dev) so it runs its migrations.");
}

/** Matches a known role case-insensitively; unknown roles are kept as written, with a warning. */
function roleName(input) {
  const hit = KNOWN_ROLES.find((r) => r.toLowerCase() === input.trim().toLowerCase());
  if (!hit) console.warn(`! "${input}" is not one of the roles (${KNOWN_ROLES.join(", ")}). Saved as written.`);
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
const WRITES = new Set(["add", "edit", "tag", "rm", "role-add", "role-edit", "role-rm", "snapshot"]);
switch (cmd) {
  case "list":
    list(args[0]);
    break;
  case "add":
    if (args.length < 3) fail('Usage: add CODE <riftbound|smartvenues|acceptance|out-of-scope|comment> "text" ["text" ...]');
    add(args[0], args[1].toLowerCase(), args.slice(2));
    break;
  case "edit": {
    if (args.length < 2 || !args[1].trim()) fail('Usage: edit ID "new text"');
    const it = item(args[0]);
    db.prepare("UPDATE requirement_items SET text=?, updated_at=datetime('now') WHERE id=?").run(args[1].trim(), it.id);
    console.log(`✓ Updated ${args[0].toUpperCase()}`);
    break;
  }
  case "tag": {
    const key = (args[1] ?? "").toLowerCase();
    if (args.length < 2 || (key !== "none" && !TAGS[key])) fail(`Usage: tag ID <${[...Object.keys(TAGS), "none"].join("|")}>`);
    const it = item(args[0]);
    db.prepare("UPDATE requirement_items SET tag=?, updated_at=datetime('now') WHERE id=?").run(key === "none" ? null : key, it.id);
    console.log(key === "none" ? `✓ ${args[0].toUpperCase()}: tag cleared (resolved)` : `✓ ${args[0].toUpperCase()}: ${TAGS[key]}`);
    break;
  }
  case "rm":
    if (args.length === 0) fail("Usage: rm ID [ID ...]");
    for (const a of args) {
      const it = item(a);
      db.prepare("DELETE FROM requirement_items WHERE id=?").run(it.id);
      console.log(`✓ Removed ${a.toUpperCase()} — ${it.text}`);
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
  case "snapshot":
    break;
  default:
    console.log('Usage:\n  npm run fr -- list [CODE]\n  npm run fr -- add CODE <riftbound|smartvenues|acceptance|out-of-scope|comment> "text" ["text" ...]\n  npm run fr -- edit ID "new text"\n  npm run fr -- tag ID <pending-riot|pending-architecture|pending-engineering|pending-product|out-of-scope|none>\n  npm run fr -- rm ID [ID ...]\n  npm run fr -- roles [CODE]\n  npm run fr -- role-add CODE "Rol" "Funcionalidad soportada" ["Precondición"]\n  npm run fr -- role-edit ROLE_ID "Rol" "Funcionalidad soportada" ["Precondición"]\n  npm run fr -- role-rm ROLE_ID [ROLE_ID ...]\n  npm run fr -- snapshot');
}

if (WRITES.has(cmd)) {
  const files = snapshotCatalog(db);
  console.log(files.length ? `✓ Saved to ${files.map((f) => path.relative(process.cwd(), f)).join(", ")}` : "✓ data/catalog already up to date");
}
