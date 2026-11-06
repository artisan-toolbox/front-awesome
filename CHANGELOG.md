# Changelog

## [1.0.0-alpha.1] - 2026-11-06

### Features

- **Add Tailwind-backed shared theme and PrimeVue adapter** (`d2f2751`)
  Introduces a new shared theming foundation backed by Tailwind. The change adds a PrimeVue adapter layer to bridge PrimeVue theming with the shared Tailwind-based branding, and provides theme consumers so UI components can pull consistent theme tokens/styles from the shared theme system. User impact: improves visual consistency across the Front Awesome frontend by standardizing theme usage and enabling PrimeVue-based styling to follow the same theme source. Compatibility/migration: existing UI/theme integration points should switch to using the new theme consumer(s) and adapter approach; any custom styling that previously bypassed the shared theme may need to be updated to consume the shared theme instead.

- **Add Vue theme and button group components** (`ebd4ca6`)
  Adds Vue components for the theme system and a button group UI primitive. This includes the new theme-related component(s) that integrate with the shared theme foundation and a button group component to standardize grouped actions/controls. User impact: enables developers to compose themed UIs and consistent grouped button layouts without building these patterns from scratch. Compatibility/migration: projects can adopt these components directly; if prior implementations had bespoke button grouping/theme wrappers, they may be replaced or refactored to use the new components for consistency.

- **Add Laravel + Vue Web Awesome toast integration** (`a750256`)
  Implements a toast/notification integration that works with Laravel backends and Vue frontend usage (Web Awesome toast integration). User impact: provides a unified way to display notifications to users from Vue, powered by Laravel-related setup/integration patterns. Compatibility/migration: consuming apps should wire the new toast integration according to the added integration conventions; any existing toast library/config may need to be adjusted to avoid duplicate notification systems.

- **Manage README header with badges and logo** (`e35b8c9`)
  Adds functionality (or workflow/content handling) to manage the README header, including badges and a logo. Why it matters: improves maintainability and consistency of the project’s main visual/documentation header across releases. User impact: documentation experience improves; no code/API behavior is changed. Compatibility/migration: none for consumers of the library/runtime.

- **Initialize Front Awesome Laravel package** (`b154153`)
  Initializes the Front Awesome Laravel package, establishing the baseline package structure. Why it matters: provides the starting point for packaging and distributing Laravel-related capabilities that the project builds upon. User impact: enables installation/usage of the initial Laravel package artifacts and sets the stage for subsequent feature additions. Compatibility/migration: consumers should begin using the package via its initial published structure (per existing package conventions); no prior API guarantees exist since this is initialization.

### Documentation

- **Add Anthropic frontend design guidance for agents** (`f7e1fe1`)
  Adds documentation for agents/skills under agents/skills: includes Anthropic frontend design guidance. Why it matters: equips AI agents with clearer UI/design instructions, improving the quality and consistency of generated frontend outputs. User impact: documentation-only; no runtime/API behavior changes. Compatibility/migration: none.

- **Add Vue skill references and Inertia guidance** (`cf108c6`)
  Adds documentation for agents/skills covering Vue skill references and includes guidance related to Inertia (Vue) usage. Why it matters: provides agents with concrete references and integration expectations so implementations align with Front Awesome conventions. User impact: documentation-only; no runtime/API behavior changes. Compatibility/migration: none.

### Refactoring

- **Standardize README badges for release status, compat, and CI** (`1ed4592`)
  Refactors README badge presentation by standardizing badges related to release status, compatibility, and CI indicators. Why it matters: improves consistency and clarity for users and contributors when viewing project health and compatibility information. User impact: no runtime changes; documentation/readme quality improves. Compatibility/migration: none required for application code.

### Maintenance

- **Bump artisan-toolbox maintainer dependency** (`0d3af24`)
  Updates the maintainer dependency for artisan-toolbox. Why it matters: keeps the toolchain/developer dependencies current and aligned with upstream expectations. User impact: no production behavior change is implied, but contributor/development environments may change slightly due to the dependency update. Compatibility/migration: developers running the repo locally may need to re-install dependencies to match the bumped maintainer dependency.

## Unreleased

- Clarify preview installation and application build verification in the bundled consumer skill, and link to the migrated documentation routes.

- Preserve false button boolean bindings during initial custom element registration and SSR, including reactive loading and disabled states.

- Update documentation links and managed README badges to `https://atb.dev.br`, and use `contact@atb.dev.br` for public package contact metadata.

- Recognize Web Awesome custom elements automatically through the Vite plugin while preserving existing Vue custom element matchers and compiler options.
- Add opt-in Tailwind-backed Web Awesome branding, shared foundation tokens, class-based dark utilities, and targeted wa-page Preflight compatibility.
- Publish an application-owned branding stylesheet with `front-awesome-branding`, preserving edited files during ordinary republishing.
- Add an optional PrimeVue 4 styled-mode Aura adapter, production consumer checks, and a reviewed dependency and token inventory.

- Run the PHP unit suite and cover the mounted Vue theme controls in Chromium. Publish runtime coverage reports in CI.
- Compose optional button and group attributes from Vue and Web Awesome types, excluding internal fields and duplicate aliases.
- Export Vue components and their public types together from `@artisan-toolbox/front-awesome/components`.
- Add a Vue `ButtonGroup.vue` wrapper and use Web Awesome types for button and group attributes.
- Add an opt-in color mode manager to the Vue plugin and a `Theme.vue` component for custom light, dark, and system controls.
- Add a Laravel `Toast` facade and a browser toast initializer for Mosaicast events and Inertia session flash.
- Use a shared `WebAwesome\Variant` enum for standard Web Awesome variants in PHP.
- Start a toast factory with `Toast::brand()`, `Toast::success()`, `Toast::warning()`, `Toast::danger()`, or `Toast::neutral()`. Call `flash()` or `dispatch()` on the returned factory to send it.
- Add a Vue plugin that registers Mosaicast and starts the toast listener with application-supplied options.
- Add publishable toast icon defaults by variant for notifications sent from Laravel. Set a variant's default to `null` to disable it.
- Expose client-side toasts through `useToast()` and the Vue global `$frontAwesome.toast`.
- Share one toast stack across Vue apps and keep Mosaicast from registering again when an app remounts.
- Export the toast, icon, and placement types for consuming TypeScript applications. Reject invalid client toast options and surface Web Awesome failures to callers.
- Add a Vite plugin that selects the application's installed Web Awesome edition for Front Awesome imports.
- Align the Composer and JavaScript requirements on Mosaicast 1.1.1 or later within 1.x.
- Standardize README badges for release status, compatibility, CI, and documentation.
- Add the Laravel package, Composer-delivered Vue source, and the first Web Awesome button.
- Set up Inertia, Tailwind CSS, VueUse, and the Mosaicast dependencies for future frontend integrations.
- Add Maintainer quality checks, a Vite consumer fixture, and GitHub Actions for PHP and frontend validation.
- Report PHP and frontend execution coverage separately from PHP type coverage in CI.
- Manage the README header with Maintainer and link to the official Front Awesome documentation.
