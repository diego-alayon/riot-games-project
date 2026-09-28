"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Data";
import { ActionMenu } from "@/components/ui/Overlay";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { useStore } from "@/lib/state/store";

export function Wordmark() {
  return (
    <Link href="/" className="inline-flex shrink-0 flex-col sm:flex-row sm:items-baseline sm:gap-1">
      <span className="text-heading-sm text-ink tracking-tight">RIOT GAMES</span>
      <span className="text-micro text-accent">TICKETS</span>
    </Link>
  );
}

/**
 * 64px white bar: wordmark, primary nav (FND-01), identity (ACC-04).
 * < sm: wordmark stacks, "Find Events" shortens to "Events", the Riot ID text
 * hides and the avatar itself opens the account menu.
 */
export function SiteHeader() {
  const path = usePathname();
  const { session, ready, signOut } = useStore();
  const onTickets = path.startsWith("/my-tickets");
  const onEvents = path === "/";

  return (
    <header className="sticky top-0 z-30 h-header bg-surface border-b border-line">
      <div className="h-full px-4 md:px-8 flex items-center gap-3 sm:gap-6 md:gap-8">
        <Wordmark />
        <div className="relative h-full">
          <Tabs
            size="nav"
            items={[
              { label: "Find Events", shortLabel: "Events", href: "/", active: onEvents },
              { label: "My Tickets", href: "/my-tickets", active: onTickets },
            ]}
          />
          <ReqMarker ids={["FND-01", "ACC-03"]} corner="br" />
        </div>
        <div className="relative ml-auto flex items-center gap-3">
          {ready && session ? (
            <>
              <span className="hidden md:inline text-body text-subtle">{session.riotId}</span>
              <span className="hidden sm:inline-flex">
                <Avatar name={session.gameName} />
              </span>
              <span className="hidden sm:inline-flex">
                <ActionMenu label="Account" items={[{ label: "Sign out", onSelect: signOut }]} />
              </span>
              <span className="sm:hidden inline-flex">
                <ActionMenu
                  label="Account"
                  trigger={<Avatar name={session.gameName} />}
                  items={[{ label: session.riotId, onSelect: () => {}, disabled: true }, { label: "Sign out", onSelect: signOut }]}
                />
              </span>
            </>
          ) : ready ? (
            <Link href={`/login?next=${encodeURIComponent(path)}`} className="text-label uppercase text-ink hover:text-accent">
              Sign in
            </Link>
          ) : null}
          <ReqMarker ids={["ACC-04"]} corner="bl" />
        </div>
      </div>
    </header>
  );
}
