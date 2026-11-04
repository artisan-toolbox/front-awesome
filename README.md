# Front Awesome

Front Awesome provides reusable Vue components and frontend integrations for Laravel and Inertia applications. It uses Web Awesome and Tailwind CSS for UI, VueUse for Vue composables, and Mosaicast for event delivery integrations.

## Install

```bash
composer require artisan-toolbox/front-awesome
npm install --install-links ./vendor/artisan-toolbox/front-awesome ./vendor/artisan-toolbox/mosaicast
```

After configuring Vite and loading the package styles, import a component in a Vue page.

```vue
<script setup>
import Button from '@artisan-toolbox/front-awesome/components/Button.vue'
</script>

<template>
  <Button variant="brand">Save changes</Button>
</template>
```

The initial `1.x` line targets PHP 8.5, Laravel 13, Vue 3.5, Inertia 3, and Tailwind CSS 4. The first release is in development.

[Documentation](https://artisantoolbox.wsssoftware.com.br/packages/front-awesome/) · [Contributing](.github/CONTRIBUTING.md) · [Security](.github/SECURITY.md) · [Changelog](CHANGELOG.md) · [License](LICENSE.md)
