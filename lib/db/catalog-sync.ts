import { db } from "./client";
import { restoreCatalog, snapshotCatalog } from "../catalog/snapshot.mjs";

/** Tables whose content goes into data/catalog/*.json (see lib/catalog/snapshot.mjs). */
const CATALOG_TABLES = [
  "initiatives", "applications", "app_initiative_links", "epics", "stories", "tasks",
  "requirements", "requirement_items", "requirement_roles", "requirement_item_counters",
];

/**
 * Keeps the versioned catalog file in step with the database:
 * - an empty database is first filled from the file;
 * - every later write on this connection rewrites the file, a moment after the
 *   last change so a burst of edits produces one write.
 * Changes are caught with TEMP triggers, so every write path (API, importers,
 * repos) is covered without having to call anything.
 */
export function syncCatalogFile() {
  const restored = restoreCatalog(db);
  if (restored) console.log(`✓ Restored ${restored} requirements from data/catalog`);

  let timer: ReturnType<typeof setTimeout> | undefined;
  db.function("catalog_changed", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { snapshotCatalog(db); } catch (err) { console.error("✗ Could not write data/catalog:", err); }
    }, 250);
    return null;
  });
  for (const table of CATALOG_TABLES) {
    for (const op of ["insert", "update", "delete"]) {
      db.exec(`CREATE TEMP TRIGGER IF NOT EXISTS catalog_${table}_${op} AFTER ${op.toUpperCase()} ON main.${table} BEGIN SELECT catalog_changed(); END`);
    }
  }
}
