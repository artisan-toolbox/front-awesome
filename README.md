<!-- MAINTAINER:README_HEAD:START -->
<div id="maintainer-title" align="center">
    <img src="logo/front-awesome-icon.svg" alt="" width="88">
    <h1>Front Awesome</h1>
</div>

<p id="maintainer-badges" align="center">
<a href="https://github.com/artisan-toolbox/front-awesome/releases"><img src="https://img.shields.io/badge/Release-in%20development-lightgrey?style=flat-square" alt="Release"></a>
<a href="https://atb.dev.br/packages/front-awesome/"><img src="https://img.shields.io/badge/PHP-%5E8.5-777BB4?style=flat-square" alt="PHP"></a>
<a href="https://atb.dev.br/packages/front-awesome/"><img src="https://img.shields.io/badge/Laravel-13-FF2D20?style=flat-square" alt="Laravel"></a>
<a href="https://atb.dev.br/packages/front-awesome/"><img src="https://img.shields.io/badge/Node.js-%3E%3D24.11.0-339933?style=flat-square" alt="Node.js"></a>
<a href="https://github.com/artisan-toolbox/front-awesome/actions/workflows/tests.yml?query=branch%3A1.x"><img src="https://img.shields.io/github/actions/workflow/status/artisan-toolbox/front-awesome/tests.yml?branch=1.x&amp;label=Tests&amp;style=flat-square" alt="Tests"></a>
<a href="https://atb.dev.br/packages/front-awesome/"><img src="https://img.shields.io/badge/Docs-Read-blue?style=flat-square" alt="Docs"></a>
</p>

<p id="maintainer-description" align="center">
    Reusable Vue components and frontend integrations for Laravel and Inertia applications.
</p>
<!-- MAINTAINER:README_HEAD:END -->

## Installation

From a Laravel application with Inertia and Vue, run Composer before npm.

Declare `@artisan-toolbox/mosaicast` in your application's `package.json` to satisfy Front Awesome's JavaScript peer dependency. The npm command below adds both frontend packages from Composer's vendor directory.

```bash
composer require artisan-toolbox/front-awesome
npm install --install-links ./vendor/artisan-toolbox/front-awesome ./vendor/artisan-toolbox/mosaicast
```

The initial `1.x` release is in development. It targets PHP 8.5, Laravel 13, Vue 3.5, Inertia 3, Tailwind CSS 4, and Node.js 24.11 or later.

## Usage

After configuring Vite and loading the package styles, import the button in a Vue page. For shared Tailwind, Web Awesome, and optional PrimeVue branding, follow the [shared theme guide](https://atb.dev.br/packages/front-awesome/shared-theme/).

```vue
<template>
  <Button variant="brand">Save changes</Button>
</template>

<script setup lang="ts">
import Button from '@artisan-toolbox/front-awesome/components/Button.vue';
</script>
```

## Resources

- [Documentation](https://atb.dev.br/packages/front-awesome/)
- [Changelog](CHANGELOG.md)
- [Contributing](.github/CONTRIBUTING.md)
- [Security policy](.github/SECURITY.md)
- [License](LICENSE.md)
