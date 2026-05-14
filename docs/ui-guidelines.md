# UI Guidelines

This document describes the UI guidelines for the TODO app.

## Component Library

- All UI components must use [Material UI (MUI)](https://mui.com/) — do not introduce custom or third-party component libraries unless a required component is not available in MUI.
- Use MUI components such as `Button`, `TextField`, `Checkbox`, `IconButton`, `List`, `Dialog`, and `DatePicker` where applicable.

## Color Theme

- Use the default Material UI color theme (primary: blue, secondary: pink).
- Dark mode must be enabled by default using MUI's `createTheme` with `palette.mode: 'dark'`.
- Allow users to toggle between dark and light mode if desired, but dark mode is the initial default.

## Accessibility (WCAG)

- All UI must conform to [WCAG 2.2](https://www.w3.org/TR/WCAG22/) at **Level AA** as a minimum.
- Key requirements:
  - All interactive elements must be keyboard-navigable and focusable.
  - All images and icons must have descriptive `alt` text or `aria-label` attributes.
  - Color alone must not be used to convey information (e.g., use icons or text in addition to color for status indicators).
  - Text must maintain a minimum contrast ratio of **4.5:1** for normal text and **3:1** for large text against background colors.
  - Form inputs must have visible, associated labels.
  - Error messages must be programmatically associated with the relevant input using `aria-describedby`.
  - Dynamic content updates (e.g., task added/removed) must be announced to screen readers using ARIA live regions.
