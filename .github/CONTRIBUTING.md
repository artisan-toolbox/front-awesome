# Contributing to Front Awesome

Target the `1.x` branch. Use PHP 8.5 and Node.js 24.11 or later.

## Install the development dependencies

```bash
composer install
npm ci
```

Composer installs the Mosaicast sources and its JavaScript distribution before npm resolves the local dependency.

## Validate changes

```bash
php vendor/bin/maintainer quality:check --no-interaction
composer test
npm run build
```

Run `npm run dev` to open the Vite consumer fixture. Add tests for changes to package discovery, public Vue components, or asset imports. Update the [central documentation](https://github.com/artisan-toolbox/docs) and the changelog alongside user-facing changes.
