"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
