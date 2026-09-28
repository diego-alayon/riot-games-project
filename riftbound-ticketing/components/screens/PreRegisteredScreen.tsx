"use client";

import { useSearchParams } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surface";
import { Heading } from "@/components/ui/Typography";
import { IconCheck } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { Container } from "@/components/patterns/Layout";
import { getPass } from "@/lib/data/catalog";
import type { RiftEvent } from "@/lib/data/types";
import { dateRange } from "@/lib/format";

/** P-05 follow-up: Fan-First Access pre-registration received (v2 comps). */
export function PreRegisteredScreen({ ev }: { ev: RiftEvent }) {
  const pass = getPass(useSearchParams().get("pass") ?? "");

  return (
    <Container className="py-8 md:py-16">
      <Card className="relative mx-auto max-w-140 p-5! md:p-8! rounded-xl text-center">
        <span className="mx-auto inline-flex items-center justify-center size-14 rounded-pill bg-accent-soft text-accent">
          <IconCheck size={26} />
        </span>
        <Heading level="heading-lg" as="h1" className="mt-5">Pre-registration received</Heading>
        <p className="mt-1 text-body text-muted">Fan-First Access</p>

        <div className="mt-6 p-4 md:p-5 text-left rounded-lg border border-line bg-canvas">
          <p className="text-heading-sm uppercase text-ink">{ev.name}</p>
          <p className="text-caption text-muted">{dateRange(ev.startDate, ev.endDate)} · {ev.city}</p>
          <p className="mt-4 text-body text-copy">
            You pre-registered for {pass ? <>a <strong className="font-bold text-ink">{pass.name}</strong> pass</> : "a pass"}. We&apos;ll verify your Riot
            account to help ensure tickets go to real Riot fans. Once verified, we&apos;ll email you to confirm your Fan-First Access registration and let
            you know when passes become available.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LinkButton href={`/events/${ev.slug}`} variant="primary" size="lg" block>Back to event</LinkButton>
          <LinkButton href="/" variant="secondary" size="lg" block>Browse more events</LinkButton>
        </div>
        <p className="mt-4 text-caption text-muted">Pre-registration does not guarantee a ticket. Watch your inbox for next steps.</p>
        <ReqMarker ids={["FFA-01", "FFA-02", "AUD-02"]} inset />
      </Card>
    </Container>
  );
}
