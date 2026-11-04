import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';
import { frontAwesome } from '@artisan-toolbox/front-awesome/vite';

export default defineConfig({
    root: 'tests/frontend',
    plugins: [
        frontAwesome(),
        tailwindcss(),
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith('wa-'),
                },
            },
        }),
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
        include: ['tests/frontend/**/*.test.ts'],
        coverage: {
            include: ['resources/js/**/*.{mjs,ts,vue}'],
            exclude: ['resources/js/**/*.d.ts'],
            reporter: ['text'],
        },
    },
});
