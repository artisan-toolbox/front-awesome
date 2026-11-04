<!-- MAINTAINER:README_HEAD:START -->
<div id="maintainer-title" align="center">
    <img src="logo/front-awesome-icon.svg" alt="" width="88">
    <h1>Front Awesome</h1>
</div>

<p id="maintainer-badges" align="center">
<a href="https://github.com/artisan-toolbox/front-awesome/releases"><img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="version"></a>
<a href="https://packagist.org/packages/artisan-toolbox/front-awesome"><img src="https://img.shields.io/packagist/php-v/artisan-toolbox/front-awesome.svg?style=flat-square" alt="PHP from Packagist"></a>
<a href="https://github.com/artisan-toolbox/front-awesome/actions"><img src="https://img.shields.io/github/actions/workflow/status/artisan-toolbox/front-awesome/tests.yml?branch=1.x&amp;label=Tests&amp;style=flat-square" alt="Tests"></a>
</p>

<p id="maintainer-description" align="center">
    Reusable Vue components and frontend integrations for Laravel and Inertia applications.
</p>
<!-- MAINTAINER:README_HEAD:END -->

## Installation

From a Laravel application with Inertia and Vue, run Composer before npm.

```bash
composer require artisan-toolbox/front-awesome
npm install --install-links ./vendor/artisan-toolbox/front-awesome ./vendor/artisan-toolbox/mosaicast
```

The initial `1.x` release is in development. It targets PHP 8.5, Laravel 13, Vue 3.5, Inertia 3, Tailwind CSS 4, and Node.js 24.11 or later.

## Usage

After configuring Vite and loading the package styles, import the button in a Vue page.

```vue
<template>
  <Button variant="brand">Save changes</Button>
</template>

<script setup lang="ts">
import Button from '@artisan-toolbox/front-awesome/components/Button.vue';
</script>
```

## Resources

- [Documentation](https://artisantoolbox.wsssoftware.com.br/packages/front-awesome/)
- [Changelog](CHANGELOG.md)
- [Contributing](.github/CONTRIBUTING.md)
- [Security policy](.github/SECURITY.md)
- [License](LICENSE.md)
