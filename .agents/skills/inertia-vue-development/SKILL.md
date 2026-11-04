---
name: inertia-vue-development
description: Develop Inertia 3 integrations for Vue in Front Awesome. Use for Inertia pages, shared props, forms, navigation, deferred props, optimistic updates, and SSR.
---

# Inertia Vue development

Read the relevant section of the upstream skill at `node_modules/@inertiajs/vue3/resources/boost/skills/inertia-vue-development/SKILL.blade.php` from the repository root. The npm lockfile selects the adapter version that provides this reference. If the file is missing, run `composer install` before `npm ci`.

The source is a Laravel Boost Blade template. Read its examples as guidance. Resolve application-specific values, such as the page directory, from the host application's configuration. Use the [Inertia 3 documentation](https://inertiajs.com/docs/v3/the-basics/pages) for details or when the local reference is unavailable.

Follow Front Awesome's Vue conventions in `AGENTS.md` when adapting the examples. Keep page resolution and application setup in the host app. Put shared integration code in Front Awesome.
