import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite-plus';
import { frontAwesome } from '@artisan-toolbox/front-awesome/vite';

export default defineConfig({
    root: 'tests/frontend',
    cacheDir: resolve(
        import.meta.dirname,
        'node_modules/.vite',
        process.env.FRONT_AWESOME_PRO ? 'pro' : 'core',
    ),
    plugins: [
        frontAwesome({ webAwesome: process.env.FRONT_AWESOME_PRO ? 'pro' : 'core' }),
        tailwindcss(),
        vue(),
    ],
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
                    include: [
                        'tests/frontend/**/*.test.ts',
                        ...(process.env.FRONT_AWESOME_PRO ? ['tests/pro/**/*.test.ts'] : []),
                    ],
                    exclude: [
                        'tests/frontend/**/*.browser.test.ts',
                        'tests/pro/**/*.browser.test.ts',
                    ],
                },
            },
            {
                extends: true,
                optimizeDeps: {
                    noDiscovery: true,
                    include: [
                        '@artisan-toolbox/mosaicast',
                        'vue/server-renderer',
                        'vue',
                        '@inertiajs/vue3',
                        'lit',
                        'vite-plus/test',
                    ],
                },
                test: {
                    include: [
                        'tests/frontend/**/*.browser.test.ts',
                        ...(process.env.FRONT_AWESOME_PRO
                            ? ['tests/pro/**/*.browser.test.ts']
                            : []),
                    ],
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
            exclude: [
                'resources/js/**/*.d.ts',
                ...(!process.env.FRONT_AWESOME_PRO
                    ? [
                          'resources/js/components/WebAwesomePro/**',
                          'resources/js/WebAwesome/proComponentProps.ts',
                          'resources/js/WebAwesome/proComponentDefinitions.ts',
                      ]
                    : []),
            ],
            reporter: ['text', 'html'],
            reportsDirectory: 'build/coverage/frontend',
        },
    },
});
