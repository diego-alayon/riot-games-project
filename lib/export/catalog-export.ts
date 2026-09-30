/**
 * The requirement catalog shaped for export (Excel, PDF): initiative → epic →
 * functional requirement, and inside each requirement the drawer sections in
 * drawer order. Both formats render this one model, so they always agree.
 */

import { getInitiativeTree, requirementItemRepo, requirementRoleRepo } from "@/lib/db/repos";
import { itemLabel, type ItemKind } from "@/lib/requirements/items";
import { pendingLevel, type PendingLevel } from "@/lib/requirements/pending";
import { isItemTag, type ItemTag } from "@/lib/requirements/tags";
import { PLATFORMS, PLATFORM_KEYS, parsePlatforms, type PlatformKey } from "@/lib/requirements/platforms";

/**
 * `pending`: the text carries a "[TBD…]" or "[TBD-CRÍTICO…]" marker (lib/requirements/pending.ts).
 * `tag`: its review tag (lib/requirements/tags.ts).
 */
export interface ExportEntry { id: string; text: string; pending: PendingLevel | null; tag: ItemTag | null }
export interface ExportRole { role: string; capability: string; precondition: string | null }

export interface ExportRequirement {
  code: string;
  feature: string;
  description: string;
  status: string | null;
  priority: string | null;
  platforms: PlatformKey[];
  dueDate: string | null;
  page: string | null;
  owner: string | null;
  source: string | null;
  woRef: string | null;
  comments: string | null;
  /** Requerimientos funcionales, one list per platform. */
  functional: Record<PlatformKey, ExportEntry[]>;
  roles: ExportRole[];
  outOfScope: ExportEntry[];
  acceptance: ExportEntry[];
  /** Comentarios del drawer; `comments` is the note imported from the PRD. */
  commentEntries: ExportEntry[];
}

export interface ExportEpic { code: string | null; name: string; requirements: ExportRequirement[] }
export interface ExportInitiative { name: string; epics: ExportEpic[] }
export interface CatalogExport { title: string; generatedAt: Date; initiatives: ExportInitiative[] }

interface ItemRow { id: string; seq: number | null; text: string; tag: string | null }
interface RoleRow { role: string; capability: string; precondition: string | null }

const entries = (reqId: string, code: string, kind: ItemKind, scope: PlatformKey | "all"): ExportEntry[] =>
  (requirementItemRepo.list(reqId, kind, scope) as ItemRow[]).map(r => ({ id: itemLabel(code, kind, r.seq) ?? "", text: r.text, pending: pendingLevel(r.text), tag: isItemTag(r.tag) ? r.tag : null }));

function toRequirement(r: any): ExportRequirement {
  return {
    code: r.code,
    feature: r.feature ?? r.area ?? "",
    description: r.description ?? "",
    status: r.status ?? null,
    priority: r.priority ?? null,
    platforms: parsePlatforms(r.platforms),
    dueDate: r.due_date ?? null,
    page: r.page ?? null,
    owner: r.owner ?? null,
    source: r.source ?? null,
    woRef: r.wo_ref ?? null,
    comments: r.comments ?? null,
    functional: Object.fromEntries(PLATFORM_KEYS.map(p => [p, entries(r.id, r.code, "functional", p)])) as Record<PlatformKey, ExportEntry[]>,
    roles: (requirementRoleRepo.list(r.id) as RoleRow[]).map(({ role, capability, precondition }) => ({ role, capability, precondition })),
    outOfScope: entries(r.id, r.code, "out_of_scope", "all"),
    acceptance: entries(r.id, r.code, "acceptance", "all"),
    commentEntries: entries(r.id, r.code, "comment", "all"),
  };
}

export function buildCatalogExport(): CatalogExport {
  const initiatives = getInitiativeTree().map((init: any) => ({
    name: init.name,
    epics: (init.epics ?? []).map((e: any) => ({
      code: e.code ?? null,
      name: e.name,
      requirements: [...(e.requirements ?? []), ...(e.stories ?? []).flatMap((s: any) => s.requirements ?? [])].map(toRequirement),
    })),
  }));
  return { title: "Functional Requirements", generatedAt: new Date(), initiatives };
}

/* ── Labels shared by the formats ──────────────────────────────────────── */

export const platformNames = (keys: PlatformKey[]) => keys.map(k => PLATFORMS[k]).join(", ");
export const epicTitle = (e: ExportEpic) => (e.code ? `${e.code} · ${e.name}` : e.name);

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-06-05" → "5 jun 2026". */
export function formatDate(iso: string | null): string {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso ?? "";
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/** File name stem, e.g. "functional-requirements-2026-09-30". */
export const exportFileStem = (doc: CatalogExport) => `functional-requirements-${doc.generatedAt.toISOString().slice(0, 10)}`;
