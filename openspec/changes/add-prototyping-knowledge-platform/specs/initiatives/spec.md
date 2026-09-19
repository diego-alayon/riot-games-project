# Spec Delta

## Purpose

Manages product initiatives as containers for functional requirements with stable identifiers for traceability.

## ADDED Requirements

### Requirement: Initiatives as container for functional requirements
Each product SHALL have initiatives that contain all its functional requirements. The system SHALL support at least the Riftbound Ticketing Portal, GateFlow - Access Control, and OneVenue Backoffice initiatives.

#### Scenario: Requirements within the initiative
- **WHEN** the user opens the "Riftbound Ticketing Portal" initiative
- **THEN** they can draft and list its functional requirements

### Requirement: Stable requirement identifier
Each functional requirement SHALL have a stable and unique identifier so it can be referenced from the UI and from documentation.

#### Scenario: Reference a requirement
- **WHEN** a functional requirement is created
- **THEN** it receives a stable identifier (e.g., `FR-001`)
- **AND** that identifier can be used as a traceability link target
