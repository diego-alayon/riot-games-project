/**
 * Review tags for drawer entries (functional requirements, acceptance criteria,
 * out of scope and comments). An entry carries at most one tag, stored by key in
 * requirement_items.tag; clearing it marks the point as resolved.
 *
 * Keep the keys in sync with TAGS in scripts/fr-items.mjs.
 */

export const ITEM_TAGS = {
  "pending-riot":         { label: "Pending Riot Games confirmation",    color: "#d9480f", bg: "rgba(217, 72, 15, 0.07)",   warning: true },
  "pending-architecture": { label: "Pending architectural confirmation", color: "#6941c6", bg: "rgba(105, 65, 198, 0.07)",  warning: true },
  "pending-engineering":  { label: "Pending engineering confirmation",   color: "#1570ef", bg: "rgba(21, 112, 239, 0.07)",  warning: true },
  "pending-product":      { label: "Pending product definition",         color: "#b5179e", bg: "rgba(181, 23, 158, 0.07)",  warning: true },
  "out-of-scope":         { label: "Out of scope",                       color: "#667085", bg: "rgba(102, 112, 133, 0.08)", warning: false },
} as const;

export type ItemTag = keyof typeof ITEM_TAGS;
export const ITEM_TAG_KEYS = Object.keys(ITEM_TAGS) as ItemTag[];

export const isItemTag = (value: unknown): value is ItemTag => typeof value === "string" && value in ITEM_TAGS;
export const tagStyle = (value: unknown) => (isItemTag(value) ? ITEM_TAGS[value] : null);
