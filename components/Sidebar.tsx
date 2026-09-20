"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTraceability } from "@/lib/context/traceability-context";

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s ease" }}
  >
    <path d="M2 4l4 4 4-4" />
  </svg>
);

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" />
  </svg>
);

const AppsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="1" width="6" height="6" rx="1.5" />
    <rect x="9" y="1" width="6" height="6" rx="1.5" />
    <rect x="1" y="9" width="6" height="6" rx="1.5" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" />
  </svg>
);

const PrototypeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="10" height="10" rx="2" />
    <path d="M5 7h4M7 5v4" />
  </svg>
);

const DesignIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="5" />
    <circle cx="7" cy="7" r="2" />
  </svg>
);

const ArchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12L7 3l5 9" />
    <path d="M4.5 9h5" />
  </svg>
);

const InfraIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="2" width="12" height="2.5" rx="1" />
    <rect x="1" y="5.75" width="12" height="2.5" rx="1" />
    <rect x="1" y="9.5" width="12" height="2.5" rx="1" />
  </svg>
);

const InitiativesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 1.5l1.4 4H13L9.3 8l1.4 4L7 9.8l-3.7 2.2 1.4-4L1 5.5h4.6L7 1.5z" />
  </svg>
);

const CatalogIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3.5h10M2 7h10M2 10.5h6" />
  </svg>
);

const GraphIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="3" cy="7" r="2" />
    <circle cx="11" cy="3" r="2" />
    <circle cx="11" cy="11" r="2" />
    <line x1="4.8" y1="6.1" x2="9.2" y2="3.9" />
    <line x1="4.8" y1="7.9" x2="9.2" y2="10.1" />
  </svg>
);

const CoreIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="8" height="8" rx="2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="6" cy="6" r="4" />
    <path d="M10 10l2.5 2.5" />
  </svg>
);

const LabelsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 3.5a1 1 0 011-1h7l3 4.5-3 4.5H2a1 1 0 01-1-1V3.5z" />
  </svg>
);

interface NavItemProps {
  href?: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  badge?: number;
}

function NavItem({ href, icon, label, disabled, badge }: NavItemProps) {
  const pathname = usePathname();
  const isActive = href
    ? href === "/"
      ? pathname === "/"
      : pathname === href || pathname?.startsWith(href + "/")
    : false;

  const base =
    "flex items-center gap-2 mx-1 px-2 rounded-md select-none transition-colors duration-100 cursor-pointer";

  if (disabled) {
    return (
      <div className={`${base} cursor-default`} style={{ height: 28, color: "#62666d" }}>
        <span style={{ display: "flex", alignItems: "center", color: "#62666d" }}>{icon}</span>
        <span className="flex-1 truncate" style={{ fontSize: 13, fontWeight: 400 }}>{label}</span>
      </div>
    );
  }

  const activeStyle = isActive
    ? { backgroundColor: "rgba(255,255,255,0.08)", color: "#d0d6e0" }
    : { color: "#8a8f98" };

  const inner = (
    <>
      <span style={{ display: "flex", alignItems: "center", color: isActive ? "#d0d6e0" : "#8a8f98" }}>
        {icon}
      </span>
      <span className="flex-1 truncate" style={{ fontSize: 13, fontWeight: 400 }}>
        {label}
      </span>
      {badge !== undefined && (
        <span
          style={{
            fontSize: 11,
            lineHeight: "16px",
            padding: "0 6px",
            borderRadius: 9999,
            background: "rgba(255,255,255,0.08)",
            color: "#8a8f98",
          }}
        >
          {badge}
        </span>
      )}
    </>
  );

  if (!href) {
    return (
      <div className={base} style={{ height: 28, ...activeStyle }}>
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={base}
      style={{ height: 28, ...activeStyle }}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "";
      }}
    >
      {inner}
    </Link>
  );
}

interface SectionHeaderProps {
  label: string;
  open: boolean;
  onToggle: () => void;
}

function SectionHeader({ label, open, onToggle }: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1 w-full px-3 hover:opacity-80 transition-opacity"
      style={{ paddingTop: 14, paddingBottom: 4, color: "#62666d" }}
    >
      <ChevronIcon open={open} />
      <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase" }}>
        {label}
      </span>
    </button>
  );
}

export function Sidebar() {
  const [appsOpen, setAppsOpen] = useState(true);
  const [productOpen, setProductOpen] = useState(true);
  const { showLabels, toggleLabels } = useTraceability();

  return (
    <aside
      className="flex flex-col flex-shrink-0 h-screen overflow-y-auto overflow-x-hidden"
      style={{ width: 220, backgroundColor: "#141516", borderRight: "1px solid #23252a" }}
    >
      {/* Workspace header */}
      <div
        className="flex items-center gap-2 px-3 flex-shrink-0"
        style={{ height: 36, borderBottom: "1px solid #23252a" }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0 rounded"
          style={{ width: 20, height: 20, backgroundColor: "#e4f222", color: "#08090a", fontSize: 11, fontWeight: 700 }}
        >
          R
        </div>
        <span className="flex-1 truncate" style={{ fontSize: 13, fontWeight: 510, color: "#ffffff" }}>
          Riot-Games-Project
        </span>
        <button
          className="flex items-center justify-center flex-shrink-0 rounded transition-colors"
          style={{ width: 24, height: 24, color: "#8a8f98" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "")}
        >
          <SearchIcon />
        </button>
      </div>

      {/* Top-level nav */}
      <div style={{ paddingTop: 4, paddingBottom: 2 }}>
        <NavItem href="/" icon={<HomeIcon />} label="Home" />
        <NavItem href="/applications" icon={<AppsIcon />} label="Applications" />
      </div>

      {/* Applications section */}
      <SectionHeader label="Applications" open={appsOpen} onToggle={() => setAppsOpen((o) => !o)} />
      {appsOpen && (
        <div style={{ paddingBottom: 2 }}>
          <NavItem href="/applications/riftbound-ticketing-portal" icon={<PrototypeIcon />} label="Riftbound Portal" />
          <NavItem icon={<PrototypeIcon />} label="OneVenue Backoffice" disabled />
          <NavItem href="/design-systems" icon={<DesignIcon />} label="Design Systems" />
        </div>
      )}

      {/* Product section */}
      <SectionHeader label="Product" open={productOpen} onToggle={() => setProductOpen((o) => !o)} />
      {productOpen && (
        <div style={{ paddingBottom: 2 }}>
          <NavItem href="/product/architecture" icon={<ArchIcon />} label="Architecture" />
          <NavItem href="/product/infrastructure" icon={<InfraIcon />} label="Infrastructure" />
          <NavItem href="/product/initiatives" icon={<InitiativesIcon />} label="Initiatives" />
          <NavItem href="/product/initiatives/catalog" icon={<CatalogIcon />} label="Req. Catalog" />
          <NavItem href="/product/graph" icon={<GraphIcon />} label="Knowledge Graph" />
          <NavItem icon={<CoreIcon />} label="Core" disabled />
        </div>
      )}

      <div className="flex-1" />

      {/* FR Labels toggle */}
      <div className="px-3 flex-shrink-0" style={{ paddingTop: 8, paddingBottom: 10, borderTop: "1px solid #23252a" }}>
        <button
          onClick={toggleLabels}
          className="flex items-center gap-2 w-full rounded-md transition-colors"
          style={{
            height: 28,
            paddingLeft: 8,
            paddingRight: 8,
            fontSize: 13,
            ...(showLabels
              ? { backgroundColor: "rgba(228,242,34,0.1)", color: "#e4f222", border: "1px solid rgba(228,242,34,0.25)" }
              : { color: "#62666d", border: "1px solid #23252a" }),
          }}
        >
          <LabelsIcon />
          <span>{showLabels ? "Labels on" : "Labels off"}</span>
        </button>
      </div>
    </aside>
  );
}
