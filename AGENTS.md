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

## Frontend

- Front Awesome provides reusable Vue components and Laravel frontend integrations that complement Inertia. Use Web Awesome for custom elements, Tailwind CSS for utilities, and VueUse for Vue composables.
- Keep Vue components and styles in `resources/js`. Export supported source paths in `package.json` and let the host application's Vite build compile them.
- Install Artisan Toolbox JavaScript packages from the corresponding Composer package under `vendor/artisan-toolbox`. Run Composer before npm in development and CI.
- Keep realtime transport in Mosaicast. Build future Front Awesome integrations on the Mosaicast client and Laravel package.
- Run `npm run check`, `npm test`, and `npm run build` for frontend changes. The build exercises the Vite consumer fixture.
- Run `php vendor/bin/maintainer quality:check` for the configured PHP and frontend checks. Use Maintainer for the `1.x` release workflow.
