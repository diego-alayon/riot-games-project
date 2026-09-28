"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionMenu } from "@/components/ui/Overlay";
import { IconCaretDown } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { cx } from "@/lib/cx";
import { useStore } from "@/lib/state/store";

/** Riot Games wordmark. The glyph is a neutral placeholder until Riot supplies the logo asset. */
export function Wordmark() {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center gap-2 text-on-dark" aria-label="Riot Games Tickets — Find Events">
      <svg width="30" height="26" viewBox="0 0 30 26" fill="currentColor" aria-hidden>
        <path d="M3 6.5 17 2l10 4.2-1.4 13.3L22 22l-.8-4.2-2.4.6.5 4.2-4.3-1-.9-4.2-2.3.2.2 4.3-4-1.2-.5-4.1-2.2-.1.4 3.8L2.2 18z" />
      </svg>
      <span className="flex flex-col text-label leading-[0.95] tracking-tight">
        <span>RIOT</span>
        <span>GAMES</span>
      </span>
      <IconCaretDown className="text-on-dark-muted" />
    </Link>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "text-button uppercase tracking-normal whitespace-nowrap transition-colors",
        active ? "text-on-dark" : "text-on-dark hover:text-on-dark-muted",
      )}
    >
      {children}
    </Link>
  );
}

/**
 * 80px near-black bar: Riot wordmark, Riftbound mark, primary nav (FND-01),
 * identity menu (ACC-04). The v2 comps show the game name only (no tag line).
 */
export function SiteHeader() {
  const path = usePathname();
  const { session, ready, signOut } = useStore();

  return (
    <header className="sticky top-0 z-30 h-header bg-header">
      <div className="h-full px-4 md:px-8 flex items-center gap-4 md:gap-8">
        <Wordmark />
        <span className="hidden sm:block h-8 w-px bg-line-dark" aria-hidden />
        <span className="hidden sm:inline-flex size-7 items-center justify-center rounded-pill bg-surface text-header" aria-label="Riftbound">
          <svg width="16" height="14" viewBox="0 0 30 26" fill="currentColor" aria-hidden>
            <path d="M3 6.5 17 2l10 4.2-1.4 13.3L22 22l-.8-4.2-2.4.6.5 4.2-4.3-1-.9-4.2-2.3.2.2 4.3-4-1.2-.5-4.1-2.2-.1.4 3.8L2.2 18z" />
          </svg>
        </span>
        <nav className="relative flex items-center gap-4 sm:gap-8">
          <NavLink href="/" active={path === "/"}>
            <span className="sm:hidden">Events</span>
            <span className="max-sm:hidden">Find Events</span>
          </NavLink>
          <NavLink href="/my-tickets" active={path.startsWith("/my-tickets")}>My Tickets</NavLink>
          <ReqMarker ids={["FND-01", "ACC-03"]} corner="br" />
        </nav>
        <div className="relative ml-auto flex items-center">
          {ready && session ? (
            <ActionMenu
              label="Account"
              trigger={
                <span className="inline-flex items-center gap-2 text-heading-sm font-bold text-on-dark">
                  <span className="max-sm:hidden">{session.gameName}</span>
                  <span className="sm:hidden inline-flex size-7 items-center justify-center rounded-pill bg-surface text-header text-micro">
                    {session.gameName.slice(0, 1)}
                  </span>
                  <IconCaretDown className="text-on-dark-muted" />
                </span>
              }
              items={[{ label: session.riotId, onSelect: () => {}, disabled: true }, { label: "Sign out", onSelect: signOut }]}
            />
          ) : ready ? (
            <Link href={`/login?next=${encodeURIComponent(path)}`} className="text-button uppercase text-on-dark hover:text-on-dark-muted">
              Sign in
            </Link>
          ) : null}
          <ReqMarker ids={["ACC-04"]} corner="bl" />
        </div>
      </div>
    </header>
  );
}
