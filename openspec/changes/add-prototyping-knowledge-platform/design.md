# Design

## Context

The platform combines two natures that normally live separately: a **prototype constructor** (`Applications` module, with interchangeable design systems) and a **knowledge base with traceability** (`Product` module). The key design decision is to treat **everything as nodes of a graph** connected by **typed links**, so that traceability is not a separate table but the system's backbone.

The host application (the "shell") strictly adopts the **Linear design system** as its only design system, while each prototype built within `Applications` declares its **own** design system.

For motivation, see proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Navigable knowledge graph where every UI element traces back to its justifying requirement and related documentation
- Isolated design systems: Linear for the shell, independent systems per prototype
- End-to-end validation with Riftbound Ticketing Portal as the reference case
- Bidirectional traceability: UI → requirement and requirement → UI/docs

**Non-Goals:**
- Full functional detail of OneVenue Backoffice (reserved for future phase)
- Real-time collaboration features in prototypes
- Version control for requirements (out of scope for initial release)
- Export/import of the knowledge graph (deferred - see Open Questions)

## Decisions

### 1. Knowledge graph as the source of truth for traceability

**Decision:** Model `Product/Application`, `Section`, `Initiative`, `FunctionalRequirement`, `Prototype`, `Page`, `UIFunctionality`, `Document`, and `Component` as **nodes**, united by **typed links** (`implements`, `documented-by`, `depends-on`, `integrates-with`, `belongs-to`).

**Rationale:** The brief explicitly asks that it "function as a knowledge base with its connections." A graph model avoids duplicating traceability across multiple tables and enables bidirectional navigation (from UI to FR and vice versa).

**Alternative considered:** Flat reference fields in each entity — does not scale to N:N links or cross-documentation.

### 2. One design system for the app, one per prototype

**Decision:** The shell uses **Linear** as a fixed system. The `design-system-registry` allows **each prototype** in `Applications` to declare and edit its own, without inheriting the app's.

**Rationale:** Prototypes represent different products (Riftbound, etc.) that do not share the tool's visual identity.

**Alternative considered:** Single shared design system — would force all prototypes to look like the Linear platform, breaking visual fidelity for product-specific mockups.

### 3. Traceability label as a first-class property of each UI functionality

**Decision:** When creating any functionality in a prototype's frontend, assign (or require) a **label** that points to an existing `FunctionalRequirement` in the corresponding initiative.

**Rationale:** Guarantees that no UI piece is orphaned from functional justification and feeds the graph automatically.

**Alternative considered:** Manual linking after creation — increases risk of orphan UI elements and loses the enforcement point.

### 4. GateFlow as integration, not as application

**Decision:** GateFlow is not modeled as an application with pages in `Applications`, but as an **integration capability** ("GateFlow - Access Control") that Riftbound consumes; it appears in `Initiatives` but not in `Applications`. Its initiative contains integration/access control FRs, not screen FRs.

**Rationale:** Business defined it explicitly this way, and it aligns with the diagram.

**Alternative considered:** Separate GateFlow application — contradicts business requirements and the provided navigation structure.

## Linear Design Tokens — Shell Implementation

Extracted from the Linear DESIGN.md. Canonical values to wire into Tailwind/CSS variables for the shell.

- **Single accent:** `#5e6ad2` (hover `#828fff`, focus `#5e69d1`) — only in brand, focus ring, and **one** primary CTA per section. No second chromatic color.
- **Canvas:** `#010102` (black with blue tint, never `#000000`).
- **Surface scale:** `#0f1011` → `#141516` → `#18191a` → `#191a1b` (hierarchy by elevation, no shadows).
- **Hairlines:** `#23252a` / `#34343a` / `#3e3e44`.
- **Text:** ink `#f7f8f8`, muted `#d0d6e0`, subtle `#8a8f98`, tertiary `#62666d`.
- **Semantic:** success `#27a644` (only semantic color).
- **Typography:** Linear Display / Text / Mono (fallback SF Pro Display; libre substitute: Inter 500/600/700 + JetBrains Mono). Aggressive negative tracking in display (`-3.0px` at 80px) down to `-0.05px` in body; eyebrow with positive tracking `+0.4px`.
- **Radii:** 4/6/8/12/16/24 + pill. Cards with `12px` and 1px hairline border.
- **Spacing:** base 4px → 8/12/16/24/32/48 → `96px` section padding.

> Note: the **app's** design system is Linear (dark-only). **Prototypes** define theirs separately via `design-system-registry`.

## Traceability Pattern Reference (Riftbound Backoffice Example)

> Registered from the `RIOT-Riftbound-Back-Prototipo.html` prototype, delivered as an **example** of how the application should look and how each functional requirement links from the UI itself. This is the reference pattern; **the requirements UI will be built as indicated later**, not in this phase.

**What the example is:** The real Riftbound backoffice (Events; Products → Tickets, Slots, Season passes, Eligibility; Passes) plus its own navigation item, "Functional requirements". Corresponds to the application hanging from `Applications` in the diagram.

**UI ↔ requirement link mechanism:**
- Each UI functionality carries an empty marker `<span data-fr="FR-XXX-NN"></span>` next to the implementing element.
- A hydration routine (`decorateFr()`) traverses all `[data-fr]`, paints the code as a clickable *tag*, uses the requirement's description as tooltip, and on click **jumps to the requirements catalog filtered by that code**.
- A global toggle **"Requirement links"** (`fr-off` class on `body`) shows or hides all tags at once.
- The link is **bidirectional**: from the UI the tag leads to the requirement; in the catalog, the **"Where"** column links back to the prototype view where the requirement lives (or marks "Not prototyped" if not represented).
- The **catalog** (view `Functional requirements`) is a filterable table (Classification / Area / Represented in prototype / Search) with summary counters and export **"Copy as Markdown"**.

**Data model for each functional requirement** (object `FR`), reusable as the base model for `initiatives`:
- `code` (key, e.g., `FR-LAY-01`); the **prefix encodes the area**.
- `a` area · `d` requirement text · `s` source · `v` prototype view where represented (or `null`) · `t` implementation note · `k` classification (`build` by default, `out` = out of scope).

**Observed taxonomy** (98 requirements):
- **Areas / prefixes:** Slots (`SLT`), Eligibility (`ELG`), Localisation (`I18N`), Storefront (`FRT`), Layouts (`LAY`), Side events (`SDE`), Passes (`PAS`), Products (`PRD`), Emails & notifications (`EML`), Pricing (`PRC`), Channels (`CHN`), Integrations (`INT`), Venue (`VEN`), Access control (`ACC`).
- **Sources:** `Riot requirement`, `Design decision`, Work Order clauses (`WO x.y`), `Open decision`.
- **Classification:** `build` (to develop) and `out` (out of scope); export also contemplates `native` (already exists in OneVenue — only cross-check).
- Requirements are contrasted against *OneVenue / SGA 2.0 — Product Source of Truth*, deliberately excluding what OneVenue already does.

**How it feeds the design:** This pattern materializes the `requirement-traceability` capabilities (mandatory `data-fr` marker, jump to requirement, toggle and bidirectional link) and `initiatives` (catalog with stable ID, area, source, note, classification and view link), and is coherent with the `knowledge-base` graph.

## Data Model

### Core Entities (Graph Nodes)

- **Product**: Top-level container (e.g., Riftbound Ticketing Portal)
- **Section**: Product module section (Architecture, Infrastructure, Initiatives, Core)
- **Initiative**: Container for functional requirements within a product
- **FunctionalRequirement**: Stable ID (e.g., `FR-LAY-01`), description, source, area, classification, implementation note, view reference
- **Prototype**: Application in the Applications module
- **Page**: Individual page within a prototype
- **UIFunctionality**: Specific feature on a page with traceability label
- **Document**: Architecture or Infrastructure documentation piece
- **Component**: Reusable technical component
- **DesignSystem**: Design system declaration (shell uses Linear, prototypes define their own)

### Link Types

- `implements`: FunctionalRequirement → Component
- `documented-by`: FunctionalRequirement → Document
- `depends-on`: FunctionalRequirement → FunctionalRequirement
- `integrates-with`: Initiative → Prototype (e.g., GateFlow → Riftbound)
- `belongs-to`: Page → Prototype, UIFunctionality → Page, FunctionalRequirement → Initiative

## Risks / Trade-offs

**[Risk]** Graph query performance degrades as the knowledge base grows → **Mitigation:** Index typed links by source/target entity types; implement pagination in graph traversal views; defer full-text search to later phase.

**[Risk]** Users create UI functionalities without linking requirements → **Mitigation:** Make traceability label mandatory at creation time (enforced in the UI, not just suggested).

**[Risk]** Prototype design systems conflict with shell design system → **Mitigation:** Strict isolation via scoped CSS/design tokens; prototype rendering happens in isolated containers that do not inherit shell styles.

**[Risk]** Linear design tokens updated upstream, causing visual drift → **Mitigation:** Lock to specific Linear design system version in documentation; establish periodic review cadence to incorporate updates intentionally.

**[Trade-off]** Bidirectional navigation increases implementation complexity but is core to the value proposition → Accept the complexity; it is the primary differentiator of this platform.

**[Trade-off]** GateFlow has no frontend, only exists as integration → This simplifies the MVP and aligns with business requirements; GateFlow pages can be added later if needed without changing the core model.

## Open Questions

1. **Duplicate in `Applications` diagram:** The diagram lists "Riftbound Ticketing Portal" twice under `Applications`. Assume it is a diagram error and the real applications are Riftbound Ticketing Portal and OneVenue Backoffice; confirm if the second entry should be a different application.

2. **Scope of `Core` section:** What does the Core section of `Product` contain (domain, shared entities, base services)? Pending definition — can be addressed during implementation.

3. **Prototype behavior fidelity:** "Prototype-level functionality" — is this simulated/static behavior or real logic? Affects the scope of `prototype-builder`. Lean toward static/mocked behavior for MVP, real logic deferred.

4. **Graph persistence and export:** Does the graph export (e.g., to Markdown/JSON) or live only in the platform? If export is needed, format and use cases should be clarified before implementation.

5. **OneVenue Backoffice future:** Functional detail deferred; will it have its own frontend in the future? Does not block current work — reserve the structure and add detail when requirements arrive.
