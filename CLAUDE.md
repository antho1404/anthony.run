# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `npm run build` - Build the Next.js application
- Dev: `npm run dev` - Start development server with turbopack
- Lint: `npm run lint` - Run ESLint to verify code quality
- Start: `npm run start` - Run the production build

## Code Style
- Follow TypeScript best practices with strict typing (avoid `any`, use interfaces)
- Use functional React components with hooks (avoid class components)
- Follow file organization patterns in existing code
- Import order: React, external libraries, internal modules (@/), relative imports
- Use descriptive variable/function names (camelCase for variables, PascalCase for components)
- Handle errors with try/catch blocks and display appropriate user feedback
- Use Tailwind CSS for styling following shadcn/ui component patterns
- Implement proper data validation at component and API boundaries
- Follow accessibility best practices (semantic HTML, ARIA attributes)

## Development Guidelines
- Keep functions small, focused and pure when possible
- Follow React's unidirectional data flow pattern
- Maintain consistent indentation and spacing
- Run linting before considering code complete
- Use ES6+ syntax patterns throughout the codebase
- Document complex logic and architecture decisions