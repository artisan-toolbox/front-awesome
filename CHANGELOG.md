# Changelog

## Unreleased

- Wait for a cancelled translation exporter to finish and close its output streams before Vite shutdown resolves. Cancel queued exports and retain silent shutdown cancellation, releasing process resources before consumers remove temporary working directories on Windows.

- Require Illuminate Translation 13.36 or later within 13.x to preserve numeric JSON translation keys during export. Applications on Laravel 13.0 through 13.35 must update Laravel before upgrading this preview. Keep the prefer-lowest CI lane and the numeric-key regression test unchanged.
- Describe Carbon's bound macro context to PHPStan when checking older Carbon releases that omit that annotation, preserving runtime behavior under the minimum dependency set.

- Align Vite Plus and its Vite core alias at 1.6.0 with the bundled Vitest 5.1.0, matching browser and coverage adapters, and no legacy runner override. Restore test startup and remove the vulnerable Vitest 4 dependency chain.
- Use Vite Plus's public formatter and browser test exports in generators and legacy browser tests. Explicitly deny unnecessary fsevents install scripts while preserving its packaged macOS watcher.

- Preserve Carbon's macro closure-binding contract during automated refactoring and keep the preference model fixture free of an unused factory trait. Scope the corresponding Rector transformations so repeated fixes do not reintroduce PHPStan errors.

- Reject PHP reserved type names in generated preference stores and preserve an explicitly empty locale configuration so validation cannot silently enable wildcard discovery.

- Validate locale identifiers with the shared JavaScript Intl canonicalizer before replacing either translation artifact. Direct exports now require Node.js 24.11 or later on the asset host; configure translations.node_binary or --node, while Vite supplies its own executable automatically. PHP request handling remains independent of Node.

- Reconcile cached and history visits through a full server response on supported Inertia 3.0 releases, including in-flight prefetch and replace navigation, so preferences and translated page props cannot revert to stale values.

- Forward nested PDF requestInit options during print-document preparation, with top-level options taking precedence, so authenticated previews retain their request headers.

- Add backend-owned appearance, locale, timezone, and nullable currency preferences with request-aware session, custom, and authenticated-model stores; validated Inertia updates; middleware sharing; a nonmutating Carbon timezone macro; reviewable migration and store generators; and renderless selectors under the preferences frontend module. Keep existing component exports and standalone browser behavior available.

- Group backend features by module, including the translation export command under Localization/Console/Commands and preference routes under routes/preferences.php.

- Discover selectable translation locales with the default wildcard or restrict them with an ordered allowlist. Export selector choices in availableLocales while retaining internal package and configured fallback catalogs. Limit application text to selected locales and the fallback when application export is enabled.

- Use APP_FALLBACK_LOCALE as the translation export fallback, defaulting to English when the environment variable is unset.

- Default printing to the last printer per format, one explicit print action per document, automatic advancement after accepted submission, and no final report. Opt into paused advancement or a summary per service or job. Keep failures visible and prevent repeated pointer or keyboard actions from applying to the promoted document.

- Add optional Laravel-source Vue I18n localization with deterministic catalog and type export, Vite regeneration, a renderless Language selector, HTML-owned locale, edition-aware native translations, and reactive printing defaults. Include English, Spanish, and Brazilian Portuguese package messages while preserving explicit overrides and standalone English printing.

- Exclude installed development dependencies and generated validation output from Composer source archives while retaining language resources, frontend runtime files, and consumer skills.

- Compact the print review drawer on large screens, cap preview height, and show completed jobs in a narrower summary with grouped result rows.

- Keep conditional Vue branch keys unique when projecting independent native slots and nested fragments, preserving native control identity during updates.

- Add the opt-in printing source preview with app-scoped FIFO jobs, promised keyed documents, PDF/ESC/POS/ZPL helpers, configurable QZ previews, a responsive Web Awesome review drawer, per-format preferences, and explicit submission results. Keep QZ optional for applications that do not print. Settle cancellation and application disposal safely, and report uncertain submissions without automatic retries.

- Infer non-text form bridge value types from its guards even when an emit callback ignores its argument, while preserving the legacy text overload.

- Reject sparse value collections and incomplete model listener arrays before writing to a control or form. Preserve valid empty collections and existing dense-value behavior.

- Add shared two-way Vue and Inertia binding to all data-entry wrappers, compatible dotted `field`/`field-name` aliases, typed value domains, server error messages and danger appearance. Add manual `failed` validation for native and model-bound controls, retaining Input's required binding contract and native reset defaults.
- Preserve live projected slot content and in-place structured model edits. Keep Rating and DatePicker hosts stable when binding or failure state is enabled after mount, using a neutral presentation element with an inactive contents frame that retains native refs and geometry.
- Add reviewed named models for mutable native state, including Pagination pages, TabGroup/Stepper active items, overlay visibility, Page navigation, data grids and media. Preserve native events and cancellation, optional inputs and unbound usage. Verify generated SFCs with the Vue macro compiler as well as TypeScript.

- Point consumer skill guidance to the consolidated Page and Icon category references.

- Document the Web Awesome 3.14 host-ARIA and slotted spacing boundaries found while adopting the public components in the documentation application. Keep native accessibility and scoped branding contracts explicit.

- Keep complex current values on native properties instead of copying them into textual reset defaults. Preserve native reset behavior for Tag Input arrays and date/time Date bindings; accept explicit supported collection defaults on Select.

- Restore native host spacing and borders across the full Web Awesome catalog in the optional Tailwind theme. Remove the Button wrapper's imposed display class so native geometry remains consistent.

- Complete the Web Awesome 3.14 Core Vue catalog with 65 additional source-preview wrappers, optional upstream-derived prop types, direct imports, native events, Vue named slots, and a shared registration-safe adapter. Existing Input binding and other wrapper contracts remain unchanged. Add 17 Pro-only wrappers through a separate public barrel and direct imports. Importing a Pro wrapper without the licensed dependency reports an explicit build/development setup error.
- Add reproducible wrapper generation, upstream example inventories, optional-prop compiler fixtures, and native browser parity coverage.

- Restore Web Awesome Tag padding and borders removed by Tailwind Preflight in the optional shared theme, while preserving application utility overrides.

- Make Page option optionality explicit for IDE inspection while retaining upstream option types and native defaults.

- Add an unstyled source-preview `Popover` wrapper with upstream-derived `PopoverProps`, interactive default-slot content, external focusable anchors, native lifecycle events, and native host methods.

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

- Add unstyled preview `Tag` and `Tooltip` Vue wrappers with upstream-derived prop types, native slots and events, presence boolean handling, numeric tooltip delay aliases, and Core/Pro-aware browser registration. Tooltip uses an external target ID through `for`.

- Add an unstyled preview `Page` Vue wrapper with upstream-derived `PageProps`, native layout slots and responsive navigation, explicit boolean attributes, and Core/Pro-aware browser registration.

- Add an unstyled preview `Icon` Vue wrapper with upstream-derived `IconProps`, native loading events and accessibility, custom library support, SSR-safe registration, and presence boolean handling. Export it from `components`, `components/WebAwesome`, and both direct `.vue` paths.

- Include complete commented neutral, success, warning, and danger palette examples in the published branding template. Keep physical Tailwind palette ownership and explain Aura's orange and yellow warning inputs.
- Read the remaining Aura color palettes from Tailwind in the optional PrimeVue preset, so application branding also reaches components using those colors.

- Rename the preview appearance controller API consistently. Replace `{ Theme }` with `{ Appearance }`, direct `components/Theme.vue` imports with `components/Appearance.vue`, and `<Theme>` tags with `<Appearance>`. Replace the plugin option `theme: true` with `appearance: true`, the `ThemePreference` type with `AppearancePreference`, and the `theme` slot value with `appearance`. This breaks the unreleased development preview API; no old-name aliases are retained. The `system`, `light`, `dark`, and `toggle` actions, `system | light | dark` preference values, `localStorage.appearance` key, SSR fallback, and mode classes retain their behavior.

- Group Web Awesome Vue wrappers under `components/WebAwesome` and expose matching component and type imports. Existing `components` imports remain available.

- Add the preview `Input` Vue component and `useFormBridge` composable with exclusive Vue model or dotted Inertia text-field binding, reactive server errors, native form reset synchronization, and Web Awesome attributes, events, slots, and danger styling.

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
- Add an opt-in color mode manager to the Vue plugin and an `Appearance.vue` component for custom light, dark, and system controls.
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
