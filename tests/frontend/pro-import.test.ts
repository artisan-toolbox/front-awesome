import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { build } from 'vite-plus';
import { expect, test } from 'vite-plus/test';
import { frontAwesome } from '@artisan-toolbox/front-awesome/vite';

test('reports the missing licensed dependency when a consumer imports a Pro-only wrapper', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'front-awesome-missing-pro-'));
    try {
        await writeFile(
            resolve(directory, 'package.json'),
            '{"name":"missing-pro-consumer","type":"module"}',
        );
        const entry = resolve(directory, 'entry.ts');
        const component = resolve(
            import.meta.dirname,
            '../../resources/js/components/WebAwesomePro/DatePicker.vue',
        );
        await writeFile(
            entry,
            `export { default as DatePicker } from ${JSON.stringify(component)};`,
        );
        await expect(
            build({
                root: directory,
                configFile: false,
                logLevel: 'silent',
                plugins: [frontAwesome(), vue()],
                build: {
                    write: false,
                    lib: { entry, formats: ['es'] },
                    rollupOptions: { external: ['vue'] },
                },
            }),
        ).rejects.toThrow('Front Awesome date-picker requires Web Awesome Pro');
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});

test('builds a Core barrel consumer without resolving the optional Pro component graph', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'front-awesome-core-only-'));
    try {
        await writeFile(
            resolve(directory, 'package.json'),
            '{"name":"core-only-consumer","type":"module"}',
        );
        const entry = resolve(directory, 'entry.ts');
        const barrel = resolve(
            import.meta.dirname,
            '../../resources/js/components/WebAwesome/index.ts',
        );
        await writeFile(
            entry,
            `export { Checkbox, Select, Dropdown } from ${JSON.stringify(barrel)};`,
        );
        await expect(
            build({
                root: directory,
                configFile: false,
                logLevel: 'silent',
                plugins: [
                    frontAwesome({ webAwesome: 'core' }),
                    {
                        name: 'require-core-only',
                        enforce: 'pre',
                        resolveId(source) {
                            if (
                                source.includes('webawesome-pro') ||
                                source.includes('WebAwesomePro')
                            )
                                throw new Error('Core imports requested Pro');
                        },
                    },
                    vue(),
                ],
                build: {
                    write: false,
                    lib: { entry, formats: ['es'] },
                    rollupOptions: { external: ['vue'] },
                },
            }),
        ).resolves.toBeDefined();
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});
