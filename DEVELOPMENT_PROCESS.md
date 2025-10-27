# Development Process & Philosophy

This document outlines the development process, coding philosophy, and tooling standards for the Guitar Scale Guru project. Our goal is to ensure a high-quality, stable, and maintainable codebase by adopting professional, modern development practices.

This is a living document and should be updated as our process evolves.

---

## 1. Core Philosophy

### "Tidy First?" - Kent Beck

We subscribe to the "Tidy First?" methodology. Before adding new functionality or fixing a bug, we first ask if the existing code can be made cleaner. This could involve renaming a variable, extracting a function, or improving a comment. A small tidying session makes the subsequent change easier and safer to implement. We always strive to leave the code cleaner than we found it.

### Automation is Non-Negotiable

Errors caught by automated tools before a commit are infinitely cheaper to fix than bugs found by users. We rely heavily on our toolchain to catch syntax errors, logical issues, and stylistic inconsistencies automatically. **Code that does not pass our automated checks will not be committed.**

### Logic in Hooks, UI in Components

We adhere to a strict separation of concerns.
-   **React Components (`/components`)**: Are responsible for rendering UI and handling user events. They should be as "dumb" as possible, containing minimal logic.
-   **Custom Hooks (`/hooks`)**: Contain all business logic, state management, and side effects (like API calls). This makes our logic reusable, testable in isolation, and decoupled from the presentation layer.

---

## 2. Our Toolchain

-   **TypeScript**: For static type safety.
-   **ESLint**: For identifying and fixing problems in code.
    -   **`eslint-plugin-security`**: Performs data-flow analysis to find common security vulnerabilities.
    -   **`eslint-plugin-sonarjs`**: Detects bugs and "code smells" like overly complex functions or duplicated logic.
-   **Prettier**: For automated code formatting.
-   **Jest & React Testing Library**: For unit and integration testing.
-   **Husky & Lint-Staged**: For automating pre-commit checks.

All tooling configuration is centralized in `package.json` for simplicity.

---

## 3. The Local Development Workflow (Automated)

To ensure that no buggy or improperly formatted code is ever committed, this project uses an automated pre-commit hook managed by Husky.

### **Step 1: Setup**
Upon cloning the repository for the first time, run `npm install`. This will not only install the project's dependencies but also execute the `prepare` script in `package.json`, which sets up Husky's git hooks.

```bash
npm install
```

### **Step 2: Code**
Implement your feature or bug fix.

### **Step 3: Commit**
When you stage your files and run `git commit`, the pre-commit hook will automatically trigger. It will run `lint-staged`, which in turn will execute ESLint (including our advanced static analysis plugins) on all staged `.ts` and `.tsx` files.

-   If the linter finds any errors, **the commit will be automatically aborted.**
-   You must fix the reported errors and re-stage the files before you can successfully commit.

This automated process ensures that every commit that enters the repository has already passed our quality standards, preventing syntax errors and enforcing a consistent code style.

### **Manual Checks**
You can, and should, still run the linter and tests manually as you work to get faster feedback:
-   **Lint all files**: `npm run lint`
-   **Run all tests**: `npm test`

---

## 4. UI & Visual QA Process

To prevent layout and styling bugs, the following checks are a mandatory part of the development process before committing new UI components or changes.

### **Container-Aware Testing**
When a component is designed, it must be tested within various container types. A common source of bugs is placing a component inside a flexbox or grid container that constrains its dimensions.
-   **Rule:** Before committing, render your component inside a fixed-width container and a flex container to ensure it behaves as expected and does not collapse or become unreadably small.

### **Responsive Design Checks**
All UI changes must be verified across a range of viewport sizes, from mobile to widescreen desktop.
-   Use your browser's developer tools to simulate different devices.
-   Ensure that text remains readable, clickable elements have adequate spacing, and layouts reflow gracefully without horizontal overflow.

### **Accessibility (a11y) Spot Checks**
While we have automated `jsx-a11y` checks, a manual review is still necessary.
-   Ensure all interactive elements can be navigated using the keyboard (`Tab` key).
-   Confirm that images have appropriate `alt` text and that color contrast meets WCAG AA standards.