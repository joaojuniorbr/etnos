# Tasks: Student Score History

**Input**: Design documents from `/specs/001-student-score-history/`
**Prerequisites**: plan.md, spec.md

**Tests**: 100% test coverage is required for all new and modified code. Tests will be implemented alongside each user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify feature branch `001-student-score-history` is active and synced

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and shared contracts

- [x] T002 Create shared types for score history in `packages/types/src/games/score-history.ts`
- [x] T003 [P] Export score history types from `packages/types/src/games/index.ts` and `packages/types/src/index.ts`
- [x] T004 Implement `GameScoreHistoryService` wrapper in `apps/api/src/games/games.service.ts` or a new dedicated service to query `GameScoreHistory` table

**Checkpoint**: Foundation ready - API and Client can now use shared contracts

---

## Phase 3: User Story 1 - View Score History (Priority: P1) 🎯 MVP

**Goal**: Authenticated student can view their game score history list

**Independent Test**: Navigate to `/perfil/historico` and see a list of game scores (name, date, score) for the logged-in user.

### Tests for User Story 1 ⚠️

- [x] T005 [P] [US1] Add unit tests for history retrieval logic in `apps/api/src/games/games.service.spec.ts`
- [x] T006 [P] [US1] Add controller tests for the new history endpoint in `apps/api/src/games/games.controller.spec.ts`
- [x] T007 [US1] Verify 100% coverage for changed code in `apps/api/src/games`

### Implementation for User Story 1

- [x] T008 [P] [US1] Define `ScoreHistoryDto` in `apps/api/src/games/dto/score-history.dto.ts`
- [x] T009 [US1] Add `GET /games/history` endpoint to `GamesController` in `apps/api/src/games/games.controller.ts` using `ReqUser` for authentication
- [x] T010 [P] [US1] Create `useScoreHistory` hook in `apps/student/hooks/use-score-history.ts` to fetch data from the API
- [x] T011 [P] [US1] Implement `ScoreHistoryList` component in `apps/student/components/ScoreHistoryList.tsx` with loading, empty, and error states
- [x] T012 [US1] Create History page in `apps/student/app/perfil/historico/page.tsx` integrating the hook and list component
- [x] T013 [US1] Add a link to the History page in the student profile or navigation

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Filter History by Game (Priority: P2)

**Goal**: Student can filter their history list by a specific game

**Independent Test**: Select a game from the filter dropdown and confirm only records for that game are displayed.

### Tests for User Story 2 ⚠️

- [x] T014 [P] [US2] Add unit tests for filtered history retrieval in `apps/api/src/games/games.service.spec.ts`
- [x] T015 [US2] Verify 100% coverage for the new filtering logic

### Implementation for User Story 2

- [x] T016 [P] [US2] Update `GET /games/history` to accept an optional `gameSlug` query parameter
- [x] T017 [P] [US2] Implement filtering logic in the API service layer
- [x] T018 [P] [US2] Create `GameFilter` component in `apps/student/components/GameFilter.tsx`
- [x] T019 [US2] Integrate `GameFilter` into `apps/student/app/perfil/historico/page.tsx` and update the hook to support the filter state

**Checkpoint**: User Story 2 is functional and integrated.

---

## Phase 5: User Story 3 - Responsive Access (Priority: P2)

**Goal**: Ensure the history page is responsive across mobile and desktop devices

**Independent Test**: Resize browser to mobile width and verify that the table/list layout remains readable and navigable.

### Implementation for User Story 3

- [x] T020 [P] [US3] Refine `ScoreHistoryList` styling in `apps/student/components/ScoreHistoryList.tsx` using Tailwind responsive utilities (e.g., stacked layout on mobile)
- [x] T021 [US3] Verify accessibility (ARIA labels, keyboard navigation) for the history list and filter

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final quality checks and documentation

- [x] T022 [P] Run `yarn lint` across the monorepo and fix any issues
- [x] T023 [P] Run `yarn check-types` across the monorepo
- [x] T024 [P] Update API documentation if Swagger/OpenAPI is used in `apps/api`
- [x] T025 Final confirmation of 100% test coverage for all modified paths

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 2 (Foundational)**: BLOCKS all user stories as it defines the shared types.
- **Phase 3 (US1)**: Must be completed first as it provides the core data fetching and UI list.
- **Phase 4 (US2)** and **Phase 5 (US3)**: Can proceed in parallel after US1 is functional.

### Parallel Opportunities

- API implementation (`apps/api`) and Student App implementation (`apps/student`) can run in parallel for each story once shared types are defined.
- Unit tests for API and components can run in parallel with their respective implementations.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2 (Foundational Types & Service).
2. Complete Phase 3 (API Endpoint + Basic List UI).
3. **STOP and VALIDATE**: Verify the student can see their basic history.

### Incremental Delivery

1. Add filtering (US2) once the list is stable.
2. Polish responsiveness (US3) as the final UI refinement.
3. Continuous validation via `yarn lint`, `yarn check-types`, and coverage reports.
