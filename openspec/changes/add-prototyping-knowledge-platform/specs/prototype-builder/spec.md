# Spec Delta

## Purpose

Enables building application prototypes within the Applications module, each with pages, prototype-level behavior, and independent specs.

## ADDED Requirements

### Requirement: Building prototypes with pages and behavior
The `Applications` module SHALL allow building application prototypes, each composed of pages with prototype-level behavior and their own specs.

#### Scenario: Create a prototype with pages
- **WHEN** the user creates the "Riftbound Ticketing Portal" prototype
- **THEN** they can add pages to it (e.g., Login)
- **AND** each page can declare prototype-level behavior

### Requirement: Riftbound as the only prototype with frontend
The module SHALL treat Riftbound Ticketing Portal as the only prototype with a frontend, and SHALL treat GateFlow as an integration without frontend embedded within Riftbound.

#### Scenario: GateFlow without frontend
- **WHEN** GateFlow is registered in the module
- **THEN** it is not allowed to create frontend pages
- **AND** it is represented as an integration (GateFlow - Access Control) within Riftbound

#### Scenario: OneVenue Backoffice reserved
- **WHEN** OneVenue Backoffice is listed in the module
- **THEN** it appears reserved without functional detail in this phase
