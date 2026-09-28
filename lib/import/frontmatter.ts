/**
 * Minimal YAML front-matter reader for BMAD artifacts.
 *
 * This is deliberately NOT a YAML parser. BMAD front-matter is large and uses
 * block scalars, nested maps and lists of maps; we only need a handful of
 * top-level values (initiative, jiraKey, stepsCompleted, …) plus the body.
 * Anything nested is exposed verbatim as raw text so callers can decide.
 */

export interface Frontmatter {
  /** Top-level scalar keys, with block scalars folded into a single string. */
  values: Record<string, string>;
  /** Top-level keys whose value is a nested map or list, as raw YAML. */
  blocks: Record<string, string>;
  /** The document after the closing `---`. */
  body: string;
  /** True when a front-matter block was present at all. */
  present: boolean;
}

const FENCE = /^---\s*$/;

export function parseFrontmatter(md: string): Frontmatter {
  const lines = md.split("\n");
  const empty: Frontmatter = { values: {}, blocks: {}, body: md, present: false };

  if (lines.length === 0 || !FENCE.test(lines[0])) return empty;

  let close = -1;
  for (let i = 1; i < lines.length; i++) {
    if (FENCE.test(lines[i])) { close = i; break; }
  }
  if (close === -1) return empty;

  const head = lines.slice(1, close);
  const body = lines.slice(close + 1).join("\n");

  const values: Record<string, string> = {};
  const blocks: Record<string, string> = {};

  for (let i = 0; i < head.length; i++) {
    const line = head[i];
    // Only top-level keys (no leading indentation)
    const m = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!m) continue;

    const key = m[1];
    const inline = m[2].trim();

    // Gather every following indented / blank line as this key's continuation
    const owned: string[] = [];
    let j = i + 1;
    for (; j < head.length; j++) {
      if (head[j].trim() === "" || /^\s/.test(head[j])) owned.push(head[j]);
      else break;
    }

    if (inline === "|" || inline === ">" || inline === "|-" || inline === ">-") {
      // Block scalar — dedent by the first non-empty line's indentation
      const first = owned.find(l => l.trim() !== "") ?? "";
      const pad = first.match(/^\s*/)?.[0].length ?? 0;
      values[key] = owned.map(l => l.slice(pad)).join("\n").trim();
    } else if (inline === "") {
      // Nested map or list — keep the raw YAML for the caller
      blocks[key] = owned.join("\n");
    } else {
      values[key] = unquote(inline);
    }

    i = j - 1;
  }

  return { values, blocks, body, present: true };
}

function unquote(v: string): string {
  const s = v.trim();
  if (s.length >= 2 && ((s[0] === "'" && s.endsWith("'")) || (s[0] === '"' && s.endsWith('"')))) {
    return s.slice(1, -1).replace(/''/g, "'");
  }
  return s;
}

/** Reads a flow-style list such as `['a', 'b']` into its items. */
export function parseFlowList(v: string | undefined): string[] {
  if (!v) return [];
  const inner = v.trim().replace(/^\[/, "").replace(/\]$/, "");
  if (inner.trim() === "") return [];
  return inner.split(",").map(s => unquote(s.trim())).filter(Boolean);
}

/** Reads `key: value` pairs out of a raw nested block (one level deep). */
export function parseNestedMap(block: string | undefined): Record<string, string> {
  if (!block) return {};
  const out: Record<string, string> = {};
  const lines = block.split("\n").filter(l => l.trim() !== "");
  const pad = lines[0]?.match(/^\s*/)?.[0].length ?? 0;
  for (const line of lines) {
    if ((line.match(/^\s*/)?.[0].length ?? 0) !== pad) continue;
    const m = line.trim().match(/^([A-Za-z_][\w-]*)\s*:\s*(.+)$/);
    if (m) out[m[1]] = unquote(m[2]);
  }
  return out;
}
