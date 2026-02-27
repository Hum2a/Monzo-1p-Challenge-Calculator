# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- (Add new changes here)

## [v0.1.1] - 2026-02-27

### Added

- Update layout and authentication pages with new images and icons

### Changed

- Improve CHANGELOG.md update process with intelligent categorization and concise...

### Miscellaneous

- Update .gitignore to include Python-related files and directories


## [v0.1.0] - 2026-02-27

### Other

- Update README.md to reflect new GitHub repository owner and remove outdated instructions. This change ensures accurate branding and improves clarity for users setting up the project.
- Update package.json and README.md to streamline Cloudflare Workers build process
- Enhance README.md with troubleshooting steps for magic link authentication and update GitHub Actions to upload runtime secrets for Cloudflare Workers. This improves deployment clarity and ensures necessary environment variables are set for successful authentication.
- Initialize project with package.json and package-lock.json files, including dependencies and scripts for development, testing, and deployment.
- Update README.md with troubleshooting guidance for Cloudflare Workers output directory issue
- Update package dependencies and README for Cloudflare Workers
- Refactor deployment script to improve secret upload process
- Add production environment variable template and deployment script
- Implement sliding tab indicator and animation for tab transitions in the Calculator component. Updated Tabs and TabsList components to support sliding animations based on tab selection. Enhanced accessibility with appropriate ARIA attributes and improved visual feedback for tab interactions.
- Update README.md with revised Cloudflare Workers build instructions and deployment commands for improved clarity and accuracy.
- Add postinstall script to package.json for Prisma generation
- Remove Playwright report files to streamline project structure and eliminate unnecessary artifacts. This includes the deletion of index.html and associated markdown data files.
- Update .gitattributes to exclude specific files from GitHub language stats. Added rules to prevent package-lock.json, *.lock files, and test result directories from skewing language statistics.
- Enhance UI animations and transitions across components. Added keyframe animations for fade-in, slide, and scale effects in globals.css. Updated header, main, footer, and Calculator component to utilize these animations for improved user experience. Enhanced accessibility and visual feedback with transition effects on various UI elements, including buttons, inputs, and accordions.
- Add release management script and changelog updater
- Enhance Calculator component to manage day input state more effectively. Introduced a local state for day input display, synchronized with firstDayOffset. Updated logic to ensure effectiveDayOffset is used consistently throughout calculations. Improved input handling for day selection, ensuring accessibility and user experience.
- Update import path in next-env.d.ts to reference development types for routes
- Bump eslint from 9.39.3 to 10.0.2
- Refactor icon generation script to use ES modules. Remove the old CommonJS script and ensure compatibility with modern JavaScript standards. Update middleware to remove unused request parameter. Simplify Calculator component by removing unnecessary session status. Update InputProps type definition for clarity.
- Implement Cloudflare Workers optimization by replacing @vercel/og with a stub to reduce bundle size. Update deployment scripts and README to reflect changes. Add new scripts for og-stub and replacement process.
- Bump react-dom from 19.2.3 to 19.2.4
- Bump prisma from 6.19.2 to 7.4.2
- Bump @prisma/client from 6.19.2 to 7.4.2
- Bump @types/node from 20.19.35 to 25.3.2
- Bump @neondatabase/serverless from 0.10.4 to 1.0.2
- Bump react from 19.2.3 to 19.2.4
- Add pull request template to standardize PR submissions. This template includes sections for description, type of change, related issues, and a checklist to ensure code quality and adherence to project standards.
- Update dependabot configuration to use labels for dependency management instead of groups, streamlining the update process.
- Add SECURITY.md to outline the project's security policy, including supported versions, vulnerability reporting procedures, and key security concerns. Update dependabot configuration to simplify dependency management with labels instead of groups.
- Update README to include project badges, enhance features section, and clarify project structure. Add contributing and changelog sections for better documentation and community engagement.
- Add LICENSE file to define project licensing under the MIT License. This inclusion clarifies usage rights and responsibilities for users and contributors, ensuring compliance and legal clarity.
- Add CONTRIBUTING.md to provide guidelines for project contributions. This document outlines the setup process, development workflow, pull request process, and code standards, ensuring a clear and consistent approach for contributors.
- Add CODE_OF_CONDUCT.md to establish community guidelines for respectful and inclusive participation. This document outlines our pledge, standards of behavior, and enforcement policies, promoting a positive environment for all contributors.
- Add CHANGELOG.md to document project updates and notable changes. This file follows the Keep a Changelog format and includes the initial version 0.1.0 with key features and enhancements, ensuring better tracking of project evolution.
- Add bug report template for GitHub issues. This template helps users clearly describe bugs, including steps to reproduce, expected and actual behavior, and relevant environment details, enhancing issue tracking and resolution.
- Add issue template for general issues in GitHub. This template encourages users to provide a description of their issue or request, ensuring better clarity and communication for problem resolution.
- Add feature request template for GitHub issues. This template guides users in submitting feature suggestions, ensuring clear communication of problems, proposed solutions, and additional context.
- Update README with project badges, features, and structure. Add CI workflow for linting, type-checking, and testing. Modify Dependabot configuration for improved dependency management.
- Add VSCode extensions recommendations for improved development experience. This file suggests essential tools for Prisma, ESLint, Tailwind CSS, Prettier, and Playwright, promoting consistency and efficiency in the coding environment.
- Add .node-version and .nvmrc files to specify Node.js version 22. This ensures consistent development environments across team members and deployment platforms.
- Add .gitattributes for text file normalization and binary file handling. This file ensures consistent line endings and explicitly defines text and binary file types, promoting better collaboration across different operating systems.
- Add .editorconfig for consistent coding styles across the project. This file establishes rules for whitespace, indentation, and end-of-line handling, promoting uniformity in code formatting.
- Update README to include instructions for local Cloudflare preview and clarify deployment steps. Added details on using .dev.vars for secrets and improved organization of deployment options for better clarity.
- Add .dev.vars to .gitignore to exclude local development variable files. This change prevents accidental commits of environment-specific configurations, maintaining repository cleanliness.
- Add example environment variables for local development. This file provides a template for secrets needed to run the application locally with Cloudflare Workers, ensuring sensitive information is not committed to the repository.
- Enhance deployment documentation and add GitHub Actions workflow for Cloudflare. The README now includes notes on deploying from Windows and detailed steps for using GitHub Actions, while the new workflow automates deployment to Cloudflare, addressing WASM path issues on Windows.
- Add in-memory rate limiter for API routes in rate-limit.ts. This implementation restricts requests to 20 per 60 seconds per IP for specific endpoints, enhancing API security and performance. Cleanup of stale entries is also included for efficient memory management.
- Add Prisma client setup for Neon PostgreSQL in db.ts. This file initializes the Prisma client and ensures it is not used in the browser, enhancing database interaction and maintaining environment-specific configurations.
- Refactor middleware to integrate authentication and enhance security headers. Update Content Security Policy to allow HTTPS connections for resources. This change improves session management and security compliance.
- Add authentication configuration using NextAuth with Resend provider. Implement middleware for security headers and session management. Ensure proper integration with Prisma adapter for database sessions.
- Wrap application in SessionProvider for NextAuth session management. Update layout to ensure proper context for child components and maintain accessibility standards.
- Add Open Next configuration for Cloudflare deployment. This file sets up the necessary configuration for integrating with Cloudflare, enhancing deployment management for the application.
- Add next-env.d.ts for TypeScript support in Next.js project. This file provides necessary type references for Next.js and should not be edited directly.
- Add strict validation for saved state object using Zod in validation.ts. Introduce savedStateSchema to ensure proper structure for state management.
- Add API routes for saving, retrieving, and deleting user states. Implement rate limiting and Zod validation for input handling. Ensure authentication checks for user actions and maintain error handling for improved reliability.
- Add AuthButton to Home page for user authentication. Update navigation layout for improved accessibility and mobile responsiveness.
- Add SessionProvider component for NextAuth session management. This component wraps children with NextAuth's SessionProvider, facilitating user authentication across the application.
- Add authentication pages: AuthError, SignIn, and Verify. Implement user-friendly error handling and magic link sign-in functionality. Ensure accessibility and mobile-first design in UI components.
- Implement save and load functionality for user states in Calculator component. Integrate session management with NextAuth to fetch and store saved states, ensuring UI accessibility with appropriate labels. Update state management and handle loading states for improved user experience.
- Add AuthButton component for user authentication in 1p Challenge Calculator. Implement session management with NextAuth, providing sign-in and sign-out functionality. Ensure loading state is handled and UI is accessible with appropriate labels.
- Add wrangler configuration for Cloudflare deployment in 1p Challenge Calculator. Define project name, main entry point, compatibility date, and asset directory for improved deployment management.
- Update README to reflect Cloudflare deployment setup, environment variables, and enhanced security practices for the 1p Challenge Calculator. Include detailed sections on project structure, math calculations, and features.
- Update package dependencies and scripts for 1p Challenge Calculator. Added support for Cloudflare deployment, Prisma commands, and new libraries for authentication and database management.
- Add Prisma schema for user authentication and saved calculator state in 1p Challenge Calculator. Define models for User, Account, Session, VerificationToken, Authenticator, and SavedState to support user data management and persistence.
- Add backend, database, deployment, design, frontend, middleware, schema, and security rules documentation for 1p Challenge Calculator. Establish conventions for API routes, database schema, deployment processes, UI design, and security practices to ensure consistency and maintainability across the codebase.
- Add .env.example file for environment variable configuration in 1p Challenge Calculator
- Update .gitignore to enhance file management by adding entries for testing, build outputs, and environment files. Organize sections for clarity and ensure proper exclusion of sensitive and unnecessary files.
- Update styles and layout for Monzo branding in 1p Challenge Calculator. Refactor global CSS with new color scheme, enhance accessibility in UI components, and adjust layout for improved mobile experience. Update manifest for branding consistency.
- Refactor Next.js configuration, add global styles, and implement layout and pages for the 1p Challenge Calculator. Updated README for route structure. Introduced mobile-first design and accessible UI components.
- Set up 1p Challenge Calculator with initial configuration, UI components, and testing framework. Added Playwright for E2E testing, updated README, and established security headers. Implemented mobile-first design and accessible UI components.
- Init


## [0.1.0] - 2025-02-27

### Added

- 1p Challenge Calculator with three modes: Next N days, Month, Custom range
- Monzo-inspired UI, mobile-first design
- Anonymous mode with localStorage
- Account mode with magic link auth (Auth.js, Resend)
- Save/Load up to 10 states per user (Neon PostgreSQL, Prisma)
- PWA support – installable on mobile
- Cloudflare Workers deployment via OpenNext
- GitHub Actions workflow for deploy
- Zod validation, rate limiting, security headers
