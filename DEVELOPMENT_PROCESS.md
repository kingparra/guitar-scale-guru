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
When you stage your files and run `git commit`, the pre-commit hook will automatically trigger. It will run `lint-staged`, which in turn will execute ESLint on all staged `.ts` and `.tsx` files.

-   If the linter finds any errors, **the commit will be automatically aborted.**
-   You must fix the reported errors and re-stage the files before you can successfully commit.

This automated process ensures that every commit that enters the repository has already passed our quality standards, preventing syntax errors and enforcing a consistent code style.

### **Manual Checks**
You can, and should, still run the linter and tests manually as you work to get faster feedback:
-   **Lint all files**: `npm run lint`
-   **Run all tests**: `npm test`

---

## 4. Continuous Integration (CI)

In a standard repository hosted on a platform like GitHub, a CI pipeline would be configured to run `npm run lint` and `npm run test` on every push and pull request. This serves as a final, server-side quality gate, ensuring that the main branch always remains stable and bug-free.