# Coding Guidelines

This document summarizes the coding style and quality principles for the TODO app. The goal is to keep the codebase readable, consistent, and easy to evolve as features are added over time.

## React and TypeScript Standards

Use modern React patterns with function components and hooks. Prefer explicit, well-named props and strongly typed component contracts so behavior is clear at call sites.

- Use TypeScript for all new frontend code.
- Avoid `any`; prefer specific types, interfaces, and utility types.
- Keep components focused on a single responsibility.
- Lift shared state only when needed, and keep local state close to where it is used.
- Extract reusable logic into custom hooks when it improves clarity.

## Formatting and Naming Conventions

Consistent formatting reduces cognitive load and makes code reviews faster.

- Use a consistent formatter configuration across the project.
- Keep line length readable and avoid dense, nested expressions.
- Use descriptive names for variables, functions, components, and files.
- Use `PascalCase` for React components and type names.
- Use `camelCase` for variables, functions, props, and hooks.
- Prefix custom hooks with `use`.
- Use clear boolean names such as `isLoading`, `hasError`, and `canSubmit`.

## Import Organization

Organize imports in a predictable order so dependencies are easy to scan.

- Group imports by category:
  - External packages
  - Internal modules (absolute or alias paths)
  - Relative imports
  - Styles and assets
- Separate groups with a blank line.
- Prefer named exports for shared utilities and components.
- Remove unused imports and avoid circular dependencies.

## Code Quality Principles

High-quality code is maintainable, testable, and intentional.

- Keep functions small and focused.
- Favor composition over duplication.
- Handle errors explicitly and provide actionable error messages.
- Avoid deeply nested conditionals; return early when practical.
- Document non-obvious decisions with concise comments.
- Write and maintain tests for new behavior and bug fixes.
- Refactor opportunistically when touching confusing or fragile code.

## Linting Recommendation

Use a linter to enforce consistency and catch common issues early.

- Use ESLint with React and TypeScript rules enabled.
- Enable import/order rules to keep import structure consistent.
- Treat lint warnings as actionable and resolve them before merging.
- Run lint checks in CI so quality gates are automated.

Following these guidelines will improve readability, reduce regressions, and keep development velocity high as the project grows.