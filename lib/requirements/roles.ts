/**
 * Roles a functional requirement can support — the actors of the Riftbound PRD
 * (section 4). Stored as plain text in requirement_roles.role, so a role outside
 * this list (e.g. written from the CLI) still displays.
 */
export const ROLES = [
  "Visitante anónimo",
  "Fan autenticado",
  "Operador Riot (backoffice)",
  "Staff de check-in",
  "Beneficiario de cortesía",
  "Soporte a fans de Riot",
  "Soporte de plataforma de Globant",
] as const;

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
