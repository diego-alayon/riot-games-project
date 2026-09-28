import type { ReactNode } from "react";
import { EventArt } from "@/components/ui/Media";
import { BackLink, DateLine, Heading } from "@/components/ui/Typography";
import { IconPin } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { dateRange } from "@/lib/format";
import { venueLine } from "@/lib/data/selectors";
import type { RiftEvent } from "@/lib/data/types";
import { Container } from "./Layout";

/** Dark band closing in a 4px orange rule — shared by both heroes. */
function HeroBand({ children, art }: { children: ReactNode; art?: ReactNode }) {
  return (
    <section className="relative bg-surface-dark border-b-(length:--spacing-accent-bar) border-accent overflow-hidden">
      {art}
      <div className="relative">{children}</div>
    </section>
  );
}

/** Find Events hero ("RIOT LIVE EVENTS"). */
export function PageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <HeroBand
      art={
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-[55%] bg-surface-dark"
          style={{ backgroundImage: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.04))" }}
        />
      }
    >
      <Container className="py-8 md:py-11">
        <Heading level="display-xl" mobile="display-md" as="h1" tone="on-dark">
          {title}
        </Heading>
        <p className="mt-3 md:mt-4 md:text-body-lg text-on-dark-muted">{subtitle}</p>
      </Container>
    </HeroBand>
  );
}

/** Event detail header (EVT-03): back link, dates, name, venue, key art. */
export function EventHero({ ev }: { ev: RiftEvent }) {
  return (
    <HeroBand
      art={
        <div className="absolute inset-y-0 right-0 w-full md:w-[70%]">
          <EventArt art={ev.art} overlay="left" markScale={0.8} />
        </div>
      }
    >
      <Container className="relative min-h-hero py-8 md:py-0 md:h-hero flex flex-col justify-center">
        <BackLink href="/" tone="on-dark">
          All events
        </BackLink>
        <div className="mt-5 md:mt-6">
          <DateLine>{dateRange(ev.startDate, ev.endDate)}</DateLine>
        </div>
        <Heading level="display-lg" mobile="display-md" as="h1" tone="on-dark" className="mt-2">
          {ev.name}
        </Heading>
        <p className="mt-3 inline-flex items-start md:items-center gap-2 text-body-sm text-on-dark-muted">
          <IconPin size={13} className="max-md:mt-1 shrink-0" />
          {venueLine(ev)}
        </p>
        <ReqMarker ids={["EVT-03", "FND-04"]} corner="br" inset />
      </Container>
    </HeroBand>
  );
}
