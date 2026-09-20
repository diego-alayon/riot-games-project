"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTraceability } from "@/lib/context/traceability-context";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { showLabels, toggleLabels } = useTraceability();

  return (
    <div className="min-h-screen flex flex-col bg-void">
      <header className="border-b border-graphite" style={{ backgroundColor: "#08090a" }}>
        <div className="px-6 py-4 max-w-[1200px] mx-auto w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="text-paper text-body-sm tracking-tight"
                style={{ fontWeight: 510 }}
              >
                Riot-Games-Project
              </Link>
              <nav className="flex gap-6">
                <Link
                  href="/applications"
                  className={`text-caption transition-colors ${
                    pathname?.startsWith("/applications")
                      ? "text-paper"
                      : "text-mist hover:text-paper"
                  }`}
                >
                  Applications
                </Link>
                <Link
                  href="/product"
                  className={`text-caption transition-colors ${
                    pathname?.startsWith("/product")
                      ? "text-paper"
                      : "text-mist hover:text-paper"
                  }`}
                >
                  Product
                </Link>
              </nav>
            </div>
            <button
              onClick={toggleLabels}
              className={`font-mono text-label px-2 py-1 rounded border transition-colors ${
                showLabels
                  ? "border-acid-lime text-acid-lime"
                  : "border-graphite text-ash hover:text-fog"
              }`}
              title={showLabels ? "Hide traceability labels" : "Show traceability labels"}
            >
              FR
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
