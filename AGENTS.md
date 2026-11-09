# Front Awesome

This repository is a Laravel package. Keep the package focused, idiomatic, and easy for Laravel developers to install, test, and maintain.

## Package Conventions

- Use Laravel-native package APIs and the existing service provider shape before adding abstractions.
- Keep package names, namespaces, Composer metadata, publish tags, documentation, and examples aligned with `artisan-toolbox/front-awesome`.
- Add only the files and dependencies needed for the package behavior being implemented.
- Prefer explicit Laravel package code over helper abstractions unless the extension point is real.
- Keep tests focused on observable package behavior through public APIs, service provider wiring, commands, routes, published resources, and documentation promises.

## Quick Commands

- Full validation: `composer test`
- Formatting check: `composer lint:check`
- Static analysis: `composer analyse`
- Pest tests: `composer test:unit`
- Workbench build: `composer build`
- Workbench server: `composer serve`

## Local Skills

- `package-scaffold`: use when adding package capabilities or wiring them through the service provider, including commands, migrations, routes, config, views, translations, assets, middleware, publish tags, workbench files, and console-only behavior.
- `package-testing`: use when adding or changing package tests with Pest 4/5 and Orchestra Testbench.
- `package-release`: use when preparing changelog, release notes, tags, or GitHub release workflow changes.
- `package-compatibility`: use when reviewing code, dependencies, or CI against the PHP and Laravel support matrix.
- `package-generate-skill`: use when updating the bundled Boost skill from the package implementation, README, and examples.
- `vue-best-practices`: use for Vue components, composables, and reactivity.
- `vue-testing-best-practices`: use for Vue component and composable tests. Follow this repository's existing test setup.
- `inertia-vue-development`: use for Inertia 3 forms, navigation, props, and SSR. Read the reference supplied by the installed Vue adapter.
- `vueuse-functions`: use to select VueUse composables. Check availability in the installed VueUse version.
- `frontend-design`: use when defining the visual direction for a new interface or redesigning an existing one. Use it alongside `webawesome-design` to apply that direction with Web Awesome components and tokens.
- `webawesome`: use for Web Awesome component selection, APIs, events, slots, and Vue integration. Read `.agents/skills/webawesome/SKILL.md`.
- `webawesome-design`: use for layouts, themes, design tokens, and UI composition with Web Awesome. Read `.agents/skills/webawesome-design/SKILL.md`.

The Web Awesome and Inertia references come from the versions installed by `npm ci`. On a fresh checkout, run `composer install` before `npm ci`. Follow this repository's Vue and Vite conventions when applying the upstream examples.

## Frontend

- Front Awesome provides reusable Vue components and Laravel frontend integrations that complement Inertia. Use Web Awesome for custom elements, Tailwind CSS for utilities, and VueUse for Vue composables.
- Keep existing entries theme agnostic. Applications may explicitly opt into `tailwind.css` plus `web-awesome-tailwind` for the shared Tailwind-backed theme. The application still owns palette, typography, spacing, and mode choices through its published branding file.
- Keep reusable Web Awesome wrappers application agnostic and unstyled by default. Add classes, CSS, or visual defaults only when the user explicitly requests styling. Preserve upstream attributes, events, slots, accessibility, and source selection rather than introducing competing defaults or application policy.
- Derive public wrapper types from the installed Web Awesome declarations, omit implementation fields, and adapt listener names to Vue. Handle presence booleans explicitly so bare attributes and bound false values work before and after custom element registration. Keep runtime imports edition aware and compatible with Core and Pro.
- Let Web Awesome components inherit the application's theme classes and `--wa-*` tokens. Use Web Awesome's public styling APIs and leave theme selection and branding overrides to the application.
- Keep shared Web Awesome integrations compatible with Core and Pro. Use `#front-awesome-webawesome` for runtime component and stylesheet imports so the Front Awesome Vite plugin can select the edition for package code. Preserve direct Web Awesome imports in the consuming application.
- Register Vue global services under `$frontAwesome`. Expose a typed composable for services used in the Composition API.
- Keep Vue components and styles in `resources/js`. Export supported source paths in `package.json` and let the host application's Vite build compile them.
- Group related frontend features when possible. If a feature integrates with a specific library, put it in a directory named for that library. For example, the Web Awesome toast initializer lives at `resources/js/WebAwesome/flashToast.ts`.
- Write Vue single-file components with the Composition API and `<script setup lang="ts">`. Put the `<template>` block first and the TypeScript setup block below it.
- Install Artisan Toolbox JavaScript packages from the corresponding Composer package under `vendor/artisan-toolbox`. Run Composer before npm in development and CI.
- Keep realtime transport in Mosaicast. Build future Front Awesome integrations on the Mosaicast client and Laravel package.
- Run `npm run check`, `npm test`, and `npm run build` for frontend changes. The build exercises the Vite consumer fixture.
- Run `php vendor/bin/maintainer quality:check` for the configured PHP and frontend checks. Use Maintainer for the `1.x` release workflow.

## Shared theme maintenance

- Run `npm run theme:generate` after editing the fixed token ownership map or generator. Never edit generated `resources/js/theme/tokens.css` directly.
- Run `npm run theme:check` and `npm run test:theme` after dependency or theme changes. The latter builds real base and optional PrimeVue consumers and checks their computed browser styles. Set `CHROMIUM_EXECUTABLE` when a system Chromium installation is required.
- Review the owned and inherited token inventory and exact tested versions in `tests/theme-compatibility.json`. After reviewing upstream changes and passing all checks, refresh it with `node scripts/check-theme-compatibility.mjs --record`. A new record alone does not prove compatibility.
- Retain upstream default theme and utility imports. Keep native.css out of the shared entry and preserve the existing styles.css, web-awesome.css, and appearance:true contracts.
- Keep PrimeVue imports confined to the optional export. Its official Aura base retains component-specific behavior. Do not claim all PrimeVue colors or dimensions are shared.
- Test root and local role classes, nested modes, inversion, custom branding scopes, opposite OS mode, physical key/on pairs, semantic contrast, and wa-page mechanics. Pro requires a real licensed dependency before it can be recorded as tested.
