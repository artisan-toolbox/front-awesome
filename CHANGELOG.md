# Changelog

## Unreleased

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
