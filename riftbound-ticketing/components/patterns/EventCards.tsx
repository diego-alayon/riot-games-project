import Link from "next/link";
import { Badge, SaleBadge } from "@/components/ui/Badge";
import { EventArt } from "@/components/ui/Media";
import { Heading } from "@/components/ui/Typography";
import { IconPin } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { cx } from "@/lib/cx";
import { dateRange, weekday } from "@/lib/format";
import { saleLabel, venueLine } from "@/lib/data/selectors";
import type { RiftEvent } from "@/lib/data/types";

const eventHref = (ev: RiftEvent) => `/events/${ev.slug}`;
const saleTone = (sale: { live: boolean; text: string }) =>
  sale.live ? "text-success" : sale.text.includes(" in ") ? "text-accent" : "text-ink";

/** Image card with overlaid copy. `size="hero"` is the featured event (FND-03). */
export function EventArtCard({ ev, size }: { ev: RiftEvent; size: "hero" | "grid" }) {
  const sale = saleLabel(ev);
  const hero = size === "hero";
  return (
    <Link
      href={eventHref(ev)}
      className={cx(
        "group relative block overflow-hidden rounded-lg border-b-(length:--spacing-accent-bar) border-accent shadow-card",
        hero ? "h-88 md:h-110" : "h-74",
      )}
    >
      <EventArt art={ev.art} overlay="bottom" markScale={hero ? 1.2 : 0.8} markTop={hero ? 44 : 34} className="transition-transform duration-500 group-hover:scale-[1.02]" />
      <div className="absolute left-0 top-0 flex flex-wrap gap-2 p-4 md:p-5">
        <Badge tone="region" size={hero ? "sm" : "sm"}>{ev.region}</Badge>
        <SaleBadge live={sale.live} size={hero ? "lg" : "sm"}>{sale.text}</SaleBadge>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <span className={cx("uppercase text-accent", hero ? "text-label" : "text-overline")}>
          {weekday(ev.startDate)} · {dateRange(ev.startDate, ev.endDate)}
        </span>
        <Heading level={hero ? "display-xl" : "display-md"} mobile={hero ? "display-md" : "heading-lg"} as="h3" tone="on-dark" className="mt-2">
          {ev.name}
        </Heading>
        <p className="mt-3 inline-flex items-start md:items-center gap-2 text-body text-on-dark-muted">
          <IconPin size={13} className="max-md:mt-1 shrink-0" />
          {venueLine(ev)}
        </p>
      </div>
      <ReqMarker ids={["FND-03", "FND-05", "FND-06"]} inset />
    </Link>
  );
}

/**
 * Compact row for "More events" (FND-07).
 * < md: thumbnail narrows and the ticket status drops under the event details.
 */
export function EventListRow({ ev }: { ev: RiftEvent }) {
  const sale = saleLabel(ev);
  return (
    <Link href={eventHref(ev)} className="relative flex min-h-24 md:h-24 bg-surface border border-line rounded-lg overflow-hidden shadow-card hover:border-line-strong">
      <div className="relative w-list-thumb-sm md:w-list-thumb shrink-0">
        <EventArt art={{ ...ev.art, showMark: false }} overlay="bottom" />
        <div className="absolute inset-0 p-3 flex flex-col justify-between">
          <Badge tone="region" className="self-start">{ev.region}</Badge>
          <span className="text-heading-sm md:text-heading-md uppercase text-on-dark break-words">{ev.city}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0 px-3 py-3 md:px-4 md:py-0 flex flex-col justify-center">
        <span className="text-micro uppercase text-accent">
          {weekday(ev.startDate)} · {dateRange(ev.startDate, ev.endDate)}
        </span>
        <span className="mt-1 text-heading-sm uppercase text-ink">{ev.name}</span>
        <span className="mt-1 inline-flex items-start md:items-center gap-1.5 text-caption text-muted">
          <IconPin size={12} className="max-md:mt-0.5 shrink-0" />
          {venueLine(ev)}
        </span>
        <span className={cx("md:hidden mt-2 text-micro uppercase", saleTone(sale))}>{sale.text}</span>
      </div>
      <div className="hidden md:flex px-5 flex-col items-end justify-center text-right shrink-0">
        <span className="text-micro uppercase text-subtle">Tickets</span>
        <span className={cx("mt-1 text-heading-sm uppercase", saleTone(sale))}>
          {sale.text}
        </span>
      </div>
    </Link>
  );
}
