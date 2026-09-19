# Spec Delta

## Purpose

Manages design systems independently for each prototype while keeping the host application's Linear design system isolated.

## ADDED Requirements

### Requirement: Independent design system per prototype
The registry SHALL allow each prototype to declare and edit its own design system, independent of the host application's (Linear).

#### Scenario: Prototype with independent design system
- **WHEN** a prototype's design system is defined
- **THEN** that system applies only to that prototype
- **AND** it does not inherit or overwrite the shell's Linear design system

#### Scenario: Isolation from the shell
- **WHEN** a prototype's design system is modified
- **THEN** the application shell continues rendering with Linear tokens
