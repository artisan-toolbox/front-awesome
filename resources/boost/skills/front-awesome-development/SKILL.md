---
name: front-awesome-development
description: Use Front Awesome Vue components in a Laravel and Inertia application with Vite, Web Awesome, Tailwind CSS, VueUse, and Mosaicast.
---

# Front Awesome development

Front Awesome provides reusable Vue components and Laravel frontend integrations that complement Inertia.

## Install and use

1. Run `composer require artisan-toolbox/front-awesome` before installing frontend dependencies.
2. Declare both frontend packages in the application's `package.json`. Mosaicast is a peer dependency of Front Awesome. Run `npm install --install-links ./vendor/artisan-toolbox/front-awesome ./vendor/artisan-toolbox/mosaicast` from the application root. Keep `install-links=true` in the application's `.npmrc` so `npm ci` uses the same mode.
3. Configure `@vitejs/plugin-vue` with `template.compilerOptions.isCustomElement` for tags that start with `wa-`.
4. Import `@artisan-toolbox/front-awesome/styles.css` after Tailwind in the application's CSS entry. If the application needs the standard Web Awesome stylesheet, import `@artisan-toolbox/front-awesome/web-awesome.css` from the JavaScript entry.
5. Import `@artisan-toolbox/front-awesome/components/Button.vue` from a Vue page. Pass the label through the default slot and use Web Awesome attributes such as `variant="brand"`.

The application compiles the Vue and CSS sources through Vite. For SSR, include `@artisan-toolbox/front-awesome` in `ssr.noExternal` so Vite processes the Vue files. The button loads its Web Awesome element in the browser.

Use the application's Web Awesome theme and `--wa-*` tokens. Keep theme selection and token overrides in the application.

Add `frontAwesome()` from `@artisan-toolbox/front-awesome/vite` to the application's Vite plugins. It uses `@web.awesome.me/webawesome-pro` for Front Awesome imports when the application has Pro installed and uses Core otherwise. Keep the application's direct Web Awesome imports pointed at the edition it uses.

## Integrations

Import `createFrontAwesome` from `@artisan-toolbox/front-awesome` and register it with `app.use(createFrontAwesome())` in Inertia's `withApp` hook. It registers Mosaicast, adds the Web Awesome toast stack to `document.body`, and listens for Mosaicast events and Inertia flash. To receive private broadcasts, pass the configured Echo instance in `createFrontAwesome({ mosaicast: { echo } })`.

To show a toast from Vue, import `useToast` from `@artisan-toolbox/front-awesome` and call `useToast().show(message, options)` from a component. Use `$frontAwesome.toast.show(message, options)` in templates or `this.$frontAwesome.toast.show(message, options)` in the Options API. Front Awesome registers its Vue global services under `$frontAwesome`.

The root package import provides the Vue types. If a separate TypeScript project does not include the app entry point, import `@artisan-toolbox/front-awesome` in a `.d.ts` file included in that project. See the documentation for editor and ESLint setup.

In Laravel, use the `ArtisanToolbox\FrontAwesome\Facades\Toast` methods `brand($message)`, `success($message)`, `warning($message)`, `danger($message)`, or `neutral($message)` to start a toast factory. Chain `duration()`, `icon()`, `size()`, or `allowHtml()` to set options. Finish with `dispatch()` for Mosaicast or `flash()` for the next Inertia response after a redirect. For example, use `Toast::success($message)->flash()`. Use `WebAwesome\Size` for size and a `WebAwesome\ToastIcon` for structured icons. Enable HTML only for trusted markup.

To change the default icons for toasts sent from Laravel, run `php artisan vendor:publish --tag=front-awesome-config` and edit `webawesome.toast.icons` in `config/front-awesome.php`. Set a variant to `null` to disable its default. An explicit toast icon takes priority. For toasts created in Vue, pass `icon` to `show()` when you want one.

[Front Awesome documentation](https://artisantoolbox.wsssoftware.com.br/packages/front-awesome/)
