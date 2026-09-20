"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTraceability } from "@/lib/context/traceability-context";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { showLabels, toggleLabels } = useTraceability();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-linear-hairline-1" style={{ backgroundColor: "var(--color-surface-1)" }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-eyebrow" style={{ color: "var(--color-accent)" }}>
                Riot-Games-Project
              </Link>
              <nav className="flex space-x-6">
                <Link
                  href="/applications"
                  className={`text-sm transition-colors ${
                    pathname?.startsWith("/applications")
                      ? "text-linear-text-ink"
                      : "text-linear-text-muted hover:text-linear-text-ink"
                  }`}
                >
                  Applications
                </Link>
                <Link
                  href="/product"
                  className={`text-sm transition-colors ${
                    pathname?.startsWith("/product")
                      ? "text-linear-text-ink"
                      : "text-linear-text-muted hover:text-linear-text-ink"
                  }`}
                >
                  Product
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLabels}
                className={`text-xs font-mono px-2 py-1 rounded-linear-sm border transition-colors ${
                  showLabels
                    ? "border-linear-accent text-linear-accent bg-linear-surface-3"
                    : "border-linear-hairline-2 text-linear-text-tertiary hover:text-linear-text-muted"
                }`}
                title={showLabels ? "Hide traceability labels" : "Show traceability labels"}
              >
                FR
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
