"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Badge, FanFirstBadge, OwnedText, SaleBadge, StatusText, TierBadge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Chip, FilterChip } from "@/components/ui/Chip";
import { Avatar, BenefitList, DetailGrid, DisclosureToggle, MetaList, Price, StatPill } from "@/components/ui/Data";
import { Checkbox, QuantityStepper, RadioList, TextInput } from "@/components/ui/Form";
import { EventArt, QRCode } from "@/components/ui/Media";
import { ActionMenu, Modal, useToast } from "@/components/ui/Overlay";
import { Callout, Card, Divider } from "@/components/ui/Surface";
import { Tabs } from "@/components/ui/Tabs";
import { BackLink, DateLine, Heading, InlineLink, Overline, SectionLabel } from "@/components/ui/Typography";
import * as Icons from "@/components/icons";
import { EventArtCard, EventListRow } from "@/components/patterns/EventCards";
import { PassCard } from "@/components/patterns/PassCard";
import { SideEventCard } from "@/components/patterns/SideEventCard";
import { OrderPanel } from "@/components/patterns/OrderPanel";
import { Container } from "@/components/patterns/Layout";
import { EVENTS, getEvent, passesFor, sideEventsFor } from "@/lib/data/catalog";
import { useTrace } from "@/lib/trace/trace-context";

/* Class names are written out in full so Tailwind generates them. */
const COLOR_GROUPS: Array<{ group: string; items: Array<{ token: string; cls: string; note: string }> }> = [
  {
    group: "Surfaces",
    items: [
      { token: "canvas", cls: "bg-canvas", note: "Page background" },
      { token: "surface", cls: "bg-surface", note: "Cards, header, panels" },
      { token: "surface-muted", cls: "bg-surface-muted", note: "Chips, neutral tags" },
      { token: "surface-dark", cls: "bg-surface-dark", note: "Heroes, dark pills" },
      { token: "surface-darker", cls: "bg-surface-darker", note: "Overlays, scrims" },
    ],
  },
  {
    group: "Text",
    items: [
      { token: "ink", cls: "bg-ink", note: "Headings, prices, values" },
      { token: "copy", cls: "bg-copy", note: "Running copy, list items" },
      { token: "subtle", cls: "bg-subtle", note: "Labels, nav, overlines" },
      { token: "muted", cls: "bg-muted", note: "Descriptions, captions" },
      { token: "disabled", cls: "bg-disabled", note: "Disabled, dimmed" },
    ],
  },
  {
    group: "Lines",
    items: [
      { token: "line", cls: "bg-line", note: "Card borders, dividers" },
      { token: "line-strong", cls: "bg-line-strong", note: "Inputs, outline buttons" },
    ],
  },
  {
    group: "Accent",
    items: [
      { token: "accent", cls: "bg-accent", note: "Primary CTA, dates, links" },
      { token: "accent-hover", cls: "bg-accent-hover", note: "CTA hover" },
      { token: "accent-disabled", cls: "bg-accent-disabled", note: "Disabled CTA" },
      { token: "accent-line", cls: "bg-accent-line", note: "Note border" },
      { token: "accent-soft", cls: "bg-accent-soft", note: "Note fill" },
    ],
  },
  {
    group: "Feedback",
    items: [
      { token: "success", cls: "bg-success", note: "On sale, registered, owned" },
      { token: "success-soft", cls: "bg-success-soft", note: "Success fill" },
      { token: "fan", cls: "bg-fan", note: "Fan First Access" },
      { token: "fan-soft", cls: "bg-fan-soft", note: "Fan First fill" },
      { token: "danger", cls: "bg-danger", note: "Sold out, destructive" },
    ],
  },
];

const TYPE: Array<{ token: string; cls: string; sample: string; spec: string; upper?: boolean }> = [
  { token: "display-xl", cls: "text-display-xl", sample: "Riot Live Events", spec: "40 / 1.05 · 800 · -1%", upper: true },
  { token: "display-lg", cls: "text-display-lg", sample: "Regional Qualifier - Singapore", spec: "32 / 1.1 · 800 · -1%", upper: true },
  { token: "display-md", cls: "text-display-md", sample: "Regional Qualifier - Bologna", spec: "26 / 1.1 · 800", upper: true },
  { token: "heading-lg", cls: "text-heading-lg", sample: "Weekend schedule", spec: "24 / 1.2 · 800", upper: true },
  { token: "heading-md", cls: "text-heading-md", sample: "Friday, Sep 4", spec: "20 / 1.25 · 800", upper: true },
  { token: "heading-sm", cls: "text-heading-sm", sample: "Premium Competitor", spec: "16 / 1.3 · 800", upper: true },
  { token: "price", cls: "text-price", sample: "€500", spec: "22 / 1.1 · 800" },
  { token: "body-lg", cls: "text-body-lg", sample: "Compete, spectate, and celebrate.", spec: "16 / 1.5 · 400" },
  { token: "body", cls: "text-body", sample: "Players who want the full Riftbound experience.", spec: "14 / 1.5 · 400" },
  { token: "body-sm", cls: "text-body-sm", sample: "Suntec Singapore · Singapore", spec: "13 / 1.45 · 400" },
  { token: "caption", cls: "text-caption", sample: "Accept the terms above to continue.", spec: "12 / 1.4 · 400" },
  { token: "fine", cls: "text-fine", sample: "One pass per Riot account · non-transferable.", spec: "11 / 1.45 · 400" },
  { token: "tab", cls: "text-tab", sample: "Event passes", spec: "14 · 700 · +6%", upper: true },
  { token: "label", cls: "text-label", sample: "Your order", spec: "12 · 700 · +8%", upper: true },
  { token: "overline", cls: "text-overline", sample: "All events", spec: "11 · 700 · +7%", upper: true },
  { token: "micro", cls: "text-micro", sample: "Availability", spec: "10 · 700 · +8%", upper: true },
  { token: "button", cls: "text-button", sample: "Continue to checkout", spec: "14 · 700 · +8%", upper: true },
  { token: "button-sm", cls: "text-button-sm", sample: "Select", spec: "12 · 700 · +7%", upper: true },
  { token: "code", cls: "text-code", sample: "RB-CPK1-GOYP", spec: "14 · 600 · +16%" },
];

const RADII = [
  { token: "xs", cls: "rounded-xs", px: "3px" },
  { token: "sm", cls: "rounded-sm", px: "4px" },
  { token: "md", cls: "rounded-md", px: "6px · buttons, inputs" },
  { token: "lg", cls: "rounded-lg", px: "8px · cards, panels" },
  { token: "pill", cls: "rounded-pill", px: "9999px · badges, chips" },
];

const SHADOWS = [
  { token: "card", cls: "shadow-card" },
  { token: "raised", cls: "shadow-raised" },
  { token: "overlay", cls: "shadow-overlay" },
  { token: "focus", cls: "shadow-focus" },
];

const LAYOUT = [
  ["header", "64px", "Site header height"],
  ["hero", "216px", "Event hero height"],
  ["page", "1136px", "Content container"],
  ["main", "744px", "Main column"],
  ["aside", "360px", "Order panel"],
  ["gutter", "32px", "Column gap"],
  ["time-col", "96px", "Side event time column"],
  ["pass-rail", "112px", "Pass row tier rail"],
  ["accent-bar", "4px", "Orange rule under heroes and art cards"],
  ["list-thumb-sm", "112px", "Mobile · More events thumbnail"],
  ["pass-rail-sm", "88px", "Mobile · pass row tier rail"],
  ["qr-mobile", "176px", "Mobile · badge QR (≥160 to scan)"],
  ["mobile-bar", "72px", "Mobile · sticky order summary bar"],
  ["base unit", "4px", "Tailwind spacing scale (p-1 = 4px … p-10 = 40px)"],
];

function Swatch({ token, cls, note }: { token: string; cls: string; note: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  useEffect(() => {
    if (ref.current) setValue(getComputedStyle(ref.current).backgroundColor);
  }, []);
  return (
    <div className="flex items-center gap-3">
      <div ref={ref} className={`size-11 shrink-0 rounded-md border border-line ${cls}`} />
      <div className="min-w-0">
        <p className="font-mono text-caption text-ink">{token}</p>
        <p className="text-fine text-muted truncate">{note}</p>
        <p className="font-mono text-[10px] text-disabled">{value}</p>
      </div>
    </div>
  );
}

function Section({ id, title, intro, children }: { id: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 pt-12 first:pt-0">
      <Heading level="heading-lg">{title}</Heading>
      {intro && <p className="mt-1 max-w-160 text-body text-muted">{intro}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Specimen({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-disabled">{label}</p>
      {children}
    </div>
  );
}

const NAV = [
  ["colors", "Color"], ["type", "Typography"], ["layout", "Layout & spacing"], ["shape", "Radius & elevation"], ["icons", "Icons"],
  ["buttons", "Buttons"], ["badges", "Badges & status"], ["chips", "Chips & tabs"], ["surfaces", "Cards & callouts"],
  ["forms", "Form controls"], ["data", "Data display"], ["overlays", "Overlays"], ["media", "Media"],
  ["patterns", "Patterns"], ["trace", "Traceability"],
];

export function DesignSystemGallery() {
  const toast = useToast();
  const { trace, setTrace } = useTrace();
  const [modal, setModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [radio, setRadio] = useState<"a" | "b">("a");
  const [check, setCheck] = useState(true);
  const [qty, setQty] = useState(1);

  const sg = getEvent("regional-qualifier-singapore")!;
  const bcn = getEvent("regional-qualifier-barcelona")!;
  const [p1, p2] = passesFor(bcn);
  const sides = sideEventsFor(sg);

  return (
    <Container className="py-8 md:py-12">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
        <div>
          <Overline>Riftbound Ticketing</Overline>
          <Heading level="display-lg" mobile="display-md" as="h1" className="mt-1">Design system</Heading>
          <p className="mt-2 max-w-170 text-body text-muted">
            Tokens and components of the Riftbound web app. Independent from the Riot Games Project manager. Every value comes from{" "}
            <span className="font-mono text-caption">app/globals.css</span>; components never use raw colors or sizes.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setTrace(!trace)}>{trace ? "Hide" : "Show"} requirement tags</Button>
      </div>

      <div className="mt-8 md:mt-10 flex gap-10 items-start">
        {/* Section index: desktop only; phones scroll the single column. */}
        <nav className="hidden lg:flex sticky top-24 w-44 shrink-0 flex-col gap-1.5">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="text-body-sm text-muted hover:text-ink">{label}</a>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {/* ── Foundations ─────────────────────────────────────────────── */}
          <Section id="colors" title="Color" intro="Two tiers: --rb-* primitives (raw values) feed semantic tokens. Components only use semantic tokens. Tailwind's default palette is disabled.">
            <div className="flex flex-col gap-6">
              {COLOR_GROUPS.map((g) => (
                <div key={g.group}>
                  <SectionLabel>{g.group}</SectionLabel>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {g.items.map((i) => <Swatch key={i.token} {...i} />)}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="type" title="Typography" intro="Inter throughout. Headings are uppercase and extra-bold (800); labels are uppercase 700 with positive tracking; copy is 400. Size · line-height · weight · tracking live in one token.">
            <Card padded={false} className="divide-y divide-line">
              {TYPE.map((t) => (
                <div key={t.token} className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-6 px-4 md:px-5 py-3">
                  <span className="w-24 shrink-0 font-mono text-caption text-muted">{t.token}</span>
                  <span className={`md:flex-1 min-w-0 truncate text-ink ${t.cls} ${t.upper ? "uppercase" : ""}`}>{t.sample}</span>
                  <span className="shrink-0 font-mono text-fine text-disabled">{t.spec}</span>
                </div>
              ))}
            </Card>
          </Section>

          <Section id="layout" title="Layout & spacing" intro="Desktop layout measured on the 1512px comps: 1136px container, 744px main column + 360px order panel with a 32px gap. Below lg (1024px) the columns stack and a sticky order bar appears; xl (1280px) and up is the exact desktop comp.">
            <Card padded={false} className="divide-y divide-line">
              {LAYOUT.map(([t, v, n]) => (
                <div key={t} className="flex gap-4 md:gap-6 px-4 md:px-5 py-2.5 text-body-sm">
                  <span className="w-20 md:w-28 shrink-0 font-mono text-muted">{t}</span>
                  <span className="w-16 md:w-20 shrink-0 font-mono text-ink">{v}</span>
                  <span className="min-w-0 text-muted">{n}</span>
                </div>
              ))}
            </Card>
            <div className="mt-4 flex flex-wrap gap-2 items-end">
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1">
                  <div className="bg-accent-line" style={{ width: n * 4, height: n * 4 }} />
                  <span className="font-mono text-[10px] text-disabled">{n * 4}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="shape" title="Radius & elevation">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {RADII.map((r) => (
                <div key={r.token}>
                  <div className={`h-16 bg-surface border border-line-strong ${r.cls}`} />
                  <p className="mt-2 font-mono text-caption text-ink">{r.token}</p>
                  <p className="text-fine text-muted">{r.px}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {SHADOWS.map((s) => (
                <div key={s.token}>
                  <div className={`h-16 bg-surface rounded-lg ${s.cls}`} />
                  <p className="mt-2 font-mono text-caption text-ink">{s.token}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="icons" title="Icons" intro="16px stroke set, 1.6 stroke, currentColor. Game marks are placeholders, not official logos.">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {Object.entries(Icons).map(([name, Icon]) => (
                <div key={name} className="min-w-0 flex flex-col items-center gap-2 p-2 md:p-3 rounded-md bg-surface border border-line">
                  <Icon size={18} />
                  <span className="max-w-full truncate font-mono text-[9px] text-disabled">{name.replace("Icon", "")}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Components ──────────────────────────────────────────────── */}
          <Section id="buttons" title="Buttons" intro="Uppercase 700 with tracking. lg 48px (panel CTAs), md 40px, sm 36px (card CTAs), xs 28px pill (wallet).">
            <div className="flex flex-col gap-5">
              <Specimen label="variants · sm">
                <div className="flex flex-wrap gap-3">
                  <Button size="sm">Select</Button>
                  <Button size="sm" variant="secondary">Add</Button>
                  <Button size="sm" variant="selected">Selected</Button>
                  <Button size="sm" variant="success" iconLeft={<Icons.IconCheck size={13} />}>Registered</Button>
                  <Button size="sm" variant="fan">Pre-register for access</Button>
                  <Button size="xs" variant="dark" iconLeft={<Icons.IconWallet size={12} />}>Add to Apple Wallet</Button>
                </div>
              </Specimen>
              <Specimen label="sizes">
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="lg">Continue to checkout</Button>
                  <Button size="md">Explore event</Button>
                  <Button size="sm">Add</Button>
                  <Button size="xs" variant="dark">Wallet</Button>
                </div>
              </Specimen>
              <Specimen label="disabled">
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" disabled>Full</Button>
                  <Button size="lg" disabled>Pay €279</Button>
                  <Button size="sm" variant="secondary" disabled>Not on sale yet</Button>
                </div>
              </Specimen>
              <Specimen label="icon buttons">
                <div className="flex gap-3">
                  <IconButton label="Decrease"><Icons.IconMinus size={14} /></IconButton>
                  <IconButton label="Increase"><Icons.IconPlus size={14} /></IconButton>
                  <IconButton label="Close" tone="ghost"><Icons.IconClose size={14} /></IconButton>
                </div>
              </Specimen>
            </div>
          </Section>

          <Section id="badges" title="Badges & status">
            <div className="flex flex-col gap-5">
              <Specimen label="tier · fan first">
                <div className="flex flex-wrap gap-2"><TierBadge tier="premium" /><TierBadge tier="standard" /><FanFirstBadge /><Badge tone="neutral">Premium competitor</Badge></div>
              </Specimen>
              <Specimen label="on imagery">
                <div className="relative flex flex-wrap gap-2 p-4 rounded-lg bg-surface-dark">
                  <Badge tone="region">APAC</Badge>
                  <SaleBadge live>On sale now</SaleBadge>
                  <SaleBadge live={false}>On sale in 3 days</SaleBadge>
                  <SaleBadge live size="lg">On sale now</SaleBadge>
                  <Badge tone="glass" icon={<Icons.IconCheck size={11} />}>Attended</Badge>
                </div>
              </Specimen>
              <Specimen label="inline status">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <StatusText tone="success">On sale now</StatusText>
                  <StatusText tone="fan">Fan first pre-registration</StatusText>
                  <StatusText tone="danger">Sold out</StatusText>
                  <OwnedText />
                </div>
              </Specimen>
            </div>
          </Section>

          <Section id="chips" title="Chips & tabs">
            <div className="flex flex-col gap-5">
              <Specimen label="attribute chips">
                <div className="flex flex-wrap gap-2"><Chip>Swiss</Chip><Chip>60m time limit</Chip><Chip>Top 8 cut</Chip><Chip>Best of three</Chip></div>
              </Specimen>
              <Specimen label="filter chips">
                <div className="flex flex-wrap gap-2">
                  <FilterChip icon={<Icons.IconGrid size={14} />}>All</FilterChip>
                  <FilterChip icon={<Icons.IconDiamond className="text-accent" />} active>Riftbound</FilterChip>
                  <FilterChip icon={<Icons.IconHexagon />} disabled>League of Legends</FilterChip>
                </div>
              </Specimen>
              <Specimen label="section tabs">
                <Tabs items={[{ label: "Event passes", href: "#chips", active: true }, { label: "Side events", href: "#chips" }, { label: "On demand events", disabled: true }]} />
              </Specimen>
              <Specimen label="nav tabs (64px bar)">
                <div className="h-16 px-4 bg-surface border border-line rounded-lg">
                  <Tabs size="nav" items={[{ label: "Find events", href: "#chips", active: true }, { label: "My tickets", href: "#chips" }]} />
                </div>
              </Specimen>
            </div>
          </Section>

          <Section id="surfaces" title="Cards & callouts">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(["default", "selected", "owned", "fan", "dimmed"] as const).map((s) => (
                <Card key={s} state={s}><p className="font-mono text-caption text-muted">state=&quot;{s}&quot;</p></Card>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <Callout tone="success" title="You already hold a pass for this event">Premium Competitor · one pass per account. <InlineLink href="#">View in My Tickets</InlineLink></Callout>
              <Callout tone="fan" title="Fan First Access is open">Passes for this event aren&apos;t on sale yet.</Callout>
              <Callout tone="note">Once you check out, you&apos;ll be added to these events on <InlineLink href="#">playriftbound.com</InlineLink>.</Callout>
              <Callout tone="success" title="You're in — see you there!" onDismiss={() => toast("Dismissed")}>Dismissible variant.</Callout>
            </div>
            <Divider className="my-5" />
            <div className="flex flex-wrap gap-x-8 gap-y-3"><BackLink href="#surfaces">All events</BackLink><DateLine>Sep 4 - 6, 2026</DateLine><SectionLabel>Competitor</SectionLabel></div>
          </Section>

          <Section id="forms" title="Form controls">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RadioList name="demo" value={radio} onChange={setRadio} options={[{ value: "a", label: "Option A", hint: "Hint text" }, { value: "b", label: "Option B" }]} />
              <div className="flex flex-col gap-4">
                <TextInput label="Code" placeholder="Enter a code" />
                <Checkbox checked={check} onChange={setCheck}>I agree to the <InlineLink href="#">Terms of Service</InlineLink>.</Checkbox>
                <Specimen label="quantity stepper (RN-03 caps passes at 1)"><QuantityStepper value={qty} max={4} onChange={setQty} /></Specimen>
              </div>
            </div>
          </Section>

          <Section id="data" title="Data display">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card><BenefitList items={["Main Event Access", "1x Side Event Voucher", "Jayce promo card"]} /></Card>
              <Card>
                <MetaList rows={[{ label: "Availability", value: "42 of 128 left" }, { label: "Side-event vouchers", value: "1 included" }, { label: "Badge type", value: "Competitor" }]} />
              </Card>
              <Card><DetailGrid items={[{ label: "Duration", value: "7hr:00m" }, { label: "Entry", value: "€50" }, { label: "Pass vouchers", value: "2 per player" }, { label: "Availability", value: "Sold out", tone: "danger" }]} /></Card>
              <Card className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-6"><Price>€500</Price><Price size="lg">€279</Price><Price tone="muted">€79</Price></div>
                <DisclosureToggle open={open} onToggle={() => setOpen(!open)} />
                <div className="flex flex-wrap gap-3 items-center"><StatPill icon={<Icons.IconTarget size={15} />} value={340} label="Prize tickets" /><Avatar name="Slazareth" /></div>
              </Card>
            </div>
          </Section>

          <Section id="overlays" title="Overlays">
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm" variant="secondary" onClick={() => setModal(true)}>Open modal</Button>
              <Button size="sm" variant="secondary" onClick={() => toast("Toast message")}>Show toast</Button>
              <ActionMenu items={[{ label: "Request refund", onSelect: () => toast("Refund"), tone: "danger" }, { label: "Disabled item", onSelect: () => {}, disabled: true }]} />
            </div>
            <Modal open={modal} onClose={() => setModal(false)} title="Refund Draft Challenge?" footer={<><Button size="sm" variant="secondary" onClick={() => setModal(false)}>Keep it</Button><Button size="sm" onClick={() => setModal(false)}>Refund €35</Button></>}>
              Only this item is refunded; the rest of your order stays active.
            </Modal>
          </Section>

          <Section id="media" title="Media" intro="Event art is a generated placeholder until Riot supplies imagery (FND-04). QR is a visual placeholder; the scannable token comes from the platform.">
            <div className="grid grid-cols-2 gap-4 md:flex">
              {EVENTS.slice(0, 4).map((e) => (
                <div key={e.slug} className="relative h-28 flex-1 rounded-lg overflow-hidden"><EventArt art={e.art} markScale={0.35} /></div>
              ))}
              <div className="justify-self-start p-3 rounded-lg border border-line bg-surface"><QRCode value="RB-7QF2-9KLM" size={88} /></div>
            </div>
          </Section>

          {/* ── Patterns ────────────────────────────────────────────────── */}
          <Section id="patterns" title="Patterns" intro="Composed components used by the screens.">
            <div className="flex flex-col gap-8">
              <Specimen label="EventArtCard · hero / grid"><div className="flex flex-col gap-4"><EventArtCard ev={sg} size="hero" /><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><EventArtCard ev={EVENTS[1]} size="grid" /><EventArtCard ev={EVENTS[2]} size="grid" /></div></div></Specimen>
              <Specimen label="EventListRow"><div className="flex flex-col gap-3"><EventListRow ev={EVENTS[3]} /><EventListRow ev={EVENTS[4]} /></div></Specimen>
              <Specimen label="PassCard · cards · default / selected / owned / dimmed / fan first">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <PassCard pass={p1} currency="EUR" sale="on-sale" />
                  <PassCard pass={p2} currency="EUR" sale="on-sale" selected />
                  <PassCard pass={p1} currency="EUR" sale="on-sale" owned />
                  <PassCard pass={p2} currency="EUR" sale="on-sale" dimmed />
                  <PassCard pass={p1} currency="EUR" sale="fan-first" />
                  <PassCard pass={p2} currency="EUR" sale="fan-first" preregistered />
                </div>
              </Specimen>
              <Specimen label="PassCard · rows">
                <div className="flex flex-col gap-3">
                  <PassCard pass={passesFor(sg)[0]} currency="SGD" sale="on-sale" layout="rows" selected />
                  <PassCard pass={passesFor(sg)[1]} currency="SGD" sale="on-sale" layout="rows" />
                </div>
              </Specimen>
              <Specimen label="SideEventCard · add / added / registered / full / locked">
                <div className="flex flex-col gap-3">
                  <SideEventCard se={sides[0]} currency="SGD" cta="add" />
                  <SideEventCard se={sides[1]} currency="SGD" cta="added" />
                  <SideEventCard se={sides[3]} currency="SGD" cta="registered" />
                  <SideEventCard se={sides[2]} currency="SGD" cta="full" />
                  <SideEventCard se={sides[4]} currency="SGD" cta="locked" />
                </div>
              </Specimen>
              <Specimen label="OrderPanel · empty / cart / owned / fan first">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <OrderPanel ev={sg} cart={{ eventSlug: null, passId: null, sideIds: [] }} owned={null} preregs={[]} mode="sale" onRemovePass={() => {}} onRemoveSide={() => {}} onCheckout={() => {}} sideEventsHref="#" />
                  <OrderPanel ev={sg} cart={{ eventSlug: sg.slug, passId: passesFor(sg)[0].id, sideIds: [sides[0].id] }} owned={null} preregs={[]} mode="sale" onRemovePass={() => {}} onRemoveSide={() => {}} onCheckout={() => {}} sideEventsHref="#" />
                  <OrderPanel ev={bcn} cart={{ eventSlug: null, passId: null, sideIds: [] }} owned={p1} preregs={[]} mode="sale" onRemovePass={() => {}} onRemoveSide={() => {}} onCheckout={() => {}} sideEventsHref="#" />
                  <OrderPanel ev={bcn} cart={{ eventSlug: null, passId: null, sideIds: [] }} owned={null} preregs={[]} mode="fan-first" onRemovePass={() => {}} onRemoveSide={() => {}} onCheckout={() => {}} sideEventsHref="#" />
                </div>
              </Specimen>
            </div>
          </Section>

          <Section
            id="trace"
            title="Traceability"
            intro={
              <>
                Requirement markers are invisible by default so demos show a clean UI. Press <span className="font-mono">⌥T</span> (Alt+T), or open any URL
                with <span className="font-mono">?trace=on</span>, to reveal tiny tags. Hover a tag to outline its region; click to open the requirement
                in the Riot Games Project catalog. Solid violet = confirmed, dashed grey = pending definition.
              </>
            }
          >
            <Button size="sm" variant={trace ? "selected" : "fan"} onClick={() => setTrace(!trace)}>{trace ? "Trace mode on — turn off" : "Turn trace mode on"}</Button>
          </Section>
        </div>
      </div>
    </Container>
  );
}
