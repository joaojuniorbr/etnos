# Feature Specification: Student Score History

**Feature Branch**: `001-student-score-history`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "Criar uma funcionalidade no app do estudante para exibir o histórico de pontuação por jogo. O aluno autenticado deve conseguir visualizar uma lista de partidas já realizadas, com nome do jogo, data/hora e pontuação obtida. A tela deve permitir filtrar por jogo, mostrar estados de carregamento, vazio e erro, e manter uma experiência responsiva em desktop e mobile. A API deve expor um endpoint para listar apenas o histórico do aluno autenticado. Os contratos compartilhados devem ficar centralizados no monorepo, preferencialmente em packages/types e/ou packages/tools se necessário. A solução deve preservar compatibilidade entre apps/api e apps/student, documentar qualquer impacto de contrato e exigir 100% de cobertura de testes para todo código alterado, além de passar em yarn lint e yarn check-types."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Score History (Priority: P1)

As an authenticated student, I want to view my past game scores so that I can track my progress over time.

**Why this priority**: This is the core functionality of the feature. Without the ability to see the history, the feature has no value.

**Independent Test**: Can be tested by logging in as a student with existing game records and navigating to the history page. The list should display game name, date/time, and score.

**Acceptance Scenarios**:

1. **Given** an authenticated student with game records, **When** they access the history page, **Then** they see a list of their games ordered by date (newest first).
2. **Given** an authenticated student, **When** the history list is loading, **Then** a loading indicator is displayed.
3. **Given** an authenticated student with no game records, **When** they access the history page, **Then** an informative "no records found" message is displayed.

---

### User Story 2 - Filter History by Game (Priority: P2)

As a student, I want to filter my score history by a specific game so that I can focus on my performance in that particular activity.

**Why this priority**: Improves usability as the number of recorded games grows.

**Independent Test**: Can be tested by selecting a game from the filter dropdown and verifying that only scores for that game are shown.

**Acceptance Scenarios**:

1. **Given** a list of scores for multiple games, **When** the student selects "Game A" from the filter, **Then** only scores for "Game A" are visible.
2. **Given** a filtered list, **When** the student clears the filter, **Then** all scores are visible again.

---

### User Story 3 - Responsive Access (Priority: P2)

As a student using various devices, I want the history page to be easy to read and navigate on both my phone and my computer.

**Why this priority**: Essential for the student demographic which often uses mobile devices for quick checks and desktops for focused study.

**Independent Test**: Can be tested by resizing the browser window or using mobile device emulation in dev tools.

**Acceptance Scenarios**:

1. **Given** a mobile device screen size, **When** viewing the history, **Then** the layout adjusts to fit the screen without horizontal scrolling.
2. **Given** a desktop screen size, **When** viewing the history, **Then** the layout utilizes the available space effectively.

---

### Edge Cases

- **API Failure**: If the endpoint fails, an error message with a "Retry" button should be displayed.
- **Session Expiry**: If the authentication token expires while viewing the list, the user should be redirected to the login page or prompted to re-authenticate.
- **Large History**: [NEEDS CLARIFICATION: Should the history be paginated or use infinite scroll?]
- **Incompatible Contracts**: If the API returns data in a format not expected by the student app, the UI should gracefully handle the error instead of crashing.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST implement an authenticated GET endpoint in `apps/api` to fetch the current student's score history.
- **FR-002**: The history endpoint MUST return: game name, timestamp (UTC), and score.
- **FR-003**: Shared data types for the API response MUST be defined in `packages/types`.
- **FR-004**: The `apps/student` UI MUST implement a dedicated page or section for "Score History".
- **FR-005**: The UI MUST include a filter control (e.g., dropdown) containing all games played by the student.
- **FR-006**: The system MUST handle loading, empty (no records), and error (network/API failure) states with appropriate UI components.
- **FR-007**: The solution MUST maintain 100% test coverage for all new or modified code in `apps/api`, `apps/student`, and `packages/types`.
- **FR-008**: The feature MUST pass all automated linting and type-checking (`yarn lint`, `yarn check-types`) across the monorepo.

### Key Entities

- **Score Record**: Represents a single completed game session for a student, including the game identity, the moment it happened, and the result obtained.
- **History Contract**: The interface defining the communication between `apps/api` and `apps/student`, centralized in `packages/types`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Authenticated students can successfully retrieve and view their score history in the mobile and desktop views of the student app.
- **SC-002**: Filtering results by game name takes effect immediately and correctly limits the displayed list.
- **SC-003**: 100% of lines/functions in the new/modified code are covered by unit or integration tests.
- **SC-004**: No regressions are introduced in existing student app functionality or API endpoints.
- **SC-005**: Documentation of any contract changes is added to the relevant packages or the `docs/` folder.

## Assumptions

- The existing authentication system provides a reliable way to identify the student in the API.
- Game names and scores are already persisted in the database or can be easily queried from existing tables.
- Standard UI components (loading spinners, error banners) from the project's UI library (if any) can be reused.
