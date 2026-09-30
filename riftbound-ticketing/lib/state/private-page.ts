"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "./store";

/** Pages that need an RSO session: Checkout, Order Confirmation, My Tickets (ACC-02, ACC-03). */
const PRIVATE = ["/checkout", "/confirmation", "/my-tickets"];

export const isPrivatePath = (path: string) => PRIVATE.some((p) => path === p || path.startsWith(`${p}/`) || path.startsWith(`${p}?`));

/**
 * Guard for a page that needs an RSO session. Without one, the fan goes to the
 * RSO login and comes back to `path` (ACC-02.3, ACC-03.1); right after «Sign out»
 * they go to Find Events instead (ACC-04.6). Returns true once the page can render.
 */
export function usePrivatePage(path: string): boolean {
  const router = useRouter();
  const { ready, session, signedOut } = useStore();

  useEffect(() => {
    if (!ready || session) return;
    router.replace(signedOut ? "/" : `/login?next=${encodeURIComponent(path)}`);
  }, [ready, session, signedOut, path, router]);

  return ready && !!session;
}
