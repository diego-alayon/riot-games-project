/**
 * Excel export of the catalog. Three sheets:
 *   Catálogo                   — the catalog table: initiative → epic → FR (grouped rows)
 *   Requerimientos y criterios — one row per drawer entry, with its stable ID
 *   Roles                      — the roles table of every FR
 */

import ExcelJS from "exceljs";
import { PLATFORMS, PLATFORM_KEYS } from "@/lib/requirements/platforms";
import { epicTitle, platformNames, type CatalogExport } from "./catalog-export";

const INK = "FF282A30";
const solid = (argb: string): ExcelJS.Fill => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const WRAP: Partial<ExcelJS.Alignment> = { vertical: "top", wrapText: true };

function styleHeader(ws: ExcelJS.Worksheet) {
  const row = ws.getRow(1);
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = solid(INK);
  row.alignment = { vertical: "middle" };
  row.height = 20;
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };
}

/** ISO date → Excel date cell (UTC midnight), or empty. */
const dateCell = (iso: string | null) => (iso ? new Date(`${iso.slice(0, 10)}T00:00:00Z`) : null);

export async function catalogToXlsx(doc: CatalogExport): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Riot Games Project";
  wb.created = doc.generatedAt;

  // ── Catálogo ──────────────────────────────────────────────────────────────
  const cat = wb.addWorksheet("Catálogo", { properties: { outlineLevelRow: 2 } });
  cat.columns = [
    { header: "Tipo", key: "type", width: 10 },
    { header: "ID", key: "id", width: 10 },
    { header: "Funcionalidad", key: "feature", width: 42 },
    { header: "Descripción", key: "description", width: 60 },
    { header: "Estado", key: "status", width: 20 },
    { header: "Plataforma", key: "platforms", width: 30 },
    { header: "Prioridad", key: "priority", width: 12 },
    { header: "Owner", key: "owner", width: 14 },
    { header: "Fecha de entrega", key: "due", width: 16, style: { numFmt: "d mmm yyyy" } },
    { header: "Página", key: "page", width: 16 },
    { header: "Fuente", key: "source", width: 18 },
    { header: "Ref. WO", key: "wo", width: 18 },
    { header: "Comentarios", key: "comments", width: 60 },
  ];
  styleHeader(cat);

  for (const init of doc.initiatives) {
    const ir = cat.addRow({ type: "Initiative", feature: init.name });
    ir.font = { bold: true };
    ir.fill = solid("FFE9EAEC");
    for (const epic of init.epics) {
      const er = cat.addRow({ type: "Epic", id: epic.code ?? "", feature: epic.name });
      er.font = { bold: true };
      er.fill = solid("FFF4F4F5");
      er.outlineLevel = 1;
      for (const r of epic.requirements) {
        const row = cat.addRow({
          type: "FR", id: r.code, feature: r.feature, description: r.description, status: r.status, platforms: platformNames(r.platforms),
          priority: r.priority, owner: r.owner, due: dateCell(r.dueDate), page: r.page, source: r.source, wo: r.woRef, comments: r.comments,
        });
        row.outlineLevel = 2;
        row.alignment = WRAP;
      }
    }
  }

  // ── Requerimientos y criterios ────────────────────────────────────────────
  const det = wb.addWorksheet("Requerimientos y criterios");
  det.columns = [
    { header: "Épica", key: "epic", width: 30 },
    { header: "Req.", key: "code", width: 9 },
    { header: "Funcionalidad", key: "feature", width: 32 },
    { header: "Sección", key: "section", width: 40 },
    { header: "ID", key: "id", width: 13 },
    { header: "Texto", key: "text", width: 100 },
  ];
  styleHeader(det);

  // ── Roles ─────────────────────────────────────────────────────────────────
  const roles = wb.addWorksheet("Roles");
  roles.columns = [
    { header: "Épica", key: "epic", width: 30 },
    { header: "Req.", key: "code", width: 9 },
    { header: "Funcionalidad", key: "feature", width: 32 },
    { header: "Rol", key: "role", width: 22 },
    { header: "Funcionalidad soportada", key: "capability", width: 50 },
    { header: "Precondición", key: "precondition", width: 30 },
  ];
  styleHeader(roles);

  for (const init of doc.initiatives) {
    for (const epic of init.epics) {
      for (const r of epic.requirements) {
        const base = { epic: epicTitle(epic), code: r.code, feature: r.feature };
        // Drawer order: functional per platform, acceptance criteria, out of scope (roles have their own sheet).
        const sections = [
          ...PLATFORM_KEYS.map(p => [`Requerimiento funcional · ${PLATFORMS[p]}`, r.functional[p]] as const),
          ["Criterio de aceptación", r.acceptance] as const,
          ["Out of scope", r.outOfScope] as const,
        ];
        for (const [section, list] of sections)
          for (const e of list) det.addRow({ ...base, section, id: e.id, text: e.text }).alignment = WRAP;
        for (const ro of r.roles) roles.addRow({ ...base, ...ro }).alignment = WRAP;
      }
    }
  }

  return Buffer.from(await wb.xlsx.writeBuffer());
}
