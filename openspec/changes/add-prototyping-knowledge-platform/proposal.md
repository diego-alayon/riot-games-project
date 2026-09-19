# Proposal

## Why

We need a unified web platform that serves both as a **prototyping studio** (`Applications`) and as a **connected knowledge base** (`Product`) for our products. Currently, UI design, functional requirements, architecture, and infrastructure live in separate tools with no traceability: there's no way to see which functional requirement a prototype screen responds to, nor to navigate from that requirement to the architectural decision or infrastructure component supporting it.

This platform closes that gap. It enables building **functional prototypes** (each with its own design system) within `Applications`, drafting **functional requirements within initiatives** in `Product`, and **linking each UI element to the requirement** that justifies it and to the architecture/infrastructure documentation. The result is a navigable knowledge graph: product → initiative → requirement → UI functionality → documentation.

The first product we will build with the platform is **Riftbound Ticketing Portal**, which will serve as the end-to-end validation case.

## What Changes

This proposal introduces the complete platform from scratch, following the canonical navigation structure of the `Riot-Games-Project`, with two main modules: `Applications` and `Product`.

**`Applications` Module — UI / Prototyping Studio**
- A **module for building applications (prototypes)**, where each prototype has pages, prototype-level behavior, and its own specs.
- A **design system registry**: the host application uses the **Linear** design system, and **each prototype can have its own independent design system**.
- Project applications: **Riftbound Ticketing Portal** and **OneVenue Backoffice**.

**`Product` Module — Knowledge Base**
- Organized into four sections: **Architecture**, **Infrastructure**, **Initiatives**, and **Core**.
- **Initiatives** contains all **functional requirements** across three initiatives:
  - Riftbound Ticketing Portal
  - GateFlow - Access Control
  - OneVenue Backoffice
- **Requirement traceability**: each functionality created in the prototype frontend carries a *label* linking it to its functional requirement; requirements, in turn, can link to components and to `Architecture` and `Infrastructure` documentation.
- A **knowledge base graph** that materializes all those connections and enables navigation.

**Business-defined scope rules:**
- **Riftbound Ticketing Portal** is the **only prototype with a frontend** (pages + ticketing behavior).
- **GateFlow** **has no frontend**: it is an **embedded integration within Riftbound Ticketing Portal** (initiative "GateFlow - Access Control"), which is why it appears in `Initiatives` but not as an application in `Applications`.
- **OneVenue Backoffice** is **out of scope for this phase's detail** (will be addressed later); its place is reserved in both `Applications` and `Initiatives`.

## Capabilities

### New Capabilities

- `platform-shell`: App shell, `Riot-Games-Project` root, `Applications`/`Product` modules, and adoption of Linear design system
- `prototype-builder`: `Applications` module — build prototypes (pages, behavior, specs per prototype)
- `design-system-registry`: Design system per prototype + the app's design system
- `product-workspace`: `Product` module and its 4 sections (Architecture / Infrastructure / Initiatives / Core)
- `initiatives`: Initiatives and functional requirements
- `requirement-traceability`: UI↔requirement labels and requirement↔docs/components links
- `knowledge-base`: Navigable graph uniting all the above

### Modified Capabilities

<!-- No existing capabilities are being modified - this is a greenfield system -->

## Impact

- **New system, no legacy dependencies.** There are no existing specs to modify; all capabilities are `ADDED`.
- **Canonical navigation structure** (`Riot-Games-Project` → `Applications` / `Product`) that must be replicated consistently across main modules.
- **Mandatory design system (app):** all shell and surfaces implemented with Linear tokens (canvas `#010102`, lavender accent `#5e6ad2`, surface scale, negative tracking). See `design.md`.
- **Central data model:** product, section, initiative, functional requirement, prototype, page, UI functionality, document (Architecture/Infrastructure), and **typed links** between them.
- **End-to-end validation case:** Riftbound Ticketing Portal exercises the entire flow (frontend + initiative + traceability + docs).
- **Out of scope for this phase:** functional detail of OneVenue Backoffice and any frontend other than Riftbound.
