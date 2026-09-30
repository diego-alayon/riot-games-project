"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Typography";
import { IconChevronDown } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { PageHero } from "@/components/patterns/Heroes";
import { Container } from "@/components/patterns/Layout";
import { EventArtCard, EventListRow } from "@/components/patterns/EventCards";
import { EVENTS } from "@/lib/data/catalog";
import { featuredEvents } from "@/lib/data/selectors";

const INITIAL_LIST = 3;

/** P-01 Find Events. */
export default function FindEventsPage() {
  const [showAll, setShowAll] = useState(false);
  // FND-08: the portal computes the three featured events; the rest go to "More events".
  const { featured, more } = featuredEvents(EVENTS.filter((e) => e.listed));
  const [hero, ...grid] = featured;
  const visible = showAll ? more : more.slice(0, INITIAL_LIST);

  return (
    <>
      <PageHero title="Riot Live Events" subtitle="Compete, spectate, and celebrate across Riot's global calendar of live events." />
      <Container className="py-8">
        {/* FND-02 (game filter) is discarded for v1. */}

        <div className="relative flex flex-col gap-4">
          {hero && <EventArtCard ev={hero} size="hero" />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grid.map((ev) => (
              <EventArtCard key={ev.slug} ev={ev} size="grid" />
            ))}
          </div>
          <ReqMarker ids={["FND-08", "ACC-01"]} corner="tl" />
        </div>

        <section className="relative mt-10 md:mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <Heading level="heading-lg">More events</Heading>
            <span className="text-body text-muted">{more.length} on the calendar</span>
          </div>
          <div className="relative mt-4 flex flex-col gap-3">
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
      </Container>
    </>
  );
}
