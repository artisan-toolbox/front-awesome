# Changelog

## [1.0.0-beta.11] - 2026-11-23

- Show a compact information badge below a permission's description when the editor catalog supplies `roleRequirements`. The badge uses the operator's locale and is included in the checkbox's accessible description.
- List alternative roles with “or” and combine required groups with “and.” Represent hidden names as a restricted role. Operators can still assign the permission.
- Document the released DataView controls and table feedback options in the bundled Boost skill.

## [1.0.0-beta.10] - 2026-11-24

### Features

- **Keep DataView table headers visible during loading and add skeleton rows** (`29c1960`)
  DataView tables now show loading and empty feedback in a single full-width row beneath the column headings. Set `state-layout="replace"` to restore the previous behavior of hiding the table and showing feedback in its place. Custom `#loading` and `#empty` slots still work, but their placement and wrappers have changed; review any styles that depend on the old markup. Empty feedback now distinguishes an empty data source, a search or filter with no matches, and an empty current page, with generic wording when the cause is unknown. The empty-page message and the hint to adjust search or filters are available in English, Spanish, and Brazilian Portuguese.

The typed, table-only `#skeleton` slot takes precedence over standard loading feedback and keeps column headings visible in either layout. It exposes a zero-based `index` and readonly `columns` alongside the standard slot scope. Supply one `<td>` per configured data column; DataView creates the row and adds the selection cell when needed. `skeleton-rows` defaults to five and falls back to five for invalid values. Enable `preserve-skeleton-rows` to match the last accepted non-empty page length, using the configured count on first load or after an empty page. Table reloads hide existing rows, but infinite-scroll appends and retries keep accumulated rows visible without skeletons. List and grid views retain their items on reload.

DataView announces skeleton loading and infinite-scroll appends to screen readers, keeps status announcements outside `aria-busy` regions, and disables select-all while table feedback is shown. After a refresh in replacement mode, it restores focus to the sort button only if the user has not moved focus elsewhere. The development guide documents the new options and slot contract. Browser and type tests cover both layouts, custom slot rendering and typing, skeleton counts and fallbacks, reloads and retries, empty-page messaging, and keyboard focus.

## [1.0.0-beta.9] - 2026-11-21

### Features

- **Unify Data View options and improve pagination** (`f3e6aae`)
  Adds a responsive View Options dialog beside quick search for filters, search scope, sorting, and page settings, while keeping layout switching directly in the toolbar. Localized, removable badges show accepted searches, individual filter values, non-default matching options and page size, and active sorts or a sort preset. Removing one filter value keeps the other selections. Clearing criteria requests that non-infinite offset views keep their current page, and restoring the default page size clamps the page to the last valid one in version 2 offset views when the filtered count is known. Failed requests restore search and filter drafts to their last accepted values, and removing a focused badge moves focus to a remaining badge or the options trigger. The default footer pairs localized record or match status with responsive numbered controls for offset paging, Previous and Next for simple or cursor paging, or Load more, Retry, and an end-of-results announcement for infinite views. Page settings offer validated page jumps, page-size selection when there is a choice, reload, and First and Last navigation where supported. After a failed request, users can retry the failed target or continue from the page still on screen. Status messages distinguish an empty source from no matches and are localized in English, Spanish, and Brazilian Portuguese. Tables gain a named, keyboard-focusable scroll region with overflow indicators, and sort buttons display the accepted direction and multi-sort priority while retaining pending feedback. The developer guide documents the standalone DataViewSearch, DataViewFilter, DataViewStatus, and DataViewPagination exports, custom layouts, and how to retain Shift-click multi-sort through configuration. For custom layouts, hide-header and hide-footer hide their sections and slots; #toolbar replaces only the built-in toolbar controls, leaving filters, actions, and layout switching alongside it and page settings available in the default footer. The #pagination slot replaces the default footer status and navigation and suppresses the built-in header paging controls. DataViewPager still accepts the adapter and now defaults to size 'm', but delegates rendering to DataViewNavigation. Custom CSS that targets the previous Data View or pager markup may need updated selectors.

### Tests

- **Keep the pointer outside host reset examples** (`208be81`)
  Adjusts the frontend test setup so the pointer stays outside the host reset examples. This keeps pointer hover from influencing the examples during the test and does not change runtime behavior.

### Maintenance

- **Prepare the 1.0.0-beta.9 release** (`0444efe`)
  Bumps the @artisan-toolbox/front-awesome package version and README release badge from 1.0.0-beta.8 to 1.0.0-beta.9 and records the release in CHANGELOG.md. These release metadata and documentation updates do not change runtime behavior or require migration.

## [1.0.0-beta.9] - 2026-11-21

### Features

- **Unify Data View options and improve pagination** (`f3e6aae`)
  Keep quick search and the layout switcher in the toolbar, and open a single View Options dialog beside search to edit filters, search scope, sorting, and page settings. The dialog uses Web Awesome selects, keeps its actions visible while long sections scroll, and restores focus to its trigger on close. Removable badges show accepted searches, individual filter values, non-default search matching, field sorts and sort presets, and non-default page sizes. Removing one filter value preserves the others. In offset pagination, removing criteria requests that the current page be preserved; restoring the default page size clamps it to the last valid page when the filtered count is known. Search and filter editors restore the last accepted values after request errors.

The default footer pairs localized record status with responsive pagination: numbered pages for offset paging, Previous and Next for simple or cursor paging, and Load more, Retry, and an end-of-results announcement for infinite views. Page settings provide validated page jumps, page-size selection, reload, and first and last navigation where available. After a failed page request, navigation can retry or proceed relative to the page still on display. Status announcements distinguish an empty source from a search with no matches and report record or match ranges and totals when known. New labels and messages are available in English, Spanish, and Brazilian Portuguese.

Sortable table headers use native buttons and distinct indicators for ascending, descending, and unordered states. They expose the accepted sort direction and multi-column priority while retaining existing slots and modifier shortcuts. The table scroll region is labeled and keyboard-focusable, and the fallback caption remains available to assistive technology. Page-height changes keep the visible footer in place, searches and sorts preserve the initiating header, and pending requests respect manual scrolling.

Custom layouts can reuse the same adapter with standalone DataViewSearch, DataViewFilter, DataViewStatus, and DataViewPagination components and opt out of the built-in header or footer with `hide-header` and `hide-footer`. The `toolbar` slot replaces the default controls, while a custom `pagination` slot suppresses the default footer status and navigation as well as the header paging controls. Hiding the header or footer also hides the slots it contains. Direct DataViewToolbar consumers must now pass `includePaging`. DataViewPager delegates to the shared navigation component and defaults to size `m`; custom CSS and tests that target the previous toolbar or pager markup may need updates. The development guide documents the new composition and paging options separately from beta.8 behavior, including how to restore Shift-click multi-sort with `dataView.multiSortKey`.

## Unreleased

- Add MaskedInput for editable text patterns. Define per-character rules, optional groups, format selection, guides, overwrite behavior, and fixed affixes. Clear incomplete values on blur when enabled. Bind the raw or formatted string to Vue, Inertia, or a native form.
- Use the bound value in MaskedInput's server-rendered markup. Keep punctuation when hydrating or assigning a formatted value that matches one of several masks.
- Pass a reusable MaskTemplate to MaskedInput. Use `useMaskTemplate()` for Brazilian tax IDs, postal codes, telephone numbers, IP addresses, hexadecimal colors, UUIDs, and MAC addresses.
- Use `$maskTemplates` in Vue templates and the Options API after installing the Front Awesome plugin.

- Use Font Awesome `arrow-down-a-z` and `arrow-up-z-a` for the default ascending and descending headers, with `up-down` for an unordered sortable column.
- Show Font Awesome numbered squares for every active column in a multi-column order. A numeric fallback preserves the priority when an icon is unavailable.

- Keep the visible footer in place when a page changes height. Searches and sorts preserve the header that started the read. A reader who scrolls elsewhere while a request is pending keeps control of the viewport.

- Use Web Awesome Select for the filter criterion, search scope and order field. Keep space between the quick search focus ring and the first row of applied badges.
- Open **View options** with the filter button beside quick search. A single dialog groups the adapter’s search, filter, sort and pagination controls. The layout switcher stays in the toolbar. Remove an applied criterion from its compact badge below search. Page position appears in the pager. Long sections use the application scrollbar and keep the footer actions visible.
- Show record status and Web Awesome Pagination in the default footer. Numbered sources show up to two neighbors on each side when space permits. Simple, cursor and infinite sources keep their own navigation. Standalone pagination and views with a hidden or replaced toolbar include a separate page settings button.
- Distinguish comparison tables, divided lists, and card grids. Sortable headers expose the direction and priority of the accepted order and keep the existing header slots and modifier shortcuts.

## [1.0.0-beta.8] - 2026-11-21

### Features

- **Add opt-in scrollbar edge fades and clickable permission and role rows** (`5fb43d3`)
  Use `v-scrollbar="{ shadows: true }"` to show a fade on any horizontal or vertical edge of a bounded scroll region where more content remains. Fades work in LTR and RTL, update as the region scrolls or its viewport or content changes, and do not intercept pointer events. Customize them with `--fa-scrollbar-shadow-color` (defaults to the surface color or `Canvas`) and `--fa-scrollbar-shadow-size` (defaults to `2rem`). Existing scrollbars are unchanged unless you opt in. Turning fades off removes the overlay without resetting the scroll position; restoring native scrollbars also removes the overlay and its listeners. Fades are hidden during scrollbar measurement and when printing, and the directive leaves server-rendered markup unchanged.

Click anywhere on an editable permission or role row, or focus it and press Space, to toggle its draft value. Changes are submitted only when you select **Save changes**. Read-only rows remain noninteractive. Editable permission rows now use native checkboxes with visible row-level focus, assistive-technology links to descriptions and validation errors, and an invalid state when a permission is rejected. Allowed rows use brand colors and a check icon; denied rows use neutral colors and a cross icon, with text labels retained for both. The `focusAbility` API is unchanged, but custom selectors targeting `wa-checkbox` or the old row markup may need updating.

Updated the development guide to document both features. Added browser and SSR coverage for edge fades, including RTL, content changes, and runtime removal. Updated permission editor browser tests to use accessible roles and names and cover full-row toggling on mobile, keyboard focus, validation, and Save disabling when the draft returns to its original state. Removed two scenario entries from the upstream coverage manifest without deleting the tests themselves.

## [1.0.0-beta.7] - 2026-11-20

### Tests

- **Stabilize browser style checks and cap unit test workers** (`af5237f`)
  Move the pointer away from both the native and Vue fixtures before comparing static styles so hover state cannot distort the comparison. The Option scenario deliberately hovers the native Espresso option to cover the case where the pointer is left over a fixture. Cap Pest and Vitest unit test runs at four workers by default. Pest remains serial by default on Windows; set `MAINTAINER_PEST_PARALLEL=true` to retain parallel execution there or use `MAINTAINER_PEST_PROCESSES` to change the worker count. `composer test` now runs PHPStan, Pint, and Pest through Maintainer in strict, non-interactive mode, then runs the type tests. Automation that depends on the previous direct script calls or their order may need updating. The development skill guide also marks previously previewed features as released: beta.4 field synchronization for autofill and restored values, `v-scrollbar` configuration through `createFrontAwesome()`, and beta.6 translation source checks independent of Vite notifications and file-replacement retries on Windows. Those guide updates do not change runtime behavior.

### Continuous Integration

- **Test Front Awesome on PHP 8.6** (`162546a`)
  Run Linux quality and build checks, Windows runtime tests, and lowest- and latest-dependency checks on both PHP 8.5 and 8.6. Disable matrix fail-fast so a failure in one configuration does not cancel the others. PHP 8.5 jobs keep their existing names, while PHP 8.6 jobs add a ` / PHP 8.6` suffix. The shared setup action upgrades Maintainer from 1.14.2 to 1.14.4 and explicitly defaults to PHP 8.5; callers can select another version with `php-version`. Localization casing generation now compares `mb_ucfirst` with the uppercase-first, lowercase-rest fallback entirely in PHP, removing differences caused by Node's Unicode tables and producing the same exceptions on both tested PHP versions. The generator still supports `PHP_BINARY` and `--check` and reports the exception count from the generated object.

- **Limit the Playwright HOME override to browser commands** (`a22b4a6`)
  Save the container user's home as `BROWSER_CONTAINER_HOME` and use it as `HOME` only for the theme, scrollbar, browser, and browser coverage test commands. This lets Firefox start with the correct home without changing the runner's Docker CLI home during setup or PHP coverage. Mark the mounted Git checkout as trusted before Composer runs.

## [1.0.0-beta.6] - 2026-11-20

### Features

- **Separate role assignments from permission groups** (`d227528`)
  Organizes the permission editor and its sidebar into Permission Groups and Role Assignments. Sections show enabled and total counts for the visible entries, and rows distinguish Allowed/Denied permissions from Assigned/Unassigned roles. Enabled rows are highlighted, and status badges are hidden from assistive technology when the checkbox already conveys the state. Selecting a sidebar entry closes the other sections, focuses the selected section, and scrolls within the catalog without discarding draft changes; saving remains explicit. Search shows a match count only for nonempty queries with results.

Documents `kind: 'permissions'` and `kind: 'roles'` for catalog sections and optional decorative section and row icons. To display icons, return `iconFamily: 'classic'` and lowercase, hyphen-separated icon names, and supply the family through Web Awesome; omitting `iconFamily` keeps icons hidden. English, Spanish, and Brazilian Portuguese copy now covers roles and permissions. Consumers that still reference `user-permission-editor.results` must update that reference because the key was removed.

### Fixes

- **Rescan Laravel translation inputs and retry Windows file replacement** (`30faa76`)
  Makes translation previews rescan PHP and JSON files under Laravel's language roots and `config/front-awesome.php` independently of Vite notifications. This catches edits, newly created files, and replacements even when Vite misses an event, including replacement of `config/front-awesome.php` outside the Vite root. Set `translations.cwd` to the Laravel root when it differs from the Vite root. On Windows, atomic output replacement retries briefly when a reader holds a generated file open; if the lock persists, close the process and rerun the export. Export diagnostics go to stderr so fixture JSON remains parseable, and Pest reports Artisan export errors when verifying browser locales.

- **Keep Vite translation exports active after polling stops** (`5536fb6`)
  Keeps the Vite translation exporter active after polling ends, so translation output can continue to refresh instead of becoming stale when polling stops.

- **Use Playwright's home directory for Composer caching** (`ebb9efc`)
  Stores Composer's cache under the Playwright user's home directory and marks the checked-out CI workspace as trusted by Git. This lets Composer reuse cached downloads in browser jobs without Git rejecting the workspace over an ownership mismatch.

### Continuous Integration

- **Consolidate CI setup and quality checks under Maintainer** (`f7f615c`)
  Adds a reusable CI action that installs Composer dependencies before npm dependencies and caches downloaded archives through Maintainer. The action reads Node.js 24.22.2 from `.nvmrc`, fails if the pin is empty, and still sets up Node.js when PHP compatibility jobs skip npm. It exposes Composer dependency mode, validation, coverage, and npm installation settings. The test workflow replaces the combined matrix with planner-selected Linux quality and build checks, serial Windows runtime tests, lowest and latest PHP dependency checks, and browser integration in a version-matched Playwright container. The planner is tested before it selects jobs; the browser plan controls expanded theme and scrollbar checks and whether to run browser tests directly or collect and upload coverage. The workflow adds manual and scheduled runs and cancels superseded PR runs.

Adds `composer quality:check` and `composer ci:check`, routes type coverage through a dedicated script, invokes PHP tools through Composer's `@php`, and raises the analysis memory limit to 2 GB. Updates the Artisan Toolbox, Larastan, and Pest type-coverage constraints and removes the direct PHPStan constraint and its explicit upper bound. Maintainer now defaults to parallel Pest runs; set `MAINTAINER_PEST_PARALLEL=false` to retain serial execution. Its standalone Vue type check is removed because Vite Plus includes Vue type checking. Maintainer also gains per-task AI model and locale settings and points its release workflow to `tests.yml`. Contributor documentation explains the new commands and runtime setup. Git can now track `composer.lock`, while Git archives omit it, `.nvmrc`, and the internal CI planning and type-coverage scripts.

- **Select CI jobs by event and changed files** (`44b78dc`)
  Introduces a CI plan selector that uses the workflow event and changed files to decide which checks to run, rather than running every job for every change. Adds Composer and npm download caching so selected jobs can reuse dependencies instead of downloading them again.

### Maintenance

- **Prepare the 1.0.0-beta.6 release** (`488080d`)
  Bumps `@artisan-toolbox/front-awesome` and the README release badge from 1.0.0-beta.5 to 1.0.0-beta.6. Adds the dated beta.6 release notes and an Unreleased section. The displayed PHP (^8.5) and Laravel (^13.36) requirements are unchanged.

## [1.0.0-beta.6] - 2026-11-19

### Fixes

- **Keep exporting after polling stops in Vite translations** (`5536fb6`)
  Updates the Vite translation export logic so translation exporting continues appropriately even after the polling lifecycle ends. This matters because Vite watcher/polling behavior can stop delivering updates in certain timing scenarios; without this fix, translation inputs that change shortly around the polling stop may not trigger re-exports. User impact: more reliable runtime translation updates in watch/poll modes, reducing cases where translations appear stale. Compatibility/migration: no public API or config key changes are indicated; this is an internal behavior correction for translation export scheduling/detection.

- **Composer CI caching uses Playwright home and trusts workspace** (`ebb9efc`)
  Adjusts the CI setup to locate Composer’s cache directory using the Playwright home directory and to trust the workspace before running Composer-related steps. This improves CI stability in environments where Composer cache paths differ from expectations and where Git safety/trust settings can prevent Composer from executing operations or reading repository context securely. User impact: fewer CI failures related to Composer caching and workspace trust. Compatibility/migration: no changes to application runtime; only CI environment behavior is affected.

### Continuous Integration

- **Add CI plan selector and cache Composer/npm dependencies** (`44b78dc`)
  Introduces CI planning and dependency caching improvements by adding a CI plan selector (implemented via new scripts) and enabling caching for Composer and npm dependencies. The intent is to speed up and streamline tests by deciding which job subset should run based on the event type and changed files, while reusing Composer/npm artifacts across workflow runs. User impact: faster CI runs and more targeted testing; potential compatibility effect if contributors relied on previously always-running jobs. Compatibility/migration: workflow behavior changes are CI-only; no production API changes are implied, but contributors should expect jobs like coverage/compatibility/browser checks to be gated depending on the planned CI flags.

## Unreleased

- Move the pointer outside the native and Vue fixtures before comparing static browser styles. The Option scenario exercises a pointer left over the native example.
- Cap the Pest and Vitest unit suites at four workers. Run the PHP validation command through Maintainer and keep Pest serial on Windows.

- Provision Node.js from `.nvmrc` in both PHP compatibility jobs so the translation exporter can verify browser locales without installing npm dependencies. Pest reports the Artisan error when a translation export fails.
- Use the Maintainer 1.14.2 setup action for Composer and npm and run standard Linux and Windows checks through Maintainer. Run Vue type checking once through `npm run check`, then run PHP type coverage and the consumer build as package-specific gates.
- Run the localization build, configuration watcher, and exporter lifecycle tests in separate Vitest files. Isolate Web Awesome tests that start before custom element registration so they can run in any order.
- Run the light and dark reset inventories in parallel. Settle shadow DOM transitions before comparing native and Vue styles.
- Require Larastan 3.12.1 and Pest Type Coverage 5.1.1 as development minimums. The updated coverage plugin supports the collected-data API in PHPStan 2.3.6 and later, so Composer can resolve PHPStan through the development tools.
- Separate role assignments from permission groups in the user permission editor. Sidebar navigation opens and focuses one group, and each group shows its allowed or assigned count alongside explicit row states.
- Render optional Font Awesome catalog icons alongside group and permission labels when the provider sends an icon family and names.
- Refresh the Vite translation catalog after edits to nested language files even when Vite misses their notifications.
- Retry atomic replacement of generated translation files when a Windows reader briefly holds them open.
- Set the Playwright container user's home only for browser commands so Firefox can start and the runner's Docker CLI keeps its own home. Trust the mounted Git checkout before Composer runs.
- Use the checked-in Composer and npm locks for routine Linux and Windows checks. Run Chromium for runtime changes and all browser checks for frontend source, browser fixture, dependency, and CI changes. Release candidates run the complete matrix. A Markdown-only edit records a lightweight CI result.
- Run `composer ci:check` to reproduce the locked Linux quality checks and consumer build without repeating frontend checks. PHP type coverage now fails if the report omits a source file that Pest supports.
- Keep compatibility-run diagnostics on standard error so the translation fixture returns valid JSON with the lowest supported Symfony dependencies.
- Require the successful GitHub Actions push workflow for the exact release commit when publishing with a Maintainer build that supports release gates.
- Track creation and replacement of Laravel translation inputs even when Vite misses their filesystem notifications.
- Keep checking translation inputs when Vite stops polling a path, including replacements of `config/front-awesome.php` outside the Vite root.

## [1.0.0-beta.5] - 2026-11-19

### Fixes

- **Schedule Vite translation exports after watcher is ready** (`176fef2`)
  Refines the Vite translation export scheduler/reload behavior so exports are triggered at the right point in the Vite watcher lifecycle. Instead of relying on a simple pending flag, the scheduler now tracks a single queued export (`pendingExport`) with an optional `reload` request, and records `lastExportFailed` to determine whether a subsequent successful export should be followed by a full reload.

When draining the export queue, the logic conditionally sends Vite WS `{ type: 'full-reload' }` only when a reload is explicitly requested or when it detects that the translation output file’s contents changed (using a new helper to read/compare catalog output before vs. after). This reduces unnecessary full reloads while ensuring the UI updates correctly after successful translation regeneration.

It also adds a debounced `scheduleExport()` and ties it to Vite watcher lifecycle events (including scheduling an initial export when the watcher reports `ready`), while still covering cases where Vite’s initial scan may already have completed. During `watch()`, the implementation safely no-ops if `viteServer.config.server.watch === null`, and on `close()` it clears any queued export state.

User impact: development-time translation updates become more reliable—especially when language files are created under the Vite project root during server startup—without causing excessive full page reloads.

Compatibility/migration: no documented breaking API/config changes; this is an internal behavior refinement. Developers relying on translation exports during Vite startup should see improved correctness.

## [1.0.0-beta.4] - 2026-11-19

### Features

- **Add UserPermissionEditor and expand scrollbar coverage** (`e40e242`)
  Introduces the UserPermissionEditor feature (including the new editor component) and improves coverage for the scrollbar behavior across supported browsers. This matters because the user-permissions editing UI is a new functional surface, while scrollbar testing ensures the scrollbar component and styling work consistently beyond Chromium. User impact: users gain access to a dedicated permission editor UI; developers/testers get stronger assurance that scrollbar behavior is correct in Firefox and WebKit as well. Compatibility/migration: consumers should account for the additional exported component and any related localization assets; no direct migration guidance is specified in the commit summary, but new permissions editor UI implies new frontend integration points.

- **Expand DataView criteria, selection, grouping, and paging** (`e3f1f80`)
  Enhances the DataView functionality by expanding criteria handling (including selection-related filtering and more expressive criteria), and improving selection, grouping, and paging behaviors. This matters because DataView is typically a core UI for browsing and managing records; improved criteria and interaction models enable richer data exploration and more scalable navigation patterns. User impact: end-users can apply more advanced filter/criteria flows and see improved handling for selection, grouped presentation, and paginated navigation. Compatibility/migration: changes likely affect how criteria/selection/grouping inputs are interpreted in the DataView UI; integrations relying on prior criteria shape or slot expectations may need to adjust to the expanded behavior.

### Fixes

- **Regenerate Vite translation catalog on raw changes** (`e8d0a2b`)
  Updates the Vite i18n build pipeline so the translation catalog is regenerated whenever raw translation content changes. This prevents stale or missing localized strings from being served in development/build outputs, improving reliability of UI text updates. User impact: localized UI strings should update correctly without requiring manual rebuilds or waiting for a subsequent cache invalidation. Compatibility/migration: no API or runtime behavior changes are implied beyond ensuring the translation assets stay in sync.

## Unreleased

- Regenerate the translation catalog when language files are created inside the Vite root during development server startup.

- Require Pest Type Coverage 5.0.2 or later so `composer test:types` runs without writing a type coverage cache in the lowest-dependency CI job.

- Use beta stability flags for Front Awesome and Dapter in the README installation command.

- Configure the default color for bare `v-scrollbar` with `createFrontAwesome({ scrollbar: { defaultVariant: 'brand' } })`. The DataView table, print preview, and permission editor adopt the configured variant.

- Add `v-scrollbar` with five theme modifiers and optional OverlayScrollbars options. The original HTML element owns scrolling, and the browser scrollbar remains available during server rendering and in forced colors.

- Distinguish released Shift-click sorting from the source preview’s configurable modifier, icons, and header slots in the Boost skill.

- Require Dapter `^1.0.0-beta.1` for the Composer integration and optional JavaScript peer dependency. Install Dapter beta.1 or later before refreshing Composer-delivered frontend dependencies.

- Added platform-aware configurable DataView multi-sort modifiers, Font Awesome sort icons with literal-text overrides, and typed `head-ID` content slots. Existing full `header-ID` replacements remain supported.
- Corrected ordinary header clicks at the end of a multi-sort direction cycle so the clicked column becomes the sole term instead of leaving another column primary.

- Added prepared JSON vector inputs for Dapter PostgreSQL L2 search capabilities, including dimension and coordinate validation, source policy hints, and localized feedback.
- Updated the borrowed Dapter handle integration for UUID browser persistence and portable `share()` links. Dapter continues to own expiration, version checks, restoration, and storage.

- Corrected the installation command to explicitly allow the required Dapter beta on applications using Composer's default stability policy.
- DataView now presents the field and global search, match operators, finite filters, field order terms, and offset presets advertised by a borrowed Dapter handle. Search fields retain focus during infinite reads and can be used inside application forms. Numeric searches reject drafts that would change value in JSON. Pagination distinguishes loaded, matching, and total counts and offers explicit cursor and saved-state recovery.
- Added optional single or multiple occurrence selection, indexed row-key callbacks, contiguous grouped table cells, and typed selection in slots. Use `controlLabel` for application labels and the Laravel localization catalog for translated controls. Existing three-prop usage and layout, toolbar, filters, and pagination slots remain supported.

## [1.0.0-beta.3] - 2026-11-18

### Features

- **Export/apply Laravel plural whitespace behavior for improved catalog compatibility** (`eb87709`)
  Changed the localization export and browser catalog application logic to align with Laravel plural selector whitespace handling, and ensured this behavior is applied during exports/imports. This corrects mismatches where differing whitespace around plural conditions could lead to incorrect plural selection or catalog behavior—while still maintaining compatibility with older catalogs and older Laravel versions. User impact: pluralized strings resolve more reliably and consistently across supported Laravel versions, reducing edge-case localization bugs. Compatibility/migration: catalog metadata may now be exported with different whitespace acceptance rules; projects should regenerate their translation catalog/build assets after updating Laravel (as reflected in the documentation updates). No code API change is implied beyond the export/apply behavior.

- **Add optional Dapter-backed DataView preview source support** (`92bea93`)
  Introduced an optional DataView preview capability backed by typed Dapter handles. The feature adds support for declarative columns plus cell slots, and supports multiple layouts (table/grid/list). It is capability-aware for searching and ordering, and supports source paging or infinite loading. A key design goal is that Dapter remains optional for other Front Awesome imports, but when using the new DataView exports, consumers may need a compatible `@artisan-toolbox/dapter` alpha dependency. User impact: enables richer “source preview” experiences for DataView, including more accurate typing and better runtime behavior for previewing query results. Compatibility/migration: this is a breaking-marked change (`feat(... )!`), largely due to new export surfaces and the introduction of an optional Dapter-backed integration path. If consumers use the new `@artisan-toolbox/front-awesome/data-view` exports, they should install/align `artisan-toolbox/dapter` (version `^1.0.0-alpha.1`) and update any typecheck/build steps to include DataView type validation.

### Fixes

- **Run vue-tsc via Node and preserve real errors for data view types** (`3a1a08d`)
  Updated the typechecking workflow for DataView to run `vue-tsc` through Node (instead of relying on a direct invocation) and to preserve the underlying compiler/process-launch errors. This matters because previously some Vue typecheck failures could be obscured or differently surfaced, especially across environments (notably Windows vs Unix). User impact is indirect but important: developers get accurate, actionable typecheck failures when DataView-related typing changes occur. Compatibility impact is limited to the developer experience; there is no runtime/API change and no migration required for end users.

## Unreleased

### Features

- Add the provider-neutral UserPermissionEditor for Inertia pages. It supports a searchable permission catalog, read-only access, complete boolean saves, and review of conflicting or unconfirmed writes.
- Let the UserPermissionEditor grow with the catalog and keep its actions in view. Confirm discarding edits in a separate dialog with keyboard focus on Keep editing.

- Add the optional DataView source preview with typed Dapter handles, declarative columns, cell slots, table, grid, and list layouts, capability-aware search and ordering, and source paging or infinite loading. Import it from `@artisan-toolbox/front-awesome/data-view`. Dapter remains optional for other Front Awesome imports.

### Fixes

- Regenerate the Vite translation catalog when the polling watcher detects a changed file even if its modification time stays the same.
- Run the DataView negative Vue type checker through Node on Windows and Unix. Preserve compiler and process-launch errors instead of masking them with an invalid diagnostic write.
- Match the installed Laravel plural selector's handling of whitespace around exact and interval conditions. Export its behavior with the browser catalog while preserving older catalogs and Laravel versions.
- Discard pending autofill when a control switches to another Inertia field or form, even when both bindings have the same value. Reapply the new binding before observing further native edits.
- Synchronize Input, OtpInput, NumberInput, and Textarea Vue and Inertia bindings with change-only and Shadow DOM autofill, browser restoration, and silent fills before ordinary form submission. Observe accepted host changes for KnownDate, TimeInput, and Pro DateInput without changing their Date setter contracts. Preserve OTP leading zeros, completion listener ordering, autosubmit cancellation, and native reset defaults.
- Preserve the current URL and history entry when preferences refresh after Back, Forward, cached navigation, or an explicit refresh. Server query normalization no longer adds a duplicate entry or removes the fragment.

## [1.0.0-beta.2] - 2026-11-16

### Features

- **Default to persistent encrypted cookie store** (`5353972`)
  Includes the changes introduced by commit 5353972: feat(preferences): default to persistent encrypted cookie store.

### Fixes

- **Refresh Vite translation watch roots for outside-root config changes** (`3d047b2`)
  Updated the Vite translations watcher to correctly refresh directory subscriptions when translation-related input directories are created or removed. This ensures catalog regeneration keeps working for scenarios like configuration publication, atomic replacement, and directory recreation—particularly when the Laravel working directory (and thus watched paths) is outside the Vite root. The watcher now recalculates watch roots on relevant directory change events and avoids stale/overlapping watch paths by sorting candidate directories and only adding directories that are not already covered by previously watched prefixes.

- **Constrain PHPStan dev dependency and disable Pest type cache** (`1c4e8c6`)
  Adjusted the PHPStan/Pest toolchain compatibility by restricting the development PHPStan dependency to versions <2.3.6 (within the 2.2.x line) because Pest type-coverage plugin 5.1.0 depends on a removed PHPStan method (`AnalyserResult::getCollectedData()`). Also updated the `test:types` script to run Pest type coverage with `--no-cache`, ensuring local runs detect incompatible analyzer updates instead of relying on potentially stale cached type-coverage results. The mandatory 100% type-coverage requirement remains in place and CI dependency lanes are kept unchanged.

## [1.0.0-beta.1] - 2026-11-13

### Maintenance

- **Promote Front Awesome 1.x beta in documentation** (`ee822aa`)
  Updates the project’s documentation and related metadata to promote Front Awesome 1.x from an “unreleased/source preview” state to an explicit beta.

Key user-facing changes:
- CHANGELOG/Unreleased messaging: Adds an Unreleased note clarifying that Front Awesome 1.x is now promoted to beta across the README, release badge, and the consumer skill. It instructs consumers to install using the package-scoped beta stability flag while keeping release version metadata managed by the Maintainer.
- README branding and install guidance: Updates the GitHub releases badge label from “Release-in development” to a beta-themed badge (“Release-beta-yellow”). Updates Composer installation instructions to require the beta constraint explicitly (e.g., using `:^1.0@beta`) rather than leaving stability unpinned.
- Beta compatibility messaging: Adjusts README language to clearly state that the 1.x API may change before the first stable release, setting user expectations around potential pre-stable compatibility risk.
- Documentation updates for the 1.x track: Revises Front Awesome 1.x documentation to reflect the beta status, including the updated Composer command, beta framing around export/feature completeness, updated links (e.g., renaming a Popover doc link target), and adjusted wording for migration-related terminology (e.g., Theme→Appearance) without changing the described replacements.

Library/version/test alignment:
- package.json and library constants: Bumps the package version and `FrontAwesome::VERSION` from `1.0.0-alpha.2` to `1.0.0-beta.1` to align code-visible versioning with the new beta release.
- Test updates: Updates unit test expectations for README head badge URLs to match the new beta badge styling.

Why this matters / impact:
- While the diff indicates no behavioral code/API changes beyond version/tag signaling, these updates directly affect how users install and interpret the 1.x release. Consumers must use the beta stability constraint to obtain the intended pre-stable version, and they are warned to expect possible API changes before the first stable release.

Compatibility/migration needs:
- No automated migrations are indicated; instead, users should ensure they install the beta via the documented Composer constraint and review the beta notes regarding potential API changes before adopting 1.x in production.

## [Unreleased]

- Opt in to Scroller-style edge fades with `v-scrollbar="{ shadows: true }"`. The fades follow the current scroll position on either axis.
- Toggle a permission or role by clicking its row. Active rows use the brand palette and a check badge. Inactive rows use neutral colors and a cross badge. Keyboard users can focus an editable row and press Space.

- Test PHP 8.5 and 8.6 in CI with the Maintainer 1.14.4 setup action.
- Generate the same localization titlecase exceptions on PHP 8.5 and 8.6 by using mbstring for both sides of the comparison.

### Fixed

- Watch existing directories for translation inputs instead of registering missing files or children already covered by a watched ancestor. Refresh directory subscriptions on creation and removal so configuration publication, atomic replacement, and directory recreation regenerate the catalog, including when the Laravel working directory is outside the Vite root.

- Restrict the source checkout's PHPStan development dependency to versions below 2.3.6 while Pest's type-coverage plugin 5.1.0 depends on the removed `AnalyserResult::getCollectedData()` method. Run type coverage without cached results so local runs also detect incompatible analyzer updates. Preserve the mandatory 100 percent type-coverage check and both CI dependency lanes. Production dependency constraints and preference behavior are unchanged.

### Changed

- Use persistent encrypted HttpOnly cookies by default for appearance, locale, timezone, and currency, including guests of an authenticated-model store. Session expiry no longer resets these choices. Configure `preferences.cookie_lifetime` in minutes (365 days by default). Each preference has its own cookie; clearing currency expires it. Existing active-session strings migrate on first read, with cookies taking priority. Explicit `SessionPreferenceStore` selections retain temporary session behavior; update published store configuration to opt into cookies. Account values remain isolated from guest cookies.

- Promote Front Awesome 1.x to beta in the README, release badge, and consumer skill. Use a package-scoped beta stability flag for installation. Release version metadata remains managed by Maintainer.

## [1.0.0-alpha.2] - 2026-11-11

### Features

- **Request-aware preferences and printing localization (breaking change)** (`89b282a`)
  Introduces a breaking feature that adds request-aware preferences and printing localization. The request-aware behavior likely changes how preferences are selected/resolved in the context of the current request rather than globally, and the printing localization likely ensures printing-related text/locale is correctly localized. Why it matters: printing localization and preference selection are user-visible and correctness-sensitive, especially in multi-tenant or per-request scenarios (e.g., different locale/theme/formatting). User impact: printing-related UI/content should be better localized and preferences should reflect request context. Compatibility: this is marked feat! (breaking change), indicating some behavior or interface contract has changed—consumers may need to adjust how preferences are provided/resolved and how localization for print is configured/expected. Migration: review integration points for preference resolution and any print/localization wiring that may have changed.

### Fixes

- **Validate raw Symfony input for translation exports** (`1e6d40e`)
  Fixes translation export logic by validating raw Symfony input before it is used for generating translation outputs. This matters because malformed or unexpected raw input can produce incorrect export files, incomplete translations, or export-time errors. The fix hardens the export pipeline and prevents downstream issues in localization workflows. User impact: more reliable translation export results and fewer localization-related regressions. Compatibility: no API changes are implied, but export outputs may become more correct/strict when invalid input previously slipped through; no migration should be needed beyond correcting any upstream input inconsistencies.

- **Wait for aborted export to finish on close** (`722fb60`)
  Fixes localization export shutdown behavior by ensuring that when an export is closed/aborted, the export process is waited on to finish cleanly rather than terminating prematurely. This matters because premature close can leave partial/locked state, incomplete files, or UI desynchronization. User impact: prevents corrupted/incomplete export artifacts and improves reliability of the export close flow. Compatibility: no public API changes; only lifecycle/termination correctness is improved. Migration: none.

- **Align Vite Plus/Vitest and PHPStan Carbon stubs** (`0251a5f`)
  Aligns local tooling stubs so Vite Plus/Vitest and PHPStan Carbon type expectations match. This matters because mismatched stubs can lead to type-check disagreements, failing CI type checks, or incorrect editor/autocomplete signals. User impact is indirect: more consistent developer experience and fewer CI failures due to tooling/type drift. Compatibility: no runtime behavior changes. Migration: none, but developers should pull the updated tooling expectations as CI may now enforce the aligned stubs.

### Documentation

- **Add documentation adoption audit and verification docs** (`e861941`)
  Adds documentation-only audit/verification documentation describing how to adopt “public Front Awesome components” across the documentation application and how to verify the adoption. This includes an adoption plan process with phased migration, a definition-of-done checklist, constraints to avoid per-page CSS workarounds or duplicate state controllers, and a verification approach with explicit adoption levels and evidence boundaries. User impact: none at runtime; it improves transparency and repeatability for documentation UI component adoption. Compatibility/migration: none for end-users; documentation maintainers should follow the new audit/verification procedures when making component adoption changes.

### Refactoring

- **Rename Theme preview API to Appearance and add WebAwesome wrappers** (`d7775bb`)
  Refactors the Theme preview API by renaming it to Appearance, and adds WebAwesome wrappers to support usage patterns. Why it matters: renaming the public/internal API surface affects how preview theming is requested/configured, and wrapper additions provide standardized integration points. User impact: developers integrating/using the preview functionality must update to the new Appearance naming; the wrapper additions should make adoption smoother and more consistent. Compatibility: breaking/refactor-risk for integrations because the API rename likely requires code changes. Migration: update all references from the old Theme preview API to the new Appearance API; ensure any wrapper usage aligns with the new contract.

### Tests

- **Wait for dynamic imports and viewport parity in browser tests** (`fe8c787`)
  Updates the frontend browser test strategy to better handle asynchronous dynamic imports and ensure consistent viewport parity. This matters because flaky timing/viewport mismatches can cause nondeterministic failures and false negatives during UI verification, especially when component code is loaded lazily or layout depends on viewport-related rendering. User impact is limited to CI/test reliability: it reduces spurious failures without changing runtime behavior or public APIs. Compatibility impact is none; no migration is required.

- **Grant Playwright clipboard permissions and verify copy** (`ddc0a46`)
  Modifies the frontend Playwright browser test setup to grant clipboard permissions and adds/strengthens assertions for copy-to-clipboard behavior. This matters because clipboard interactions are commonly blocked by browsers unless explicit permissions are granted, leading to tests that fail in some environments but pass in others. The change improves determinism and coverage for user-facing copy flows. User impact: more trustworthy verification of copy UI features; no production code/API behavior is changed. Compatibility/migration: none.

## Unreleased

- Keep native and Vue parity examples visible in the same viewport and wait for the public active tab panel before comparing TabGroup state, colors, and dimensions.
- Wait for dynamic imports in browser readiness helpers and observable checkbox binding and form-data initialization, with a controlled delayed-loader scenario covering current values, reset defaults, user interaction, and unrelated Vue renders.
- Grant clipboard permissions to the Playwright test context and verify the copied text through the real Clipboard API, including in Chromium headless shell.
- Validate raw Symfony input for translation command options, retaining failure messages and existing artifacts for invalid programmatic Artisan values. Load the package service provider during PHPStan bootstrap so registered CLI signatures are checked on every platform. Let every CI matrix job finish after a sibling fails.

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
