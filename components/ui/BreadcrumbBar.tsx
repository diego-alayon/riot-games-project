"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Route label map ────────────────────────────────────────────────────────────
const LABELS: Record<string, string> = {
  applications:                  "Applications",
  "riftbound-ticketing-portal":  "Riftbound Portal",
  "onevenue-backoffice":         "OneVenue Backoffice",
  product:                       "Product",
  architecture:                  "Architecture",
  infrastructure:                "Infrastructure",
  initiatives:                   "Initiatives",
  catalog:                       "Functional Req.",
  history:                       "Import History",
  graph:                         "Knowledge Graph",
  "design-systems":              "Design Systems",
};

interface Crumb { label: string; href: string }

function buildCrumbs(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  let acc = "";
  return parts.map(part => {
    acc += `/${part}`;
    return { label: LABELS[part] ?? part, href: acc };
  });
}

const Sep = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M4.5 2.5l3 3.5-3 3.5" stroke="#d8d8d8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function BreadcrumbBar() {
  const pathname = usePathname() ?? "/";
  const crumbs = buildCrumbs(pathname);

  // Hide on root
  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "0 16px",
        height: 36,
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.href} style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {i > 0 && <Sep />}
            {isLast ? (
              <span style={{ fontSize: 12, fontWeight: 500, color: "#0f0f0f" }}>
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                style={{ fontSize: 12, fontWeight: 400, color: "#9b9b9b", textDecoration: "none" }}
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
