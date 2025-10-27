# Guitar Scale Guru

An AI-powered, seven-string guitar scale generator with a polished, user-friendly interface. This application delivers in-depth theory, interactive diagrams, listening guides, classic licks, and practical exercises for guitarists of all levels. It also features a Notation Analyzer that can visually interpret uploaded sheet music or tablature to suggest relevant scales.

---

## Project Architecture & Organization

This codebase has been refactored to follow modern best practices for React development, emphasizing a clear separation of concerns, componentization, and testability.

### Key Architectural Patterns

1.  **100% Client-Side Diagram Generation**: For maximum performance, all diagrammatic information—including scale notes, fretboard positions, fingering patterns, and highlighting—is generated instantly and deterministically in the browser. The UI appears immediately, and the AI is only used for creative, text-based content that streams in asynchronously.

2.  **Logic in Hooks, UI in Components**: This is the core principle of the architecture. Components are responsible for rendering the UI and handling user events. All complex state management, API calls, and business logic are extracted into custom hooks (`useScaleGenerator`, `useNotationAnalyzer`).

3.  **Service Layer Abstraction**: All interactions with the Gemini API are handled within the `services` directory. This isolates external dependencies, making the system easier to test and maintain.

4.  **Componentization & Single Responsibility**: Large, complex components have been broken down into smaller, focused children (e.g., `PracticeSection` is composed of `KeyChordsSection`, `ToneAndGearSection`, etc.). This improves readability, reusability, and maintainability.

5.  **Polymorphism for Scalability**: The application uses polymorphic components (like `TabbedPracticeItem`) and data structures to handle different-but-similar types of data in a unified way. This reduces code duplication and makes it easier to add new types of content in the future.

---

## Development Setup & Best Practices

To ensure code quality and prevent common errors, this project is configured with a suite of modern development tools and a strict, automated development process.

**For a detailed guide on our coding philosophy, workflow, and quality gates, please see [DEVELOPMENT_PROCESS.md](./DEVELOPMENT_PROCESS.md).**

### Tooling & Configuration

All tooling configuration (ESLint, Prettier, Jest, Lint-Staged) is centralized in `package.json` to simplify the project structure.

### Automated Quality Gates

This project uses `husky` and `lint-staged` to create an automated `pre-commit` hook. This hook automatically runs the linter on all staged files before a commit is finalized. **Commits that fail the lint check will be automatically rejected.**

To install the hooks, run:
```bash
npm install
```

To manually run checks:
-   **Linting**: `npm run lint`
-   **Testing**: `npm test`