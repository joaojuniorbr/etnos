---
description: 'Task list template for feature implementation'
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include test tasks whenever behavior, contracts, shared logic, or
critical user journeys change. They are not optional when the constitution or
feature risk calls for evidence, and the final task list MUST make room to
prove 100% coverage for changed code in the touched scope.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Admin app**: `apps/admin/...`
- **API**: `apps/api/...`
- **Student app**: `apps/student/...`
- **Web app**: `apps/web/...`
- **Games library**: `apps/games/...`
- **Shared packages**: `packages/ui/...`, `packages/types/...`,
  `packages/tools/...`
- Use the real monorepo paths from `plan.md`; do not fall back to generic
  `src/` placeholders in the final task list.

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Setup database schema and migrations framework
- [ ] T005 [P] Implement authentication/authorization framework
- [ ] T006 [P] Setup API routing and middleware structure
- [ ] T007 Create base models/entities that all stories depend on
- [ ] T008 Configure error handling and logging infrastructure
- [ ] T009 Setup environment configuration management

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 ⚠️

> **NOTE**: Add these when the story changes behavior, contracts, or shared
> logic. Write them before implementation whenever feasible and confirm the
> relevant failure signal first.

- [ ] T010 [P] [US1] Add or update contract/integration coverage in the
      relevant app or package test path
- [ ] T011 [P] [US1] Add or update user-journey verification for the primary
      story when risk justifies it
- [ ] T012 [US1] Verify 100% coverage for changed code and close any gaps

### Implementation for User Story 1

- [ ] T013 [P] [US1] Update shared types, schemas, or UI contracts in the real
      touched paths
- [ ] T014 [P] [US1] Implement core behavior in the affected app/package files
- [ ] T015 [US1] Normalize touched filenames and exports to match project naming
      conventions
- [ ] T016 [US1] Wire the end-to-end user flow across all touched boundaries
- [ ] T017 [US1] Add validation plus loading/empty/error handling
- [ ] T018 [US1] Add observability, analytics, or debug signals as required
- [ ] T019 [US1] Document any migration, rollout, or manual verification step

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 ⚠️

- [ ] T019 [P] [US2] Add or update automated coverage for the story's changed
      contracts or logic
- [ ] T020 [P] [US2] Add or update user-flow verification for the impacted
      journey when appropriate
- [ ] T021 [US2] Verify 100% coverage for changed code and close any gaps

### Implementation for User Story 2

- [ ] T022 [P] [US2] Update the necessary shared contracts and domain logic in
      real repo paths
- [ ] T023 [US2] Normalize touched filenames and exports to match project naming
      conventions
- [ ] T024 [US2] Implement the story in the relevant app/package files
- [ ] T025 [US2] Integrate the story with upstream/downstream dependencies
- [ ] T026 [US2] Validate permissions, failure handling, and release notes

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 ⚠️

- [ ] T026 [P] [US3] Add or update automated verification for the touched
      behavior and contracts
- [ ] T027 [P] [US3] Add or update journey-level validation where risk is high
- [ ] T028 [US3] Verify 100% coverage for changed code and close any gaps

### Implementation for User Story 3

- [ ] T029 [P] [US3] Update shared artifacts required by the story
- [ ] T030 [US3] Normalize touched filenames and exports to match project naming
      conventions
- [ ] T031 [US3] Implement the story in the affected monorepo paths
- [ ] T032 [US3] Validate observability, UX states, and deployment readiness

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation, spec, or changelog updates in touched docs paths
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit/integration/e2e tests where residual risk remains
- [ ] TXXX Confirm coverage report remains at 100% for changed code
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation and repository gates

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests needed by the constitution or plan MUST exist before sign-off
- Coverage for changed code MUST be verified at 100% before sign-off
- Shared contracts before downstream integrations
- Core implementation before cross-app wiring
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Add or update automated coverage for the affected contract or flow"
Task: "Verify 100% coverage for the changed code path"

# Launch all models for User Story 1 together:
Task: "Update shared types or schemas in the touched package path"
Task: "Implement story behavior in the touched app path"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify required tests and repo gates pass before closing the story
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
