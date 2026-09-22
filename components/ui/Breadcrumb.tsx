"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SEGMENT_LABELS: Record<string, string> = {
  applications:  "Applications",
  "riftbound-ticketing-portal": "Riftbound Portal",
  "onevenue-backoffice": "OneVenue Backoffice",
  product:       "Product",
  architecture:  "Architecture",
  infrastructure: "Infrastructure",
  initiatives:   "Initiatives",
  catalog:       "Functional Req.",
  history:       "Import History",
  graph:         "Knowledge Graph",
  "design-systems": "Design Systems",
};

interface Segment { label: string; href: string }

function buildCrumbs(pathname: string): Segment[] {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Segment[] = [];
  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    crumbs.push({ label: SEGMENT_LABELS[part] ?? part, href: acc });
  }
  return crumbs;
}

const SEP = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M4.5 2.5l3 3.5-3 3.5" stroke="#d0d0d0" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function Breadcrumb({ extra }: { extra?: Segment[] }) {
  const pathname = usePathname();
  const crumbs = [...buildCrumbs(pathname), ...(extra ?? [])];

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 16 }}>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.href} style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {i > 0 && SEP}
            {isLast ? (
              <span style={{ fontSize: 12, color: "#0f0f0f", fontWeight: 500 }}>{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                style={{ fontSize: 12, color: "#9b9b9b", textDecoration: "none", fontWeight: 400 }}
                onMouseEnter={e => (e.currentTarget.style.color = "#4a4a4a")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9b9b9b")}
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
