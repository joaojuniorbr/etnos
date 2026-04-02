# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js >= 18  
**Primary Dependencies**: Next.js, React 19, NestJS, Prisma, Tailwind CSS,
Ant Design, Turborepo  
**Storage**: Prisma-managed database plus Firebase/Auth-related external
services when applicable  
**Testing**: Vitest, Testing Library, Jest, Playwright, plus repository gates
`yarn lint` and `yarn check-types`; changed code must reach 100% coverage in
the applicable configured metrics  
**Target Platform**: Web applications, shared React game library, and Node API  
**Project Type**: Turborepo monorepo with multiple apps and shared packages  
**Performance Goals**: Preserve responsive gameplay and page interactions; note
feature-specific latency or rendering targets when relevant  
**Constraints**: Preserve cross-app contracts, document loading/empty/error
states, avoid avoidable regressions in accessibility and auth-sensitive flows  
**Scale/Scope**: Multi-application educational platform with shared UI, tools,
types, and game logic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] Spec-first scope is clear, approved, and limited to explicit user outcomes.
- [ ] Affected contracts between `apps/*`, `packages/*`, and API payloads are
      identified with compatibility expectations.
- [ ] Test evidence is defined, including `yarn lint`, `yarn check-types`, and
      the targeted automated tests needed for the touched behavior.
- [ ] The plan explains how changed code will achieve and verify 100% coverage
      for the applicable configured metrics.
- [ ] User-facing loading, empty, error, accessibility, and performance impacts
      are explicitly addressed.
- [ ] Operational, security, and release considerations are documented for any
      auth, admin, analytics, score, or data-sensitive changes.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/
├── admin/      # Next.js admin application
├── api/        # NestJS API
├── docs/       # Storybook / component documentation
├── games/      # Shared React game implementations
├── student/    # Student-facing application
└── web/        # Institutional/public website

packages/
├── eslint-config/
├── tailwind-config/
├── tools/      # Shared client/tooling utilities
├── types/      # Shared TypeScript contracts
├── typescript-config/
└── ui/         # Shared UI primitives and components
```

**Structure Decision**: Choose the real `apps/*` and `packages/*` paths touched
by the feature and keep the plan focused on those boundaries only.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
