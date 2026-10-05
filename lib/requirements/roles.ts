/**
 * Roles a functional requirement can support: the fan (Riot account, uses the
 * portal), the Chief Sales Operator (Riot, configures the ticketing in
 * SmartVenues) and the Ticketing Operator (Riot, assigns comp tickets from the
 * backend; Riot still has to define the role, 2026-10-05). Having an RSO
 * session or not is a precondition, not a role.
 * Stored as plain text in requirement_roles.role, so a role outside this list
 * (e.g. written from the CLI) still displays.
 */
export const ROLES = ["Fan", "Chief Sales Operator", "Ticketing Operator"] as const;

export interface RoleFields {
  role: string;
  capability: string;
  precondition?: string | null;
}

/** Validates { role, capability, precondition? } from a request body. */
export function roleFields(body: unknown): RoleFields | string {
  const b = body as Partial<Record<keyof RoleFields, unknown>> | null;
  const role = typeof b?.role === "string" ? b.role.trim() : "";
  const capability = typeof b?.capability === "string" ? b.capability.trim() : "";
  if (!role) return "role is required";
  if (!capability) return "capability is required";
  const precondition = typeof b?.precondition === "string" && b.precondition.trim() ? b.precondition.trim() : null;
  return { role, capability, precondition };
}
