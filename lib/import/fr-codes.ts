/**
 * Shared FR (functional requirement) code handling for BMAD artifacts.
 *
 * FR codes carry an optional lowercase letter suffix — FR5 and FR5c are two
 * distinct requirements, so the suffix is part of the identity and must never
 * be truncated.
 */

/** Matches an FR code anywhere in a line. Suffix letter is significant. */
export const FR_CODE_RE = /\bFR\d+[a-z]?\b/g;

/**
 * Matches an FR *definition* line and captures code + description.
 *
 * Real BMAD artifacts use three shapes, all optionally bulleted and bolded:
 *   - FR1: description
 *   - **FR1:** description
 *   - **FR1** description
 */
export const FR_DEF_RE = /^\s*[-*]?\s*\*{0,2}(FR\d+[a-z]?)\*{0,2}\s*:?\*{0,2}\s+(.+?)\s*$/;

/**
 * Same shape as FR_DEF_RE for another code prefix — "NFR" for non-functional
 * requirements. Built per call because the prefix varies.
 */
export function defRegexFor(prefix: string): RegExp {
  return new RegExp(`^\\s*[-*]?\\s*\\*{0,2}(${prefix}\\d+[a-z]?)\\*{0,2}\\s*:?\\*{0,2}\\s+(.+?)\\s*$`);
}

/** Sort key so FR2 < FR10 and FR5 < FR5a < FR5c. */
export function frSortKey(code: string): [number, string] {
  const m = code.match(/^FR(\d+)([a-z]?)$/);
  if (!m) return [Number.MAX_SAFE_INTEGER, code];
  return [parseInt(m[1], 10), m[2]];
}

export function compareFrCodes(a: string, b: string): number {
  const [an, as] = frSortKey(a);
  const [bn, bs] = frSortKey(b);
  return an !== bn ? an - bn : as.localeCompare(bs);
}

/** Every distinct FR code referenced in a block of text, in document order. */
export function extractFrRefs(text: string): string[] {
  const seen = new Set<string>();
  for (const m of text.matchAll(FR_CODE_RE)) seen.add(m[0]);
  return Array.from(seen);
}

/**
 * Expands an FR range written with an en-dash or hyphen ("FR15–FR18") into the
 * codes it covers. Architecture cluster tables use these heavily. Only plain
 * numeric endpoints expand; a lettered endpoint is returned as-is.
 */
export function expandFrRange(text: string): string[] {
  const out: string[] = [];
  const rangeRe = /\bFR(\d+)\s*[–—-]\s*FR?(\d+)\b/g;
  const consumed: [number, number][] = [];

  for (const m of text.matchAll(rangeRe)) {
    const from = parseInt(m[1], 10);
    const to = parseInt(m[2], 10);
    if (to >= from && to - from < 200) {
      for (let n = from; n <= to; n++) out.push(`FR${n}`);
      consumed.push([m.index!, m.index! + m[0].length]);
    }
  }

  // Pick up standalone codes that were not part of an expanded range
  for (const m of text.matchAll(FR_CODE_RE)) {
    const inRange = consumed.some(([s, e]) => m.index! >= s && m.index! < e);
    if (!inRange) out.push(m[0]);
  }

  return Array.from(new Set(out));
}
