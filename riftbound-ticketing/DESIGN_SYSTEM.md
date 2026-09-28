# Riftbound Ticketing — Design system

Standalone web app for the Riftbound Ticketing Portal. It has its **own** design system; nothing is shared with the Riot Games Project manager at the repo root.

Live gallery: `http://localhost:3001/design-system`

## Rules

1. **Tokens only.** Components use semantic tokens from [app/globals.css](app/globals.css). No raw hex, px font sizes or Tailwind default colors. The default palette, type scale, radii and shadows are cleared, so a stray `bg-blue-500` produces no style.
2. **Two tiers.** `--rb-*` primitives (raw values measured from the comps) feed semantic tokens (`--color-accent`, `--text-heading-sm`…). To change the brand, edit primitives.
3. **Reuse components.** Screens compose `components/patterns/*`, which compose `components/ui/*`. Add a variant before adding a one-off.

## Foundations

| Area | Decision |
|---|---|
| Font | Inter (next/font). Headings uppercase 800; labels uppercase 700 with +6–8% tracking; copy 400. |
| Color | v2: Riot red accent `#e4002b`, near-black header `#111214`, navy ink `#1b2536`, canvas `#f8f8f9`, grey inert CTAs, green success / Registered, violet Fan First, amber warning. |
| Type scale | display-hero 44 (title case) · display-xl 40 · display-lg 32 · display-md 26 · heading-lg 24 · heading-md 20 · heading-sm 16 · title 16 (title case) · price 22 · body-lg 16 · body 14 · body-sm 13 · caption 12 · fine 11 · tab 14 · label 12 · overline 11 · micro 10 · button 14 · button-sm 12 · code 14. |
| Layout | Header 80 · key-art hero 220 · price panel 152 · container 1136 · main 744 + aside 360 · gutter 32 · 4px base unit. |
| Responsive (RNF-14) | Desktop comp is exact at `xl` (≥1280). `lg` (≥1024): fluid main + 360 panel. Below `lg` the order panel stacks under the content and `MobileOrderBar` (total + checkout) sticks to the bottom while the cart has items. Below `md` (768): 16px gutters, headings step down via `<Heading mobile="…">`, grids collapse to one column, the badge QR grows to `qr-mobile`. Mobile-only tokens: `list-thumb-sm`, `pass-rail-sm`, `qr-mobile`, `mobile-bar`. |
| Radius | xs 3 · sm 4 · md 6 (buttons, inputs) · lg 10 (cards) · xl 12 (order panel, confirmations) · pill. |
| Elevation | card · raised · overlay · focus ring (red, 3px). |
| Signature | Key-art heroes with title-case display type; 4px red rule under event art cards; price + CTA panel (sunken grey) on every pass and side event card. |

## Components

- **ui/** — Button (primary, secondary, selected, success, fan, dark × lg/md/sm/xs), IconButton, Badge (tier, fan, region, live, soon, neutral, glass), StatusText, Chip, FilterChip, Tabs (nav, section), Card (default, selected, owned, fan, dimmed), Callout (success, fan, note, neutral), Divider, Heading, SectionLabel, Overline, DateLine, BackLink, InlineLink, BenefitList, MetaList, DetailGrid, DisclosureToggle, Price, LineItem, StatPill, Avatar, Checkbox, RadioList, TextInput, QuantityStepper, Modal, ActionMenu, Toast, EventArt, QRCode.
- **patterns/** — SiteHeader, PageHero, EventHero, EventArtCard, EventListRow, PassCard (cards / rows), SideEventCard, OrderPanel, MobileOrderBar, TicketCard, PastEventRow, EventShell, Container, TwoColumn.

## Requirement traceability

`<ReqMarker ids={[...]} />` sits inside any `relative` element. It renders **nothing** unless trace mode is on, so stakeholder demos show a clean UI.

- Toggle: **⌥T / Alt+T**, or `?trace=on` / `?trace=off` in any URL. Remembered per browser.
- On: tiny mono tags at 40% opacity. Hover outlines the region; click opens the requirement in the manager catalog (`NEXT_PUBLIC_MANAGER_URL`, default `http://localhost:3000`).
- Solid violet = Confirmado; dashed grey = Pendiente de definir.
- A presenter panel appears (bottom right) to switch pass layout (EVT-06), session (signed in / anonymous) and reset demo data.

[traceability.json](traceability.json) maps each screen to its requirements.

## Prototype stand-ins

| Real system | Prototype |
|---|---|
| RSO | `/login` simulated round trip |
| OneVenue catalog / orders | `lib/data/catalog.ts`, `lib/state/store.tsx` (localStorage) |
| Stripe Payment Element | Embedded card form placeholder |
| Riot key art | Generated gradient art (`EventArt`, accepts `image`) |
| Badge QR token | Deterministic visual QR (not scannable) |
| Today | Demo clock `2026-08-20` (`lib/format.ts`) |
