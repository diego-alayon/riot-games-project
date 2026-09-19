# Spec Delta

## Purpose

Provides the application shell, root navigation structure, and Linear design system adoption for the Riot-Games-Project platform.

## ADDED Requirements

### Requirement: Adoption of Linear design system
The application host SHALL render all its shell and surfaces using the Linear design system tokens (canvas `#010102`, single lavender accent `#5e6ad2`, surface scale `#0f1011`–`#191a1b`, hairlines, typography with negative tracking).

#### Scenario: Surfaces without shadows
- **WHEN** the shell displays elevated cards or panels
- **THEN** hierarchy is expressed with the surface scale and 1px hairlines
- **AND** shadows and a second chromatic color are not used

#### Scenario: Restricted accent usage
- **WHEN** the lavender accent `#5e6ad2` is rendered
- **THEN** it only appears in the brand, focus ring, and a single primary CTA per section

### Requirement: Canonical navigation structure
The shell SHALL expose, under the `Riot-Games-Project` root, two root-level main modules: `Applications` and `Product`. This structure SHALL be the reference navigation pattern of the application.

#### Scenario: Main modules
- **WHEN** the user opens the application
- **THEN** they see `Riot-Games-Project` as root with the `Applications` and `Product` modules
- **AND** they can navigate to either from the main navigation

#### Scenario: Applications content
- **WHEN** the user opens `Applications`
- **THEN** it lists the project applications (Riftbound Ticketing Portal and OneVenue Backoffice)

#### Scenario: Product content
- **WHEN** the user opens `Product`
- **THEN** they see the `Architecture`, `Infrastructure`, `Initiatives`, and `Core` sections
