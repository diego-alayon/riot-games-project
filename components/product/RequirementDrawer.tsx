"use client";

/**
 * Right-hand drawer with everything known about one functional requirement.
 *
 * The requirement will keep gaining aspects over time, so the body is a list of
 * independent sections (see SECTIONS). To add a new aspect, add a section; no
 * other part of the drawer needs to change.
 */

import { useEffect, useState, type ReactNode } from "react";
import { PLATFORMS, PLATFORM_KEYS, parsePlatforms, type PlatformKey } from "@/lib/requirements/platforms";
import {
  DueDateCell, PlatformCell, PlatformIcon, PriorityCell, StatusCell, TXT, TXT_2, TXT_3,
} from "./RequirementCells";
import { RequirementBullets } from "./RequirementBullets";
import { RequirementRoles } from "./RequirementRoles";

export interface DrawerRequirement {
  id: string;
  code: string;
  feature?: string | null;
  description: string;
  page?: string | null;
  priority?: string | null;
  status?: string | null;
  source?: string | null;
  wo_ref?: string | null;
  owner?: string | null;
  comments?: string | null;
  platforms?: string | null;
  due_date?: string | null;
}

export interface DrawerContext {
  initiative?: string;
  epic?: { code?: string | null; name: string };
  story?: string;
}

export interface TraceScreen {
  app: string;
  id: string;
  name: string;
  route: string;
}

interface SectionProps {
  fr: DrawerRequirement;
  onPatch: (fields: { platforms?: PlatformKey[]; due_date?: string | null }) => void;
}

const RIFTBOUND_URL = process.env.NEXT_PUBLIC_RIFTBOUND_URL ?? "http://localhost:3001";
/** Event used to open parameterised Riftbound routes (/events/[slug]). */
const SAMPLE_EVENT = "regional-qualifier-singapore";

function screenHref(s: TraceScreen): string | null {
  if (s.app !== "riftbound" || s.route.includes("[orderId]")) return null;
  const route = s.route.replace("[slug]", SAMPLE_EVENT);
  return `${RIFTBOUND_URL}${route}${route.includes("?") ? "&" : "?"}trace=on`;
}

/* ── Building blocks ────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ padding: "20px 24px", borderTop: "1px solid #f0f0f2" }}>
      <h3 style={{ fontSize: 12, fontWeight: 500, color: TXT_2, margin: "0 0 12px" }}>{title}</h3>
      {children}
    </section>
  );
}

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "132px 1fr", alignItems: "center", minHeight: 34 }}>
      <span style={{ fontSize: 13, color: TXT_2 }}>{label}</span>
      <div style={{ minWidth: 0, fontSize: 13, color: TXT }}>{children}</div>
    </div>
  );
}

function Plain({ value }: { value?: string | null }) {
  return value && value !== "—" ? <span style={{ fontSize: 13, color: TXT }}>{value}</span> : <span style={{ fontSize: 13, color: TXT_3 }}>—</span>;
}

/* ── Sections ───────────────────────────────────────────────────────────── */

/** Dispositivos: what a requirement does differently on desktop and on mobile (functional requirements, not acceptance criteria). */
const DEVICES = [
  {
    kind: "desktop" as const,
    label: "Desktop",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={TXT_2} strokeWidth="1.4" strokeLinejoin="round" aria-hidden>
        <rect x="1.5" y="2.5" width="13" height="8.5" rx="1.2" /><path d="M5.5 14h5M8 11v3" />
      </svg>
    ),
  },
  {
    kind: "mobile" as const,
    label: "Mobile",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={TXT_2} strokeWidth="1.4" strokeLinejoin="round" aria-hidden>
        <rect x="4.5" y="1.5" width="7" height="13" rx="1.4" /><path d="M7.2 12.3h1.6" />
      </svg>
    ),
  },
];

const SECTIONS: Array<{ id: string; title: string; render: (p: SectionProps) => ReactNode }> = [
  {
    id: "roles",
    title: "Roles",
    render: ({ fr }) => <RequirementRoles requirementId={fr.id} />,
  },
  {
    id: "functional",
    title: "Requerimientos funcionales",
    render: ({ fr }) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {PLATFORM_KEYS.map(k => (
          <div key={k}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <PlatformIcon k={k} />
              <span style={{ fontSize: 13, fontWeight: 500, color: TXT }}>{PLATFORMS[k]}</span>
            </div>
            <RequirementBullets
              requirementId={fr.id}
              code={fr.code}
              platform={k}
              kind="functional"
              addLabel="Añadir requerimiento funcional"
              emptyLabel={`Sin requerimientos funcionales para ${PLATFORMS[k]}.`}
            />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "devices",
    title: "Dispositivos",
    render: ({ fr }) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {DEVICES.map(d => (
          <div key={d.kind}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {d.icon}
              <span style={{ fontSize: 13, fontWeight: 500, color: TXT }}>{d.label}</span>
            </div>
            <RequirementBullets
              requirementId={fr.id}
              code={fr.code}
              kind={d.kind}
              addLabel={`Añadir requerimiento para ${d.label}`}
              emptyLabel={`Sin requerimientos específicos para ${d.label}.`}
            />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "acceptance",
    title: "Criterios de aceptación",
    render: ({ fr }) => (
      <RequirementBullets
        requirementId={fr.id}
        code={fr.code}
        kind="acceptance"
        addLabel="Añadir criterio de aceptación"
        emptyLabel="Sin criterios de aceptación. Formato: Dado… / Cuando… / Entonces…"
      />
    ),
  },
  {
    id: "out-of-scope",
    title: "Out of scope",
    render: ({ fr }) => (
      <RequirementBullets
        requirementId={fr.id}
        code={fr.code}
        kind="out_of_scope"
        marker="excluded"
        addLabel="Añadir elemento fuera de scope"
        emptyLabel="No hay nada marcado como fuera de scope para este requerimiento."
      />
    ),
  },
  {
    id: "properties",
    title: "Propiedades",
    render: ({ fr, onPatch }) => (
      <div>
        <Property label="Estado"><StatusCell status={fr.status} /></Property>
        <Property label="Prioridad"><PriorityCell priority={fr.priority} /></Property>
        <Property label="Plataforma">
          <PlatformCell value={parsePlatforms(fr.platforms)} onChange={v => onPatch({ platforms: v })} />
        </Property>
        <Property label="Fecha de entrega">
          <DueDateCell value={fr.due_date} onChange={v => onPatch({ due_date: v })} />
        </Property>
        <Property label="Página"><Plain value={fr.page} /></Property>
      </div>
    ),
  },
  {
    id: "comments",
    title: "Comentarios",
    render: ({ fr }) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <RequirementBullets
          requirementId={fr.id}
          code={fr.code}
          kind="comment"
          addLabel="Añadir comentario"
          emptyLabel="Sin comentarios."
          placeholder="Escribe el comentario…"
        />
        {fr.comments && fr.comments !== "—" && (
          <div>
            <div style={{ fontSize: 12, color: TXT_3, marginBottom: 4 }}>Nota del PRD</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: TXT_2, margin: 0 }}>{fr.comments}</p>
          </div>
        )}
      </div>
    ),
  },
];

/* ── Implementado en ────────────────────────────────────────────────────── */

const chip: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 9px", flexShrink: 0,
  border: "1px solid #ececee", borderRadius: 6, fontSize: 12, color: TXT, whiteSpace: "nowrap", textDecoration: "none",
};

/** "Event Detail — Side Events" → "Side Events", "Login RSO (simulated)" → "Login RSO". */
const shortName = (name: string) => name.replace(/^Event Detail — /, "").replace(/\s*\(simulated\)$/, "");

/**
 * One line under the header, as tall as the header: the prototype screens that
 * implement the requirement. Each one opens that screen in Riftbound with trace mode on.
 * Past three screens only the IDs are shown (name in the tooltip), so the line never overflows.
 */
function ImplementedIn({ screens }: { screens: TraceScreen[] }) {
  const withNames = screens.length <= 3;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, height: 48, padding: "0 24px", borderBottom: "1px solid #f0f0f2", flexShrink: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: TXT_2, flexShrink: 0 }}>Implementado en</span>
      {screens.length === 0 ? (
        <span style={{ fontSize: 13, color: TXT_3 }}>Sin pantallas enlazadas</span>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, overflowX: "auto", scrollbarWidth: "none" }}>
          {screens.map(s => {
            const href = screenHref(s);
            const content = (
              <>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#ef7d00" strokeWidth="1.6" strokeLinejoin="round"><path d="M8 2l6 6-6 6-6-6 6-6z" /></svg>
                <span style={{ color: withNames ? TXT_2 : TXT }}>{s.id}</span>
                {withNames && shortName(s.name)}
                {href && <span style={{ color: TXT_3 }}>↗</span>}
              </>
            );
            return href ? (
              <a key={`${s.app}-${s.id}`} href={href} target="_blank" rel="noopener noreferrer" title={`Abrir ${s.id} ${s.name} en el prototipo`} className="req-editable" style={chip}>{content}</a>
            ) : (
              <span key={`${s.app}-${s.id}`} title={`${s.id} ${s.name}: se abre desde un pedido del prototipo`} style={chip}>{content}</span>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Drawer ─────────────────────────────────────────────────────────────── */

export function RequirementDrawer({
  fr,
  context,
  screens,
  onClose,
  onPatch,
}: {
  fr: DrawerRequirement;
  context: DrawerContext;
  screens: TraceScreen[];
  onClose: () => void;
  onPatch: SectionProps["onPatch"];
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Escape inside a field (e.g. editing a bullet) belongs to that field.
      if (e.key !== "Escape" || (e.target as HTMLElement | null)?.closest("textarea, input, select")) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(fr.code)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const crumbs = [context.initiative, context.epic && [context.epic.code, context.epic.name].filter(Boolean).join(" "), context.story].filter(Boolean);
  const iconBtn: React.CSSProperties = { background: "none", border: "none", padding: 6, borderRadius: 6, cursor: "pointer", color: TXT_2, display: "flex" };

  return (
    <aside
      role="dialog"
      aria-label={`${fr.code} ${fr.feature ?? ""}`}
      className="req-drawer"
      style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 660, maxWidth: "100vw", zIndex: 60,
        background: "#fff", borderLeft: "1px solid #ececee", boxShadow: "-12px 0 32px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 12px 0 24px", borderBottom: "1px solid #f0f0f2", flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: TXT_2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {crumbs.join("  ›  ")}
        </div>
        <button onClick={copyLink} title="Copiar enlace" style={iconBtn} className="req-editable">
          {copied ? (
            <span style={{ fontSize: 12, color: "#26a269" }}>Copiado</span>
          ) : (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M6.5 9.5l3-3M7 4.5l1.2-1.2a2.8 2.8 0 014 4L11 8.5M9 11.5l-1.2 1.2a2.8 2.8 0 01-4-4L5 7.5" /></svg>
          )}
        </button>
        <button onClick={onClose} title="Cerrar (Esc)" style={iconBtn} className="req-editable">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
        </button>
      </header>
      <ImplementedIn screens={screens} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "24px 24px 20px" }}>
          <div style={{ fontSize: 13, color: TXT_2 }}>{fr.code}</div>
          <h2 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 600, lineHeight: 1.3, color: TXT, letterSpacing: "-0.2px" }}>
            {fr.feature ?? fr.description}
          </h2>
          {fr.feature && <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.6, color: TXT }}>{fr.description}</p>}
        </div>
        {SECTIONS.map(s => (
          <Section key={s.id} title={s.title}>{s.render({ fr, onPatch })}</Section>
        ))}
      </div>
    </aside>
  );
}
