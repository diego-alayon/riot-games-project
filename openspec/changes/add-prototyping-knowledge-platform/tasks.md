# Tasks

## 1. Project Setup and Shell Foundation

- [x] 1.1 Initialize Next.js project with TypeScript and verify dev server starts successfully
- [x] 1.2 Install and configure Tailwind CSS with Linear design tokens and verify token CSS variables render correctly
- [x] 1.3 Set up Linear design tokens (colors, typography, radii, spacing) as CSS variables and verify all token values match design.md specification
- [x] 1.4 Create base shell layout with `Riot-Games-Project` root and verify navigation structure renders

## 2. Design System Implementation (Linear for Shell)

- [x] 2.1 Implement Linear typography scale (Display/Text/Mono with negative tracking) and verify font rendering matches specification
- [x] 2.2 Implement surface scale components (#0f1011 → #191a1b) with hairline borders and verify elevation hierarchy displays correctly
- [x] 2.3 Create base UI components (buttons, cards, inputs) using Linear tokens and verify components pass visual regression tests
- [x] 2.4 Implement focus ring and accent color restrictions (#5e6ad2 usage) and verify accent appears only in brand, focus, and single primary CTA

## 3. Core Data Model and Graph Infrastructure

- [x] 3.1 Define TypeScript types for all graph nodes (Product, Section, Initiative, FunctionalRequirement, Prototype, Page, UIFunctionality, Document, Component) and verify types compile without errors
- [x] 3.2 Define TypeScript types for link types (implements, documented-by, depends-on, integrates-with, belongs-to) and verify link relationships enforce correct node type constraints
- [x] 3.3 Implement in-memory graph store with CRUD operations and verify basic node and link operations work
- [x] 3.4 Add graph query utilities (bidirectional traversal, filter by type) and verify traversal returns correct connected nodes

## 4. Platform Shell Navigation

- [x] 4.1 Implement root navigation (`Riot-Games-Project` → `Applications` / `Product`) and verify both modules are accessible from main nav
- [x] 4.2 Create Applications module landing page listing prototypes and verify Riftbound Ticketing Portal and OneVenue Backoffice appear
- [x] 4.3 Create Product module landing page with four sections and verify Architecture, Infrastructure, Initiatives, and Core sections display
- [x] 4.4 Implement routing between all main navigation nodes and verify deep linking works for all routes

## 5. Design System Registry

- [ ] 5.1 Implement design system schema (name, tokens, components) and verify schema validation works
- [ ] 5.2 Create design system selector/editor UI and verify new design systems can be created and edited
- [ ] 5.3 Implement design system isolation per prototype and verify prototype design tokens do not leak into shell
- [ ] 5.4 Register Linear as the default shell design system and verify shell always renders with Linear tokens

## 6. Prototype Builder (Applications Module)

- [ ] 6.1 Implement Prototype entity CRUD operations and verify prototypes can be created, read, updated, deleted
- [ ] 6.2 Create Page entity within prototypes and verify pages can be added to prototypes
- [ ] 6.3 Implement prototype page editor UI and verify pages can be visually edited
- [ ] 6.4 Create Riftbound Ticketing Portal prototype with initial pages and verify prototype appears in Applications listing
- [ ] 6.5 Register OneVenue Backoffice as reserved (no detail) and verify it appears as placeholder in Applications
- [ ] 6.6 Implement GateFlow as integration (no frontend) within Riftbound and verify GateFlow does not appear as separate application in Applications

## 7. Product Workspace Structure

- [ ] 7.1 Implement Architecture section with document CRUD and verify documents can be created in Architecture
- [ ] 7.2 Implement Infrastructure section with document CRUD and verify documents can be created in Infrastructure
- [ ] 7.3 Create Core section placeholder and verify Core section renders with "Coming soon" state
- [ ] 7.4 Implement document viewer/editor UI and verify documents display with proper formatting

## 8. Initiatives and Functional Requirements

- [ ] 8.1 Implement Initiative entity CRUD operations and verify initiatives can be created, read, updated, deleted
- [ ] 8.2 Implement FunctionalRequirement entity with stable ID generation (FR-XXX-NN) and verify IDs are unique and stable
- [ ] 8.3 Create requirements editor with area, source, classification, and note fields and verify all fields save correctly
- [ ] 8.4 Create three initiatives (Riftbound Ticketing Portal, GateFlow - Access Control, OneVenue Backoffice) and verify all appear in Initiatives section
- [ ] 8.5 Add sample requirements to Riftbound initiative and verify requirements appear in initiative view

## 9. Requirement Traceability (UI Labels)

- [ ] 9.1 Implement UIFunctionality entity with mandatory traceability label field and verify label is required at creation
- [ ] 9.2 Create UI functionality editor that enforces requirement link and verify orphan functionalities cannot be saved
- [ ] 9.3 Implement traceability label display in prototype views (FR-XXX-NN tags) and verify labels render next to UI elements
- [ ] 9.4 Create global toggle for showing/hiding traceability labels and verify toggle shows/hides all labels simultaneously
- [ ] 9.5 Implement click handler on FR labels to jump to requirements catalog and verify clicking label opens filtered catalog

## 10. Requirements Catalog and Bidirectional Navigation

- [ ] 10.1 Create requirements catalog view with filterable table (Classification, Area, Represented) and verify filters work correctly
- [ ] 10.2 Implement search functionality in catalog and verify search returns matching requirements
- [ ] 10.3 Add "Where" column linking back to prototype views and verify links navigate to correct prototype pages
- [ ] 10.4 Implement "Not prototyped" indicator for requirements without UI representation and verify indicator displays when no view reference exists
- [ ] 10.5 Add "Copy as Markdown" export functionality and verify export generates valid Markdown

## 11. Requirement Links to Documentation and Components

- [ ] 11.1 Implement requirement → document links (documented-by) and verify links can be created and navigated
- [ ] 11.2 Implement requirement → component links (implements) and verify component links display correctly
- [ ] 11.3 Add link creation UI in requirement editor and verify links can be added from requirement view
- [ ] 11.4 Display linked documents and components in requirement view and verify clicking links navigates to targets

## 12. Knowledge Base Graph Navigation

- [ ] 12.1 Implement graph visualization component and verify graph renders all node types
- [ ] 12.2 Add interactive navigation in graph view (click node to navigate) and verify clicking nodes navigates to entity views
- [ ] 12.3 Implement bidirectional link traversal UI and verify both directions of each link type are navigable
- [ ] 12.4 Add graph filters (node type, link type) and verify filtering shows only selected types

## 13. End-to-End Validation (Riftbound Ticketing Portal)

- [ ] 13.1 Create Riftbound Ticketing Portal prototype with Login page and verify page appears in prototype
- [ ] 13.2 Create FR-LAY-01 requirement in Riftbound initiative and verify requirement appears in catalog
- [ ] 13.3 Link Login page functionality to FR-LAY-01 and verify traceability label appears on Login page
- [ ] 13.4 Create Architecture document and link to FR-LAY-01 and verify document link appears in requirement view
- [ ] 13.5 Test full traversal: Product → Initiative → Requirement → UI Functionality → Documentation and verify entire chain is navigable in both directions

## 14. Testing and Polish

- [ ] 14.1 Add unit tests for core graph operations and verify all tests pass
- [ ] 14.2 Add integration tests for traceability flows and verify end-to-end traceability works
- [ ] 14.3 Verify Linear design system implementation against design.md checklist and verify all tokens match specification
- [ ] 14.4 Test responsive layout on mobile and tablet viewports and verify layouts work at all breakpoints
- [ ] 14.5 Run accessibility audit and verify no critical WCAG violations exist
