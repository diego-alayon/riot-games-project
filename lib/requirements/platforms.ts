/**
 * Platforms a functional requirement is delivered on. A requirement can live on
 * one of them or on both. Stored in requirements.platforms as a JSON array of keys.
 * Shared by server (importer, API) and client (catalog table).
 */

export const PLATFORMS = {
  riftbound: "Riftbound Ticketing Portal",
  smartvenues: "SmartVenues",
} as const;

export type PlatformKey = keyof typeof PLATFORMS;
export const PLATFORM_KEYS = Object.keys(PLATFORMS) as PlatformKey[];

export function parsePlatforms(raw: string | null | undefined): PlatformKey[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? PLATFORM_KEYS.filter(k => v.includes(k)) : [];
  } catch {
    return [];
  }
}

export function serializePlatforms(keys: PlatformKey[]): string {
  return JSON.stringify(PLATFORM_KEYS.filter(k => keys.includes(k)));
}

/**
 * Initial guess from the PRD "Página" column, used only when a requirement has
 * no platform yet: P-12 (OneVenue backoffice) → SmartVenues; portal screens
 * (P-01…P-11, Global) → Riftbound; no page ("—", platform integrations) → SmartVenues.
 */
export function derivePlatforms(page: string | null | undefined): PlatformKey[] {
  const p = page ?? "";
  const keys: PlatformKey[] = [];
  if (/P-(0\d|1[01])\b/.test(p) || /global/i.test(p)) keys.push("riftbound");
  if (/P-12\b/.test(p) || !/[A-Za-z0-9]/.test(p)) keys.push("smartvenues");
  return keys;
}
