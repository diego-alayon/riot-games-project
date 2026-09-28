"use client";

import { useState } from "react";
import { FilterChip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Typography";
import { IconChevronDown, IconCrown, IconDiamond, IconFang, IconGrid, IconHexagon } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { PageHero } from "@/components/patterns/Heroes";
import { Container } from "@/components/patterns/Layout";
import { EventArtCard, EventListRow } from "@/components/patterns/EventCards";
import { EVENTS } from "@/lib/data/catalog";

const INITIAL_LIST = 3;

/** P-01 Find Events. */
export default function FindEventsPage() {
  const [showAll, setShowAll] = useState(false);
  const listed = EVENTS.filter((e) => e.listed);
  const hero = listed.filter((e) => e.placement === "hero");
  const grid = listed.filter((e) => e.placement === "grid");
  const more = listed.filter((e) => e.placement === "list");
  const visible = showAll ? more : more.slice(0, INITIAL_LIST);

  return (
    <>
      <PageHero title="Riot Live Events" subtitle="Compete, spectate, and celebrate across Riot's global calendar of live events." />
      <Container className="py-8">
        <div className="relative">
          <span className="text-micro uppercase text-subtle">Browse by event category</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {/* FND-02: only Riftbound is active in v1. */}
            <FilterChip icon={<IconGrid size={14} />} disabled>All</FilterChip>
            <FilterChip icon={<IconDiamond className="text-accent" />} active>Riftbound</FilterChip>
            <FilterChip icon={<IconHexagon />} disabled>League of Legends</FilterChip>
            <FilterChip icon={<IconFang />} disabled>VALORANT</FilterChip>
            <FilterChip icon={<IconCrown />} disabled>Teamfight Tactics</FilterChip>
          </div>
          <ReqMarker ids={["FND-02"]} corner="tr" />
        </div>

        <div className="relative mt-8 flex flex-col gap-4">
          {hero.map((ev) => (
            <EventArtCard key={ev.slug} ev={ev} size="hero" />
          ))}
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
