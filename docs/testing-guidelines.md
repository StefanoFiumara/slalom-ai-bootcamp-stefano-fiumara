# Testing Guidelines

This document describes the testing principles and conventions for the TODO app.

All new features must include appropriate tests. Tests must be isolated, independent, and succeed on multiple runs.

---

## Unit Tests

- Write unit tests to verify individual functions and React components in isolation.
- **Naming convention:** `*.test.ts`
- **Backend unit tests:** `packages/backend/__tests__/`
- **Frontend unit tests:** `packages/frontend/src/__tests__/`
- Name test files after the module or component they test (e.g., `taskService.test.ts`, `TaskList.test.ts`).

---

## Integration Tests

- Use **Jest** + **Supertest** to test backend API endpoints with real HTTP requests.
- **Naming convention:** `*.test.ts` (same as unit tests)
- **Integration tests:** `packages/backend/__tests__/integration/`
- Name test files after the endpoint or feature being tested (e.g., `tasks.test.ts`).

### Port Configuration

Always use environment variables with sensible defaults for port configuration:

- **Backend:** `const PORT = process.env.PORT || 3030;`
- **Frontend:** React's default port is `3000`, but can be overridden with the `PORT` environment variable.

This allows CI/CD workflows to dynamically detect ports.

---

## End-to-End (E2E) Tests

- Use **Playwright** to test complete UI workflows through browser automation.
- **E2E tests:** `tests/e2e/`
- **Naming convention:** `*.spec.ts` — name files after the user journey they test (e.g., `add-task.spec.ts`, `complete-task.spec.ts`).

### Rules

- Tests must use **one browser only**.
- Follow the **Page Object Model (POM)** pattern for maintainability.
- Limit E2E tests to **5–8 critical user journeys** — focus on happy paths and key edge cases, not exhaustive coverage.

---

## General Rules

- **All tests must be isolated and independent** — each test sets up its own data and does not rely on other tests.
- **Setup and teardown hooks are required** — use `beforeEach`/`afterEach` (or Playwright's equivalents) to ensure tests pass on multiple runs.
- Tests should be maintainable and follow best practices for the relevant testing framework.
