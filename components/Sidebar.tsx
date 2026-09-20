"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTraceability } from "@/lib/context/traceability-context";

function Icon({ children, size = 14 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {children}
    </svg>
  );
}

function NavItem({ href, label, icon, disabled }: { href?: string; label: string; icon: React.ReactNode; disabled?: boolean }) {
  const pathname = usePathname();
  const isActive = href ? (href === "/" ? pathname === "/" : pathname?.startsWith(href)) : false;

  const base = "flex items-center gap-2 px-3 py-1.5 rounded text-[13px] w-full transition-colors";
  const activeStyle = { backgroundColor: "#161718", color: "#ffffff" };
  const hoverClass = "hover:bg-white/[0.04] hover:text-paper";
  const disabledStyle = { color: "#62666d", cursor: "default" };

  if (disabled || !href) {
    return (
      <div className={`${base} cursor-default`} style={disabledStyle}>
        {icon}
        <span>{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`${base} ${isActive ? "" : `text-mist ${hoverClass}`}`}
      style={isActive ? activeStyle : undefined}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function SectionHeader({ label, expanded, onToggle }: { label: string; expanded: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-3 pt-4 pb-1 text-[11px] font-medium uppercase tracking-wider text-fog hover:text-mist transition-colors"
    >
      <span>{label}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ transition: "transform 0.15s", transform: expanded ? "rotate(0deg)" : "rotate(-90deg)" }}>
        <path d="M2 4 L5 7 L8 4" />
      </svg>
    </button>
  );
}

export function Sidebar() {
  const [appsOpen, setAppsOpen] = useState(true);
  const [productOpen, setProductOpen] = useState(true);
  const { showLabels, toggleLabels } = useTraceability();

  return (
    <aside
      className="flex flex-col shrink-0 overflow-y-auto"
      style={{
        width: 240,
        height: "100vh",
        backgroundColor: "#0f1011",
        borderRight: "1px solid #23252a",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Workspace header */}
      <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: "#23252a" }}>
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-void text-[10px] font-bold shrink-0"
            style={{ backgroundColor: "#e4f222", fontWeight: 700 }}
          >
            R
          </div>
          <span className="text-paper text-[13px] truncate" style={{ fontWeight: 510 }}>
            Riot-Games-Project
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/" className="p-1 rounded text-fog hover:text-mist hover:bg-white/[0.04] transition-colors">
            <Icon>
              <circle cx="6" cy="6" r="4.5" />
              <path d="M6 3.5 L6 6 L7.5 7.5" />
            </Icon>
          </Link>
        </div>
      </div>

      {/* Top nav items */}
      <div className="px-2 pt-2 pb-1 space-y-0.5">
        <NavItem
          href="/"
          label="Home"
          icon={
            <Icon>
              <path d="M2 7 L7 2 L12 7 L12 12 L9 12 L9 9 L5 9 L5 12 L2 12 Z" />
            </Icon>
          }
        />
      </div>

      {/* Applications section */}
      <div className="px-2">
        <SectionHeader label="Applications" expanded={appsOpen} onToggle={() => setAppsOpen(!appsOpen)} />
        {appsOpen && (
          <div className="space-y-0.5 pb-1">
            <NavItem
              href="/applications/riftbound-ticketing-portal"
              label="Riftbound Portal"
              icon={
                <Icon>
                  <rect x="2" y="2" width="10" height="10" rx="1" />
                </Icon>
              }
            />
            <NavItem
              label="OneVenue Backoffice"
              disabled
              icon={
                <Icon>
                  <rect x="2" y="2" width="10" height="10" rx="1" />
                </Icon>
              }
            />
            <NavItem
              href="/design-systems"
              label="Design Systems"
              icon={
                <Icon>
                  <circle cx="5" cy="5" r="3" />
                  <circle cx="9" cy="9" r="3" />
                </Icon>
              }
            />
          </div>
        )}
      </div>

      {/* Product section */}
      <div className="px-2">
        <SectionHeader label="Product" expanded={productOpen} onToggle={() => setProductOpen(!productOpen)} />
        {productOpen && (
          <div className="space-y-0.5 pb-1">
            <NavItem
              href="/product/architecture"
              label="Architecture"
              icon={
                <Icon>
                  <path d="M7 2 L12 11 L2 11 Z" />
                </Icon>
              }
            />
            <NavItem
              href="/product/infrastructure"
              label="Infrastructure"
              icon={
                <Icon>
                  <rect x="1" y="2" width="12" height="2.5" rx="0.5" />
                  <rect x="1" y="5.75" width="12" height="2.5" rx="0.5" />
                  <rect x="1" y="9.5" width="12" height="2.5" rx="0.5" />
                </Icon>
              }
            />
            <NavItem
              href="/product/initiatives"
              label="Initiatives"
              icon={
                <Icon>
                  <circle cx="7" cy="7" r="5" />
                  <circle cx="7" cy="7" r="2" />
                </Icon>
              }
            />
            <NavItem
              href="/product/initiatives/catalog"
              label="Requirements Catalog"
              icon={
                <Icon>
                  <line x1="2" y1="3.5" x2="12" y2="3.5" />
                  <line x1="2" y1="7" x2="12" y2="7" />
                  <line x1="2" y1="10.5" x2="12" y2="10.5" />
                </Icon>
              }
            />
            <NavItem
              href="/product/graph"
              label="Knowledge Graph"
              icon={
                <Icon>
                  <circle cx="3.5" cy="7" r="2" />
                  <circle cx="10.5" cy="7" r="2" />
                  <circle cx="7" cy="2.5" r="2" />
                  <line x1="3.5" y1="7" x2="7" y2="2.5" />
                  <line x1="10.5" y1="7" x2="7" y2="2.5" />
                  <line x1="3.5" y1="7" x2="10.5" y2="7" />
                </Icon>
              }
            />
            <NavItem
              label="Core"
              disabled
              icon={
                <Icon>
                  <rect x="2" y="2" width="10" height="10" rx="2" />
                  <path d="M5 7 L7 9 L9 5" />
                </Icon>
              }
            />
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom: FR toggle */}
      <div className="px-2 pb-3 pt-2 border-t" style={{ borderColor: "#23252a" }}>
        <button
          onClick={toggleLabels}
          className="flex items-center gap-2 px-3 py-1.5 rounded text-[12px] w-full font-mono transition-colors"
          style={
            showLabels
              ? { backgroundColor: "rgba(228,242,34,0.1)", color: "#e4f222", border: "1px solid rgba(228,242,34,0.3)" }
              : { color: "#62666d", border: "1px solid #23252a" }
          }
          title={showLabels ? "Hide traceability labels" : "Show traceability labels"}
        >
          <span>FR</span>
          <span className="text-[11px]">{showLabels ? "Labels on" : "Labels off"}</span>
        </button>
      </div>
    </aside>
  );
}
