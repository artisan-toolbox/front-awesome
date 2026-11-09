import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { build, createServer, normalizePath, resolveConfig, type PluginOption } from 'vite';
import { expect, test } from 'vite-plus/test';
import { frontAwesome } from '@artisan-toolbox/front-awesome/vite';

async function compileTemplate({
    plugins,
    ssr = false,
    content = '',
}: {
    plugins: PluginOption[];
    ssr?: boolean;
    content?: string;
}) {
    const entry = join(import.meta.dirname, `ViteFixture-${randomUUID()}.vue`);
    const result = await build({
        configFile: false,
        logLevel: 'silent',
        plugins: [
            ...plugins,
            {
                name: 'front-awesome-vite-fixture',
                resolveId: (id) => (id === entry ? entry : undefined),
                load: (id) =>
                    id === entry
                        ? `<template><div><wa-button>Save</wa-button><wa-page></wa-page><app-panel></app-panel><ordinary-widget></ordinary-widget>${content}</div></template>`
                        : undefined,
            },
        ],
        build: {
            write: false,
            minify: false,
            ssr,
            rolldownOptions: {
                input: entry,
                external: ['vue', 'vue/server-renderer'],
                preserveEntrySignatures: 'strict',
            },
        },
    });

    if (!('output' in result)) {
        throw new Error('Expected an in-memory Vite build.');
    }

    return result.output.map((output) => (output.type === 'chunk' ? output.code : '')).join('\n');
}

test.each([
    { ssr: false, vueFirst: false },
    { ssr: false, vueFirst: true },
    { ssr: true, vueFirst: false },
    { ssr: true, vueFirst: true },
])(
    'recognizes Web Awesome elements (SSR: $ssr, Vue first: $vueFirst)',
    async ({ ssr, vueFirst }) => {
        const plugins = vueFirst ? [vue(), frontAwesome()] : [frontAwesome(), vue()];
        const code = await compileTemplate({ plugins, ssr });

        expect(code).toContain('wa-button');
        expect(code).toContain('wa-page');
        expect(code).not.toMatch(/resolveComponent\(["']wa-/);
        expect(code).toMatch(/resolveComponent\(["']ordinary-widget["']\)/);
    },
);

test.each([
    { name: 'other custom elements', matcher: (tag: string) => tag.startsWith('app-') },
    {
        name: 'Web Awesome and other custom elements',
        matcher: (tag: string) => tag.startsWith('wa-') || tag.startsWith('app-'),
    },
])('preserves a matcher for $name', async ({ matcher }) => {
    const code = await compileTemplate({
        plugins: [
            frontAwesome(),
            vue({ template: { compilerOptions: { isCustomElement: matcher } } }),
        ],
    });

    expect(code).toContain('app-panel');
    expect(code).not.toMatch(/resolveComponent\(["'](?:wa-|app-)/);
    expect(code).toMatch(/resolveComponent\(["']ordinary-widget["']\)/);
});

test('preserves existing template and compiler options', async () => {
    const code = await compileTemplate({
        plugins: [
            frontAwesome(),
            vue({
                template: {
                    transformAssetUrls: { tags: {} },
                    compilerOptions: { comments: true },
                },
            }),
        ],
        content: '<!-- Keep this comment. --><img src="./application-owned.png">',
    });

    expect(code).toContain('Keep this comment.');
    expect(code).toContain('./application-owned.png');
    expect(code).not.toMatch(/resolveComponent\(["']wa-/);
});

test('recognizes Web Awesome elements in the development server', async () => {
    const server = await createServer({
        configFile: false,
        logLevel: 'silent',
        plugins: [frontAwesome(), vue()],
        server: { middlewareMode: true, hmr: false, watch: null },
        optimizeDeps: { noDiscovery: true },
    });

    try {
        const result = await server.transformRequest(
            '/resources/js/components/WebAwesome/Button.vue',
        );

        expect(result?.code).toContain('wa-button');
        expect(result?.code).not.toMatch(/resolveComponent\(["']wa-/);
    } finally {
        await server.close();
    }
});

test('selects an installed edition for Front Awesome and preserves direct app imports', async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'front-awesome-vite-')));
    const resolve = (plugin = frontAwesome()) =>
        resolveConfig({ root, configFile: false, plugins: [plugin] }, 'serve');
    const imports = '#front-awesome-webawesome';

    try {
        const coreConfig = await resolve();
        expect(coreConfig.resolve.alias).not.toContainEqual(
            expect.objectContaining({ find: imports }),
        );

        const core = '@awesome.me/webawesome';
        const pro = '@web.awesome.me/webawesome-pro';
        const icon = 'dist/components/icon/icon.js';
        const install = async (name: string) => {
            const directory = join(root, 'node_modules', name);
            await mkdir(join(directory, 'dist', 'components', 'icon'), { recursive: true });
            await writeFile(join(directory, 'package.json'), JSON.stringify({ name }));
            const file = join(directory, icon);
            await writeFile(file, '');
            return normalizePath(file);
        };
        const importer = join(root, 'app.ts');
        const coreIcon = await install(core);
        expect(
            await (await resolve()).createResolver()(
                `${imports}/components/icon/icon.js`,
                importer,
            ),
        ).toBe(coreIcon);

        const proIcon = await install(pro);

        const proConfig = await resolve();
        const resolveImport = proConfig.createResolver();
        expect(await resolveImport(`${imports}/components/icon/icon.js`, importer)).toBe(proIcon);
        expect(await resolveImport(`${core}/${icon}`, importer)).toBe(coreIcon);
        expect(await resolveImport(`${pro}/${icon}`, importer)).toBe(proIcon);
        expect(proConfig.optimizeDeps.exclude).toEqual(
            expect.arrayContaining(['@artisan-toolbox/front-awesome', imports, pro]),
        );

        const explicitCore = await resolve(frontAwesome({ webAwesome: 'core' }));
        expect(
            await explicitCore.createResolver()(`${imports}/components/icon/icon.js`, importer),
        ).toBe(coreIcon);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});
