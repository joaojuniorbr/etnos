<!--
Sync Impact Report
Version change: 1.1.0 -> 1.2.0
Modified principles:
- Principle 1 -> I. Specification Before Implementation
- Principle 2 -> II. Monorepo Contract Integrity
- Principle 3 -> III. Test Evidence Is Mandatory
- Principle 4 -> IV. Experience, Accessibility, and Performance Guardrails
- Principle 5 -> V. Observable, Secure, and Releasable Changes
Added sections:
- Technical Guardrails
- Delivery Workflow & Quality Gates
- Naming & File Conventions
Removed sections:
- None
Templates requiring updates:
- ✅ updated /Users/joaojunior/WORK/etnos/.specify/templates/plan-template.md
- ✅ updated /Users/joaojunior/WORK/etnos/.specify/templates/spec-template.md
- ✅ updated /Users/joaojunior/WORK/etnos/.specify/templates/tasks-template.md
- ✅ updated /Users/joaojunior/WORK/etnos/.gitignore
Follow-up TODOs:
- None
-->

# Etnos Constitution

## Core Principles

### I. Specification Before Implementation

Every meaningful product change MUST begin with a specification that explains the
user scenario, the intended outcome, acceptance criteria, and out-of-scope items
before code implementation starts. Plans and tasks MUST trace back to the spec,
and implementation MUST not silently expand scope beyond what was approved.

### II. Monorepo Contract Integrity

Changes MUST preserve explicit contracts between `apps/*` and `packages/*`.
When a feature touches shared types, API payloads, route behavior, game
configuration, or UI building blocks, the spec and plan MUST name each affected
boundary and define compatibility expectations. Cross-app reuse belongs in
shared packages when it reduces duplication without hiding business rules.

### III. Test Evidence Is Mandatory

Every behavior change MUST ship with test evidence at the right level: unit
tests for isolated logic, integration or API tests for contract and flow
changes, and end-to-end or UI verification for critical user journeys when the
risk justifies it. At minimum, contributors MUST run `yarn lint`,
`yarn check-types`, and the relevant targeted tests before considering work
complete. Code changed by a feature MUST maintain 100% coverage for the
applicable configured metrics in the touched scope, and any missing automated
coverage blocks completion. A feature is not done when it only "works locally
once".

### IV. Experience, Accessibility, and Performance Guardrails

Student, admin, web, and game experiences MUST remain understandable,
responsive, and accessible on supported devices. Specifications for user-facing
changes MUST state loading, empty, and error states, and MUST preserve keyboard
access, semantic structure, and clear feedback. New work MUST avoid avoidable
performance regressions in game rendering, page transitions, and API-backed
screens.

### V. Observable, Secure, and Releasable Changes

Changes MUST be diagnosable, safe, and ready to release through the existing
monorepo workflow. Features affecting authentication, authorization, personal
data, scoring, or admin operations MUST document risks and validation steps.
Behavior that can fail in production MUST expose actionable logging, monitoring,
or debug signals, and all changes MUST keep the repository releasable through
the existing semantic-release process.

## Technical Guardrails

The default stack for this repository is Node.js, Yarn workspaces, and Turborepo,
with Next.js and React on the frontend, NestJS on the backend, Prisma for data
access, and shared packages for reusable UI, configuration, tooling, and types.
New tooling or packages SHOULD be introduced only when they solve a recurring
problem that existing workspace capabilities cannot cover cleanly.

Feature specifications and plans MUST identify:

- the affected apps and packages;
- the source of truth for data and validation;
- environment or secret dependencies;
- migration or rollout requirements when behavior changes existing flows.

Implementation SHOULD prefer extending existing packages and conventions over
creating parallel abstractions. If a new shared module is introduced, its
ownership, reuse target, and test surface MUST be explicit in the plan.

## Naming & File Conventions

File and symbol names MUST follow repository conventions consistently across new
work and touched files. React hooks MUST use `camelCase` file names beginning
with `use`, such as `useScoreHistory.ts`. React components MUST use
`PascalCase` file names and exported component names. Shared utility modules and
non-component helpers MUST follow the prevailing convention of their local
module, but a feature MUST not introduce mixed naming styles within the same
directory.

When a feature touches code that violates these conventions, the plan SHOULD
either normalize the touched files in the same change or explicitly justify why
the inconsistency is being deferred.

## Delivery Workflow & Quality Gates

The standard delivery flow is:

1. `/speckit.constitution` for project rules when those rules evolve.
2. `/speckit.specify` to define the feature in user and product terms.
3. `/speckit.plan` to choose the technical approach, affected paths, and risk
   controls.
4. `/speckit.tasks` to generate independently testable implementation slices.
5. `/speckit.implement` only after the earlier artifacts are coherent.

Each plan MUST include a constitution check covering contract impact, test
strategy, user experience states, and operational or security concerns. Each
task list MUST be organized so that the highest-priority user story can be
implemented and validated independently.

Before merge or release candidate approval, contributors MUST confirm:

- documentation or specs are updated when behavior or contracts changed;
- `yarn lint` and `yarn check-types` pass;
- relevant automated tests pass for touched areas;
- changed code satisfies the project's 100% coverage expectation for the
  applicable configured metrics;
- manual verification steps are recorded for flows not fully covered by tests.

## Governance

This constitution overrides ad hoc implementation habits for the Etnos
repository. Any amendment MUST be reflected in this file and in dependent Spec
Kit templates during the same change. Versioning follows semantic intent:
MAJOR for incompatible governance shifts, MINOR for new principles or mandatory
sections, and PATCH for clarifications that do not change obligations.

All feature plans, task lists, reviews, and implementation decisions MUST cite
or comply with these principles. Complexity that violates a principle requires a
written justification in the implementation plan, along with the simpler option
that was rejected and why it was insufficient.

**Version**: 1.2.0 | **Ratified**: 2026-04-02 | **Last Amended**: 2026-04-02
