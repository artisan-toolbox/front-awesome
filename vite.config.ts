import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite-plus';
import { frontAwesome } from '@artisan-toolbox/front-awesome/vite';

export default defineConfig({
    root: 'tests/frontend',
    plugins: [frontAwesome(), tailwindcss(), vue()],
    build: {
        outDir: resolve(import.meta.dirname, 'build/frontend'),
        emptyOutDir: true,
    },
    fmt: {
        ignorePatterns: [
            '.agents/**',
            '.github/**',
            'AGENTS.md',
            'CHANGELOG.md',
            'CLAUDE.md',
            'LICENSE.md',
            'README.md',
            'composer.json',
            'pint.json',
            'resources/boost/**',
            'resources/js/theme/tokens.css',
        ],
        semi: true,
        singleQuote: true,
    },
    lint: {
        options: {
            denyWarnings: true,
            typeAware: true,
        },
    },
    test: {
        root: import.meta.dirname,
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    include: ['tests/frontend/**/*.test.ts'],
                    exclude: ['tests/frontend/**/*.browser.test.ts'],
                },
            },
            {
                extends: true,
                optimizeDeps: { include: ['@artisan-toolbox/mosaicast', 'vue/server-renderer'] },
                test: {
                    include: ['tests/frontend/**/*.browser.test.ts'],
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright({
                            launchOptions: { executablePath: process.env.CHROMIUM_EXECUTABLE },
                        }),
                        instances: [{ browser: 'chromium', name: 'chromium' }],
                    },
                },
            },
        ],
        coverage: {
            include: ['resources/js/**/*.{mjs,ts,vue}'],
            exclude: ['resources/js/**/*.d.ts'],
            reporter: ['text', 'html'],
            reportsDirectory: 'build/coverage/frontend',
        },
    },
});
