/**
 * Lists a requirement's drawer shows, and the stable ID of each entry.
 *
 * Every entry gets a sequence number when it is created, stored in
 * requirement_items.seq and never reused. With the requirement code it forms
 * a traceable ID that survives reordering and deletions:
 *   functional   → FND-06.1, FND-06.2 …   (one sequence across both platforms)
 *   acceptance   → FND-06.AC1 …
 *   out_of_scope → FND-06.OOS1 …
 */
export const ITEM_KINDS = {
  functional: { prefix: "", perPlatform: true },
  acceptance: { prefix: "AC", perPlatform: false },
  out_of_scope: { prefix: "OOS", perPlatform: false },
} as const;

export type ItemKind = keyof typeof ITEM_KINDS;
export const ITEM_KIND_KEYS = Object.keys(ITEM_KINDS) as ItemKind[];

export function itemLabel(code: string, kind: ItemKind, seq: number | null | undefined): string | null {
  if (!seq) return null;
  return `${code}.${ITEM_KINDS[kind].prefix}${seq}`;
}
