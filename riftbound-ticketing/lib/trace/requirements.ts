/**
 * Functional requirements from the Riftbound Ticketing PRD v0.5 (28 sep 2026),
 * plus the gap-review additions, organised by capability (see data/prd/*.json).
 * Retired IDs (CHK-04, CHK-07, PAS-09, PAS-11, MYT-11, REF-06, NFR-02, FND-04, FND-05, FND-06, FND-08, FND-11) were merged; FND-09 and FND-10 were deleted.
 * Only id, name, priority and status live here, to label markers. The source of
 * truth is the Riot Games Project catalog; markers link there.
 */

export type Priority = "Crítica" | "No crítica";
export type Status = "Confirmado" | "Pendiente de definir" | "Descartado v1";

export interface Requirement {
  id: string;
  name: string;
  priority: Priority;
  status: Status;
}

const C: Priority = "Crítica";
const N: Priority = "No crítica";
const OK: Status = "Confirmado";
const TBD: Status = "Pendiente de definir";
const OUT: Status = "Descartado v1";

const LIST: Array<[string, string, Priority, Status]> = [
  ["ACC-01", "Consulta pública de eventos sin autenticación RSO", C, OK],
  ["ACC-02", "Autenticación RSO obligatoria para la compra", C, OK],
  ["ACC-03", "Autenticación RSO obligatoria para acceder a My Tickets y a las páginas privadas", C, OK],
  ["ACC-04", "Gestión de la sesión RSO e identidad del fan", N, TBD],
  ["FND-01", "Cabecera global y navegación principal del portal", C, OK],
  ["FND-02", "Filtro de eventos por juego", N, OUT],
  ["FND-03", "Eventos destacados en Find Events", C, OK],
  ["FND-07", "Listado cronológico de eventos («More events»)", C, OK],
  ["FND-12", "Páginas de error del portal", C, TBD],
  ["EVT-01", "Sub-tabs del evento", C, OK],
  ["EVT-02", "On Demand Events", N, OUT],
  ["EVT-03", "Cabecera del evento", C, OK],
  ["EVT-04", "Aviso de pase ya adquirido", C, OK],
  ["EVT-05", "Estado de los pases con pase adquirido", C, OK],
  ["EVT-06", "Layout de pases", N, TBD],
  ["PAS-01", "Tarjeta de pase", C, OK],
  ["PAS-02", "Descripción extensa con bullets", C, OK],
  ["PAS-03", "See more / See less", C, OK],
  ["PAS-04", "Tags de pase", C, OK],
  ["PAS-05", "Agrupación por rol", C, OK],
  ["PAS-06", "Selección sin cantidad", C, OK],
  ["PAS-07", "Disponibilidad y resumen del pase", N, TBD],
  ["PAS-08", "Estado de venta por grupo de pases", N, TBD],
  ["PAS-10", "Carrito lateral", C, OK],
  ["CHK-01", "Pago con Stripe", C, OK],
  ["CHK-02", "Pago embebido", N, TBD],
  ["CHK-03", "Resumen de la orden", C, OK],
  ["CHK-05", "Aceptación de términos", N, TBD],
  ["CHK-06", "Checkout multipaso", N, OUT],
  ["CHK-08", "Confirmación de orden", C, OK],
  ["CHK-09", "Email de confirmación", C, TBD],
  ["MYT-01", "Upcoming / Past", C, OK],
  ["MYT-02", "Tarjeta de evento", C, OK],
  ["MYT-03", "QR del pase", C, TBD],
  ["MYT-04", "Wallet", C, TBD],
  ["MYT-05", "PDF de respaldo", C, TBD],
  ["MYT-06", "Side events del evento", C, OK],
  ["MYT-07", "View Invoice", N, TBD],
  ["MYT-08", "Explore Event", N, OK],
  ["MYT-09", "View Recap", N, TBD],
  ["MYT-10", "Contadores de cabecera", N, TBD],
  ["SDE-01", "Weekend Schedule", C, OK],
  ["SDE-02", "Tarjeta de side event", C, OK],
  ["SDE-03", "Atributos del side event", N, TBD],
  ["SDE-04", "Estado agotado", N, TBD],
  ["SDE-05", "Añadir al carrito", C, OK],
  ["SDE-06", "Gateo por pase", N, OK],
  ["SDE-07", "Compra conjunta", C, OK],
  ["SDE-08", "Registro en PlayRiftbound", C, OK],
  ["VOU-01", "Vouchers incluidos en pases", C, OK],
  ["VOU-02", "Emisión independiente", C, OK],
  ["VOU-03", "Ámbito del voucher", C, OK],
  ["VOU-04", "Descuento por código", C, OK],
  ["VOU-05", "Aplicación manual en checkout", C, OK],
  ["VOU-06", "Voucher como descuento condicional", C, TBD],
  ["VOU-07", "Varios vouchers en una compra", N, TBD],
  ["VOU-08", "Uso parcial y saldo", N, TBD],
  ["VOU-09", "Caducidad", N, TBD],
  ["AUD-01", "Venta restringida por audiencia", C, TBD],
  ["AUD-02", "Restricción por variables de perfil", C, TBD],
  ["COM-01", "Emisión de cortesía", N, TBD],
  ["COM-02", "Visualización de la cortesía", N, TBD],
  ["REF-01", "Refund por ítem autogestionado", C, OK],
  ["REF-02", "Refund de orden completa", C, OK],
  ["REF-03", "Desregistro en PlayRiftbound", C, OK],
  ["REF-04", "Refund por fila", C, OK],
  ["REF-05", "Incident ticket en refund", N, TBD],
  ["PAS-12", "Tickets no transferibles", C, OK],
  ["I18N-01", "Traducción a 9 idiomas", C, TBD],
  ["I18N-02", "Formatos regionales", C, TBD],
  ["I18N-03", "Multimoneda por evento", C, OK],
  ["NFR-01", "Data residency en la UE", C, OK],
  ["NFR-03", "Accesibilidad del portal (European Accessibility Act)", C, TBD],
  ["RNF-04", "Límite de Access Rights", C, OK],
  ["GFW-01", "Control de acceso con Gateflow", C, TBD],
  ["GFW-02", "Puntos de acceso separados Main / Side Events", C, TBD],
  ["FFA-01", "Pre-registro por pase", N, TBD],
  ["FFA-02", "Aviso de apertura", N, TBD],
];

export const REQUIREMENTS: Record<string, Requirement> = Object.fromEntries(
  LIST.map(([id, name, priority, status]) => [id, { id, name, priority, status }]),
);

export const MANAGER_URL = process.env.NEXT_PUBLIC_MANAGER_URL ?? "http://localhost:3000";

/** Deep link into the Riot Games Project functional requirements catalog. */
export const requirementHref = (id: string) =>
  `${MANAGER_URL}/product/initiatives/catalog?code=${encodeURIComponent(id)}`;
