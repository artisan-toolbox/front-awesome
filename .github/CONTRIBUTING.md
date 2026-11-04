# Contributing to Front Awesome

Target the `1.x` branch. Use PHP 8.5 and Node.js 24.11 or later.

## Install the development dependencies

```bash
composer install
npm ci
```

Composer installs the Mosaicast sources and its JavaScript distribution before npm resolves the local dependency.

## Use and update the agent skills

- `vue-best-practices` and `vue-testing-best-practices` are snapshots of [Vue AI Skills](https://github.com/vuejs-ai/skills/tree/198f0cd8f7f9c0a3d9b566ccc16de6677519ee78).
- `vueuse-functions` is a snapshot for VueUse 14.4.0, the version in the npm lockfile. [VueUse Skills revision](https://github.com/vueuse/skills/tree/5706f866118f04a6238bf77368dafa4a2c34b96b)
- `inertia-vue-development` points to the Boost skill template in the installed Inertia Vue adapter. [Inertia Vue skill source](https://github.com/inertiajs/inertia/tree/3.x/packages/vue3/resources/boost/skills/inertia-vue-development)
- `frontend-design` is an Apache 2.0 snapshot for visual direction and typography. Apply it alongside `webawesome-design` when building or redesigning an interface. [Anthropic Frontend Design revision](https://github.com/anthropics/skills/tree/41bbe19d1a1a7eaab5e7bb9050a417e5c6cffc8f/skills/frontend-design)
- `webawesome` and `webawesome-design` link to the skills in the installed Web Awesome package. [Web Awesome agent skills](https://webawesome.com/docs/ai/agent-skills)

When updating a snapshot, replace its directory under `.agents/skills/` with the complete upstream skill, retain its license, and update the revision above. When updating VueUse, select the revision that matches the version in the lockfile.

## Write Vue components

Use the Composition API with `<script setup lang="ts">` in every Vue single-file component. Put `<template>` first and the TypeScript setup block below it.

## Validate changes

```bash
php vendor/bin/maintainer quality:check --no-interaction
composer test
npm run build
```

Run `npm run dev` to open the Vite consumer fixture. Add tests for changes to package discovery, public Vue components, or asset imports. Update the [central documentation](https://github.com/artisan-toolbox/docs) and the changelog alongside user-facing changes.
