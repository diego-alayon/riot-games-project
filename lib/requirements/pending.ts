/**
 * Entries still to be defined. A drawer entry is pending while its text
 * carries a "[TBD: …]" marker; the drawer, the catalog table and the exports
 * show it in magenta with a warning icon so it stands out for review.
 */

export const PENDING_COLOR = "#b5179e";
export const PENDING_BG = "rgba(181, 23, 158, 0.07)";
export const PENDING_LABEL = "Pendiente de definir";

/** Also used in SQL: `text LIKE '%[TBD%'`. */
export const isPending = (text: string | null | undefined) => !!text && /\[TBD\b/i.test(text);
