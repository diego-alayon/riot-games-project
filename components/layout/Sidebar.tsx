"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function NavItem({
  href,
  icon,
  label,
  disabled,
  badge,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  badge?: number;
}) {
  const pathname = usePathname();
  const isActive = href
    ? pathname === href || (href !== "/" && pathname?.startsWith(href))
    : false;

  const base =
    "flex items-center gap-2 leading-none transition-colors duration-100 select-none cursor-pointer";
  const baseStyle: React.CSSProperties = {
    height: 28,
    minHeight: 28,
    fontSize: 12,
    paddingLeft: 8,
    paddingRight: 8,
    marginLeft: 4,
    marginRight: 4,
    borderRadius: 5,
  };

  if (disabled) {
    return (
      <div className={`${base} cursor-default`} style={{ ...baseStyle, color: "#c0c0c0" }}>
        <span style={{ color: "#d0d0d0", display: "flex", flexShrink: 0 }}>{icon}</span>
        <span className="flex-1 truncate">{label}</span>
      </div>
    );
  }

  const activeStyle: React.CSSProperties = { backgroundColor: "rgba(0,0,0,0.07)", color: "#0f0f0f" };
  const inactiveStyle: React.CSSProperties = { color: "#4a4a4a" };

  const content = (
    <>
      <span style={{ color: isActive ? "#0f0f0f" : "#6b6b6b", display: "flex", alignItems: "center", flexShrink: 0 }}>
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span style={{ background: "rgba(0,0,0,0.07)", color: "#6b6b6b", fontSize: 11, lineHeight: "16px", padding: "0 5px", borderRadius: 9999 }}>
          {badge}
        </span>
      )}
    </>
  );

  if (!href)
    return (
      <div className={base} style={{ ...baseStyle, ...inactiveStyle }}>
        {content}
      </div>
    );

  return (
    <Link
      href={href}
      className={base}
      style={isActive ? { ...baseStyle, ...activeStyle } : { ...baseStyle, ...inactiveStyle }}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.04)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "";
      }}
    >
      {content}
    </Link>
  );
}

function SectionHeader({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    // pt-5 = 20px gap from last item above, pb-0.5 = 2px before first child item
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 w-full transition-opacity hover:opacity-80"
      style={{
        color: "#8c8c8c",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0px",
        textTransform: "none",
        paddingTop: 18,
        paddingBottom: 2,
        paddingLeft: 8,
        paddingRight: 8,
      }}
    >
      <svg
        width="9"
        height="9"
        viewBox="0 0 10 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          transition: "transform 0.15s",
          flexShrink: 0,
        }}
      >
        <path d="M2 3.5l3 3 3-3" />
      </svg>
      <span>{label}</span>
    </button>
  );
}

const I = {
  home: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 5.5L7 1 12.5 5.5V12.5a.5.5 0 01-.5.5H2a.5.5 0 01-.5-.5V5.5z" />
    </svg>
  ),
  apps: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="5" height="5" rx="1" />
      <rect x="8" y="1" width="5" height="5" rx="1" />
      <rect x="1" y="8" width="5" height="5" rx="1" />
      <rect x="8" y="8" width="5" height="5" rx="1" />
    </svg>
  ),
  proto: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2" width="12" height="10" rx="1.5" />
      <path d="M4.5 5.5h5M7 5.5v3" />
    </svg>
  ),
  design: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="5.5" />
      <circle cx="7" cy="7" r="2" />
    </svg>
  ),
  arch: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12L7 2l5 10" />
      <path d="M3.8 8.5h6.4" />
    </svg>
  ),
  infra: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1.5" width="12" height="3" rx="1" />
      <rect x="1" y="5.5" width="12" height="3" rx="1" />
      <rect x="1" y="9.5" width="12" height="3" rx="1" />
    </svg>
  ),
  init: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 1.5l1.6 4.1H13l-3.6 2.6 1.4 4.1L7 9.7l-3.8 2.6 1.4-4.1L1 5.6h4.4L7 1.5z" />
    </svg>
  ),
  catalog: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h10M2 7h10M2 10h6" />
    </svg>
  ),
  graph: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="3" cy="7" r="1.8" />
      <circle cx="11" cy="3" r="1.8" />
      <circle cx="11" cy="11" r="1.8" />
      <line x1="4.7" y1="6.2" x2="9.3" y2="3.8" />
      <line x1="4.7" y1="7.8" x2="9.3" y2="10.2" />
    </svg>
  ),
  core: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
    </svg>
  ),
  search: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="6" cy="6" r="4" />
      <path d="M9.5 9.5l2.5 2.5" />
    </svg>
  ),
  labels: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="9" height="6" rx="1" />
      <path d="M10 6l3-2v6l-3-2" />
    </svg>
  ),
};

export function Sidebar() {
  const [appsOpen, setAppsOpen] = useState(true);
  const [productOpen, setProductOpen] = useState(true);

  return (
    <aside
      className="flex flex-col flex-shrink-0 h-screen overflow-y-auto overflow-x-hidden"
      style={{ width: 220, backgroundColor: "#ffffff" }}
    >
      {/* Workspace header */}
      <div
        className="flex items-center flex-shrink-0"
        style={{ height: 44, paddingLeft: 10, paddingRight: 10 }}
      >
        <span
          style={{ color: "#0f0f0f", fontWeight: 590, fontSize: 13, letterSpacing: "-0.1px" }}
          className="truncate"
        >
          Riot Games Project
        </span>
      </div>

      {/* Applications section */}
      <SectionHeader
        label="Applications"
        open={appsOpen}
        onToggle={() => setAppsOpen((o) => !o)}
      />
      {appsOpen && (
        <div className="pb-1">
          <NavItem href="/applications/riftbound-ticketing-portal" icon={I.proto} label="Riftbound Portal" />
          <NavItem icon={I.proto} label="OneVenue Backoffice" disabled />
        </div>
      )}

      {/* Product section */}
      <SectionHeader
        label="Product"
        open={productOpen}
        onToggle={() => setProductOpen((o) => !o)}
      />
      {productOpen && (
        <div className="pb-1">
          <NavItem href="/product/architecture" icon={I.arch} label="Architecture" />
          <NavItem href="/product/infrastructure" icon={I.infra} label="Infrastructure" />
          <NavItem href="/product/initiatives" icon={I.init} label="Initiatives" />
          <NavItem href="/product/initiatives/catalog" icon={I.catalog} label="Functional Req." />
          <NavItem href="/product/graph" icon={I.graph} label="Knowledge Graph" />
          <NavItem icon={I.core} label="Core" disabled />
        </div>
      )}

      <div className="flex-1" />
    </aside>
  );
}
