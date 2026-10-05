"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Typography";
import { IconChevronDown } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { Container } from "@/components/patterns/Layout";
import { EventArtCard, EventListRow } from "@/components/patterns/EventCards";
import { EVENTS } from "@/lib/data/catalog";
import { featuredEvents } from "@/lib/data/selectors";

const INITIAL_LIST = 3;
/** FND-07.16: where the fan left Find Events before opening an event (sessionStorage). */
const RETURN_KEY = "find-events:return";

/** P-01 Find Events. */
export default function FindEventsPage() {
  const [showAll, setShowAll] = useState(false);
  /** Scroll position to restore once the list is rendered as the fan left it (FND-07.16). */
  const [restoreY, setRestoreY] = useState<number | null>(null);
  // FND-03: the portal computes the three featured events; the rest go to "More events".
  const { featured, more } = featuredEvents(EVENTS.filter((e) => e.listed));
  const [hero, ...grid] = featured;
  const visible = showAll ? more : more.slice(0, INITIAL_LIST);

  // FND-07.16: back from an event page, the list stays as the fan left it, at the same scroll position.
  useEffect(() => {
    let saved: { showAll: boolean; y: number } | null = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(RETURN_KEY) ?? "null");
      sessionStorage.removeItem(RETURN_KEY);
    } catch {}
    if (!saved) return;
    setShowAll(saved.showAll);
    setRestoreY(saved.y);
  }, []);
  // Runs after the commit that already renders the restored list, so the page is tall enough.
  useEffect(() => {
    if (restoreY === null) return;
    window.scrollTo(0, restoreY);
    setRestoreY(null);
  }, [restoreY]);
  const rememberPosition = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('a[href^="/events/"]')) return;
    try { sessionStorage.setItem(RETURN_KEY, JSON.stringify({ showAll, y: window.scrollY })); } catch {}
  };

  return (
    <div onClickCapture={rememberPosition}>
      <Container className="py-8">
        {/* FND-02 (game filter) is discarded for v1. */}

        {/* FND-03.24: Find Events with no event; the text is still to be defined. */}
        {!hero && <p className="py-16 text-center text-body text-muted">There are no upcoming events right now.</p>}

        <div className="relative flex flex-col gap-4">
          {hero && <EventArtCard ev={hero} size="hero" />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grid.map((ev) => (
              <EventArtCard key={ev.slug} ev={ev} size="grid" />
            ))}
          </div>
          <ReqMarker ids={["FND-03", "ACC-01"]} corner="tl" />
        </div>

        {hero && (
        <section className="relative mt-10 md:mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <Heading level="heading-lg">More events</Heading>
            {/* FND-07.4: every published event that remains, featured ones included. */}
            <span className="text-body text-muted">{featured.length + more.length} on the calendar</span>
          </div>
          <div className="relative mt-4 flex flex-col gap-3">
            {/* FND-07.17 */}
            {more.length === 0 && <p className="py-6 text-center text-body text-muted">Check back later for more events</p>}
            {visible.map((ev) => (
              <EventListRow key={ev.slug} ev={ev} />
            ))}
            {!showAll && more.length > INITIAL_LIST && (
              <>
                <div className="pointer-events-none -mt-15 h-15 bg-linear-to-b from-canvas/0 to-canvas" />
                <div className="-mt-6 flex justify-center">
                  <Button variant="secondary" size="md" className="shadow-raised" iconRight={<IconChevronDown size={14} />} onClick={() => setShowAll(true)}>
                    Show {more.length - INITIAL_LIST} more
                  </Button>
                </div>
              </>
            )}
          </div>
          <ReqMarker ids={["FND-07"]} corner="tr" />
        </section>
        )}
      </Container>
    </div>
  );
}
