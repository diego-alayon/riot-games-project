# Spec Delta

## Purpose

Links UI functionalities to their justifying functional requirements and enables bidirectional navigation between requirements, documentation, and components.

## ADDED Requirements

### Requirement: Traceability label on UI functionality
Each functionality created in a prototype's frontend SHALL carry a label that links it to a functional requirement from the corresponding initiative.

#### Scenario: Login linked to its requirement
- **WHEN** the user creates the login functionality in Riftbound Ticketing Portal
- **THEN** it is assigned a label pointing to the functional requirement written in the initiative
- **AND** the label is visible next to the functionality

#### Scenario: No orphan functionality without requirement
- **WHEN** a UI functionality is created without an associated requirement
- **THEN** the system requests or marks the lack of a linked requirement

### Requirement: Links from requirement to documentation and components
A functional requirement SHALL be able to link to components and to `Architecture` and `Infrastructure` documentation.

#### Scenario: Requirement with cross-documentation
- **WHEN** a functional requirement is linked to an `Architecture` or `Infrastructure` document
- **THEN** the link is recorded and navigable in both directions

### Requirement: Link mechanism and requirements catalog
The system SHALL expose a navigable requirements catalog with bidirectional navigation from the UI, following the pattern from the Riftbound Backoffice example (see design.md).

#### Scenario: Jump from UI to requirement
- **WHEN** the user clicks on the `FR-…` label of a UI functionality
- **THEN** the requirements catalog opens filtered by that code

#### Scenario: Link back from catalog
- **WHEN** the user consults a requirement in the catalog that is represented in a prototype
- **THEN** they can navigate back to the prototype view where that requirement lives
- **AND** if it is not represented, the catalog explicitly indicates it

#### Scenario: Show or hide traceability labels
- **WHEN** the user activates or deactivates the "requirement links" toggle
- **THEN** all `FR-…` labels in the UI are shown or hidden at once
