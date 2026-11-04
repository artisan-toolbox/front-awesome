---
name: front-awesome-development
description: Use Front Awesome Vue components in a Laravel and Inertia application with Vite, Web Awesome, Tailwind CSS, VueUse, and Mosaicast.
---

# Front Awesome development

Front Awesome provides reusable Vue components and Laravel frontend integrations that complement Inertia.

## Install and use

1. Run `composer require artisan-toolbox/front-awesome` before installing frontend dependencies.
2. Run `npm install --install-links ./vendor/artisan-toolbox/front-awesome ./vendor/artisan-toolbox/mosaicast` from the application root. Keep `install-links=true` in the application’s `.npmrc` so `npm ci` uses the same mode.
3. Configure `@vitejs/plugin-vue` with `template.compilerOptions.isCustomElement` for tags that start with `wa-`.
4. Import `@artisan-toolbox/front-awesome/styles.css` after Tailwind in the application's CSS entry. Import `@artisan-toolbox/front-awesome/web-awesome.css` from the JavaScript entry.
5. Import `@artisan-toolbox/front-awesome/components/Button.vue` from a Vue page. Pass the label through the default slot and use Web Awesome attributes such as `variant="brand"`.

The application compiles the Vue and CSS sources through Vite. For SSR, include `@artisan-toolbox/front-awesome` in `ssr.noExternal` so Vite processes the Vue files. The button loads its Web Awesome element in the browser.

## Integrations

Use the application's existing Inertia setup. For event listeners and private broadcasts, follow the Mosaicast Vue plugin documentation. Use VueUse for Vue composables as the application needs them.

[Front Awesome documentation](https://artisantoolbox.wsssoftware.com.br/packages/front-awesome/)
