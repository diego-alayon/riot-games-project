import { db } from "./client";
import { runMigrations } from "./schema";
import { readFileSync } from "fs";
import path from "path";
import { importPrdTable, isPrdTableDocument } from "../import/prd-table";

runMigrations();

function insert(table: string, row: Record<string, unknown>) {
  const keys = Object.keys(row);
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO ${table} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`
  );
  stmt.run(...Object.values(row));
}

// Only the Riftbound containers. Epics, stories and requirements come from imports.
// Riftbound's design system lives in ./riftbound-ticketing, not in this database.

// ── Applications ────────────────────────────────────────────────────────────
const APP_RIFTBOUND = "app-riftbound";
insert("applications", { id: APP_RIFTBOUND, name: "Riftbound Ticketing Portal", slug: "riftbound-ticketing-portal", description: "Standalone ticketing web app with its own design system.", status: "active" });

// ── Initiatives ──────────────────────────────────────────────────────────────
const INIT_RTP = "init-riftbound";
insert("initiatives", { id: INIT_RTP, name: "Riftbound Ticketing Portal", description: "The core ticketing application for managing support requests." });

// ── Functional requirements (PRD table) ──────────────────────────────────────
const prdFile = "riftbound-ticketing-prd-v0.5.json";
const prd = JSON.parse(readFileSync(path.join(process.cwd(), "data", "prd", prdFile), "utf8"));
if (isPrdTableDocument(prd)) importPrdTable(INIT_RTP, prd, prdFile);

console.log("✓ Database seeded successfully");
