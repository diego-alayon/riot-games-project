/**
 * Parser for a BMAD `prd.md`.
 *
 * The PRD is the phase where functional requirements are *defined*: each FR
 * gets its canonical description and, from its enclosing `###` heading, its
 * business area. Later artifacts (architecture, epics) reference the same
 * codes but do not redefine them.
 *
 * A PRD that has not yet reached the requirements step parses cleanly with
 * zero FRs — metadata is still returned so the initiative can be created.
 */

import { parseFrontmatter, parseFlowList, parseNestedMap } from "./frontmatter";
import { defRegexFor, compareFrCodes } from "./fr-codes";

export interface PrdRequirement {
  code: string;
  description: string;
  /** The `###` heading the FR was listed under, e.g. "Event Lifecycle Management". */
  area: string;
}

export interface PrdMetadata {
  initiative: string | null;
  jiraKey: string | null;
  author: string | null;
  date: string | null;
  stepsCompleted: string[];
  projectType: string | null;
  domain: string | null;
  complexity: string | null;
  projectContext: string | null;
  /** True once the PRD has advanced far enough to carry a requirements section. */
  hasRequirementsSection: boolean;
}

export interface ParsedPrd {
  metadata: PrdMetadata;
  requirements: PrdRequirement[];
  /** Non-functional requirements, captured for completeness (not imported as FRs). */
  nonFunctional: PrdRequirement[];
  title: string | null;
}

const H2 = /^##\s+(.+?)\s*$/;
const H3 = /^###\s+(.+?)\s*$/;
const H1 = /^#\s+(.+?)\s*$/;

export function parsePrdMarkdown(md: string): ParsedPrd {
  const fm = parseFrontmatter(md);
  const lines = fm.body.split("\n");

  const classification = parseNestedMap(fm.blocks.classification);

  let title: string | null = null;
  let author: string | null = null;
  let date: string | null = null;

  for (const line of lines) {
    const h1 = line.match(H1);
    if (h1 && !title) title = h1[1];
    const a = line.match(/^\*\*Author:\*\*\s*(.+?)\s*$/);
    if (a && !author) author = a[1];
    const d = line.match(/^\*\*Date:\*\*\s*(.+?)\s*$/);
    if (d && !date) date = d[1];
  }

  const functional = collectSection(lines, /^functional requirements$/i, "FR");
  const nonFunctional = collectSection(lines, /^non-functional requirements$/i, "NFR");

  const metadata: PrdMetadata = {
    initiative: fm.values.initiative ?? null,
    jiraKey: fm.values.jiraKey ?? null,
    author,
    date: date ?? null,
    stepsCompleted: parseFlowList(fm.values.stepsCompleted),
    projectType: classification.projectType ?? fm.values.projectType ?? null,
    domain: classification.domain ?? null,
    complexity: classification.complexity ?? null,
    projectContext: classification.projectContext ?? null,
    hasRequirementsSection: functional.found,
  };

  return {
    metadata,
    requirements: functional.items.sort((a, b) => compareFrCodes(a.code, b.code)),
    nonFunctional: nonFunctional.items,
    title,
  };
}

/**
 * Walks the `## <name>` section, tracking the current `### ` sub-heading as the
 * area, and collecting every FR definition line beneath it.
 */
function collectSection(
  lines: string[],
  nameRe: RegExp,
  codePrefix: string,
): { found: boolean; items: PrdRequirement[] } {
  const defRe = defRegexFor(codePrefix);

  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(H2);
    if (m && nameRe.test(m[1].trim())) { start = i; break; }
  }
  if (start === -1) return { found: false, items: [] };

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (H2.test(lines[i])) { end = i; break; }
  }

  const items: PrdRequirement[] = [];
  const seen = new Set<string>();
  let area = "—";

  for (let i = start + 1; i < end; i++) {
    const h3 = lines[i].match(H3);
    if (h3) { area = h3[1]; continue; }

    const def = lines[i].match(defRe);
    if (!def) continue;

    const [, code, description] = def;
    if (seen.has(code)) continue;
    seen.add(code);
    items.push({ code, description: description.trim(), area });
  }

  return { found: true, items };
}
