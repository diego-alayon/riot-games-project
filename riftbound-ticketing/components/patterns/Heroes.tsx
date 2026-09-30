import type { ReactNode } from "react";
import { KeyArt } from "@/components/ui/Media";
import { BackLink, Heading } from "@/components/ui/Typography";
import { IconCalendar, IconPin } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { dateRange } from "@/lib/format";
import { venueLine } from "@/lib/data/selectors";
import type { RiftEvent } from "@/lib/data/types";
import { Container } from "./Layout";

/** Key-art band behind page and event titles (v2 comps: no accent rule). */
function HeroBand({ children, image }: { children: ReactNode; image?: string }) {
  return (
    <section className="relative bg-surface-darker overflow-hidden">
      <KeyArt image={image} />
      <div className="relative">{children}</div>
    </section>
  );
}

/** Find Events hero ("Riot Live Events"). */
export function PageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <HeroBand>
      <Container className="min-h-hero py-10 flex flex-col justify-center">
        <Heading level="display-hero" mobile="display-md" titleCase as="h1" tone="on-dark">
          {title}
        </Heading>
        <p className="mt-2 text-body-lg font-bold text-on-dark-muted">{subtitle}</p>
      </Container>
    </HeroBand>
  );
}

/**
 * Event detail header (EVT-03): back link, dates, venue, name over key art.
 * The event's own image (FND-03) wins when one is supplied; otherwise the shared
 * Riftbound key art of the v2 comps.
 */
export function EventHero({ ev }: { ev: RiftEvent }) {
  return (
    <HeroBand image={ev.art.image}>
      <Container className="relative min-h-hero py-8 flex flex-col justify-center">
        <BackLink href="/" tone="on-dark">
          All events
        </BackLink>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-body-sm font-bold text-on-dark">
          <span className="inline-flex items-center gap-2 uppercase">
            <IconCalendar size={14} />
            {dateRange(ev.startDate, ev.endDate)}
          </span>
          <span className="inline-flex items-center gap-2">
            <IconPin size={14} />
            {venueLine(ev)}
          </span>
        </div>
        <Heading level="display-hero" mobile="display-md" titleCase as="h1" tone="on-dark" className="mt-2">
          {ev.name}
        </Heading>
        <ReqMarker ids={["EVT-03"]} corner="br" inset />
      </Container>
    </HeroBand>
  );
}
