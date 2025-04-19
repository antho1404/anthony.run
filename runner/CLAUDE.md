# CLAUDE Instructions

## General Principles
- Write clean, maintainable code with consistent style
- Follow SOLID principles and design patterns
- Keep functions small, focused, and pure when possible
- Optimize for readability first, then performance
- Use descriptive variable and function names
- Avoid global state and side effects

## TypeScript Best Practices
- Use strong typing: avoid `any` and prefer explicit types
- Leverage TypeScript's type system for safety
- Define interfaces for component props
- Use generics to create reusable, type-safe components
- Minimize type assertions (`as`)
- Apply strict null checking

## React Guidelines
- Prefer functional components with hooks
- Keep components small and focused
- Use custom hooks to share stateful logic
- Follow React's unidirectional data flow pattern
- Memoize callbacks and expensive computations
- Avoid prop drilling with context when appropriate

## Linting and Formatting
- IMPORTANT: YOU MUST run `npm run lint` to verify code quality BEFORE committing any changes
- If the project has other linting commands (like `npm run typecheck`), run those as well
- Check for the existence of linting commands in package.json and run ALL that are available
- If linting fails, fix the issues before committing
- If the project doesn't have linting commands, notify the user in your PR description
- Follow Next.js ESLint core web vitals and TypeScript configuration
- Use proper TypeScript types and avoid type errors
- Maintain consistent indentation and spacing
- Avoid eslint warnings and errors by adhering to project conventions
- Follow modern ES6+ syntax patterns as used throughout the codebase
- Respect the component styling patterns used with tailwindcss
- Ensure all code passes linting before considering it complete

## Testing Framework
- Write comprehensive unit tests for business logic
- Test components in isolation with rendering tests
- Mock external dependencies and services
- Focus on behavior, not implementation details
- Maintain high test coverage for critical paths

## Security Considerations
- Sanitize user inputs
- Validate data at component and API boundaries
- Implement proper authentication and authorization
- Avoid storing sensitive information in client-side code
- Handle errors gracefully without exposing internals

## Performance Optimization
- Minimize bundle size with code splitting
- Optimize render performance with memoization
- Implement proper caching strategies
- Lazy load components and assets when appropriate
- Prioritize critical rendering path

## Error Handling
- Use consistent error handling patterns
- Log meaningful error messages
- Include contextual information in errors
- Implement graceful degradation
- Avoid silent failures

## Accessibility
- Follow WCAG guidelines
- Use semantic HTML elements
- Provide proper ARIA attributes
- Ensure keyboard navigation
- Support screen readers

## Code Organization
- Follow a consistent file/folder structure
- Group related functionality together
- Separate concerns appropriately
- Create clear boundaries between modules
- Document architecture decisions

## GitHub Workflow Best Practices
- CRITICAL: Always run linting before committing changes
- Detect available lint commands in package.json and run ALL of them
- Fix any linting errors before creating a commit
- If linting fails but you cannot fix some issues, document them in the PR description
- Write clear, descriptive commit messages
- Create focused pull requests with single responsibility
- Include detailed PR descriptions explaining changes
- Link issues in commit messages and PRs
- Keep PRs small and manageable for easier review
- Request appropriate reviewers with domain knowledge
- Add relevant labels and milestones to issues and PRs
- Use draft PRs for work in progress
- Address review comments promptly and thoroughly
- Squash commits before merging when appropriate