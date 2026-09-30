/**
 * Entries still to be defined. A drawer entry is pending while its text
 * carries a "[TBD: …]" marker, and critical when the marker is
 * "[TBD-CRÍTICO: …]" (an undefined point other definitions depend on).
 * The drawer, the catalog table and the exports show pending entries in
 * magenta and critical ones in red, with a warning icon, so they stand out.
 */

export type PendingLevel = "pending" | "critical";

export const PENDING_STYLE: Record<PendingLevel, { color: string; bg: string; label: string }> = {
  pending:  { color: "#b5179e", bg: "rgba(181, 23, 158, 0.07)", label: "Pendiente de definir" },
  critical: { color: "#d92d20", bg: "rgba(217, 45, 32, 0.08)",  label: "Crítico: pendiente de definir" },
};

/** Also used in SQL: `text LIKE '%[TBD%'` (critical included). */
export const isPending = (text: string | null | undefined) => !!text && /\[TBD\b/i.test(text);
/** Also used in SQL: `text LIKE '%[TBD-CR%'`. */
export const isCritical = (text: string | null | undefined) => !!text && /\[TBD-CR/i.test(text);

export const pendingLevel = (text: string | null | undefined): PendingLevel | null =>
  isCritical(text) ? "critical" : isPending(text) ? "pending" : null;
