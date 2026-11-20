import { execFile } from 'node:child_process';
import { mkdir, open, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { promisify } from 'node:util';
import { build, createServer, type ViteDevServer } from 'vite';
import { expect, test, vi } from 'vite-plus/test';
import { frontAwesome } from '@artisan-toolbox/front-awesome/vite';
import { createLocalization } from '../../resources/js/localization';
import {
    closeTranslationFixture,
    createTranslationFixture,
    laravelExporter,
    muteWatcherNotifications,
    readCatalog,
    writeApplicationMessage,
} from './fixtures/localization/vite';

test('exports through the real Laravel command before a clean Vite build scans JSON imports', async () => {
    const root = await createTranslationFixture();
    try {
        await mkdir(join(root, 'lang/en'), { recursive: true });
        await writeFile(
            join(root, 'lang/en/app.php'),
            "<?php return ['greeting' => 'Built by Laravel', 'welcome' => 'Welcome, :name!', 'documents' => '{0} No documents|{1} One document|[2,*] :count documents'];",
        );
        await mkdir(join(root, 'config'));
        await writeFile(
            join(root, 'config/front-awesome.php'),
            "<?php return ['locales' => ['en']];",
        );
        const result = await build({
            root,
            configFile: false,
            logLevel: 'silent',
            plugins: [frontAwesome({ translations: laravelExporter })],
            build: {
                write: false,
                minify: false,
                rolldownOptions: {
                    input: join(root, 'entry.js'),
                    preserveEntrySignatures: 'strict',
                },
            },
        });
        if (!('output' in result)) throw new Error('Expected an in-memory build.');
        const output = result.output.flatMap((item) => (item.type === 'chunk' ? [item.code] : []));
        expect(output.join('\n')).toContain('Built by Laravel');
        expect(await readCatalog(root)).toContain('front-awesome::printing.title');
        expect(await readFile(join(root, 'generated/catalog.d.ts'), 'utf8')).toContain(
            '"app.greeting": string;',
        );
        const localization = createLocalization(JSON.parse(await readCatalog(root)));
        expect(localization.locales.map(({ locale }) => locale)).toEqual(['en']);
        expect(localization.t('app.welcome', { name: 'Ana' })).toBe('Welcome, Ana!');
        expect(localization.t('app.documents', { count: 2 })).toBe('2 documents');
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test('fails a build when the exporter fails and leaves the prior catalog intact', async () => {
    const root = await createTranslationFixture();
    try {
        await mkdir(join(root, 'generated'));
        await writeFile(join(root, 'generated/catalog.json'), '{"prior":true}');
        await mkdir(join(root, 'lang/en'), { recursive: true });
        await writeFile(join(root, 'lang/en/app.php'), "<?php return ['invalid' => false];");
        await expect(
            build({
                root,
                configFile: false,
                logLevel: 'silent',
                plugins: [frontAwesome({ translations: laravelExporter })],
                build: { write: false, rolldownOptions: { input: join(root, 'entry.js') } },
            }),
        ).rejects.toThrow();
        expect(await readCatalog(root)).toBe('{"prior":true}');
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test.skipIf(process.platform !== 'win32')(
    'publishes a new catalog after a reader releases the old file',
    async () => {
        const root = await createTranslationFixture();
        const outputDir = join(root, 'generated');
        const execute = promisify(execFile);
        const exportCatalog = () =>
            execute(
                laravelExporter.php,
                [
                    laravelExporter.artisan,
                    'front-awesome:export-translations',
                    `--node=${process.execPath}`,
                    '--no-ansi',
                ],
                { cwd: root },
            );
        let publishing: Promise<unknown> | undefined;
        try {
            await writeApplicationMessage(root, 'Before replacement');
            await exportCatalog();
            await writeApplicationMessage(root, 'After replacement');

            const reader = await open(join(outputDir, 'catalog.json'), 'r');
            try {
                publishing = exportCatalog().then(
                    () => undefined,
                    (error: unknown) => error,
                );
                await expect
                    .poll(async () => (await readdir(outputDir)).length, { timeout: 10000 })
                    .toBe(3);
                await expect(
                    Promise.race([publishing, delay(150, 'still publishing')]),
                ).resolves.toBe('still publishing');
            } finally {
                await reader.close();
            }

            expect(await publishing).toBeUndefined();
            expect(await readCatalog(root)).toContain('After replacement');
            expect((await readdir(outputDir)).sort()).toEqual(['catalog.d.ts', 'catalog.json']);
        } finally {
            await publishing;
            await closeTranslationFixture(undefined, root);
        }
    },
    30000,
);

test('reports invalid executable arguments without leaving an unhandled rejection', async () => {
    const root = await createTranslationFixture();
    try {
        const plugin = frontAwesome({
            translations: {
                // @ts-expect-error Verify the error exposed to JavaScript consumers.
                php: 42,
                artisan: laravelExporter.artisan,
            },
        });
        await expect(
            build({
                root,
                configFile: false,
                logLevel: 'silent',
                plugins: [plugin],
                build: { write: false, rolldownOptions: { input: join(root, 'entry.js') } },
            }),
        ).rejects.toThrow('The "file" argument must be of type string');
    } finally {
        await closeTranslationFixture(undefined, root);
    }
});

test.each([false, true])(
    'watches missing lang creation, changes, deletion, config, errors and recovery (missed recovery event: %s)',
    async (missedRecoveryEvent) => {
        const root = await createTranslationFixture();
        let server: ViteDevServer | undefined;
        try {
            server = await createServer({
                root,
                configFile: false,
                logLevel: 'silent',
                plugins: [frontAwesome({ translations: laravelExporter })],
                server: {
                    middlewareMode: true,
                    hmr: false,
                    watch: { usePolling: true, interval: 25 },
                },
                optimizeDeps: { noDiscovery: true },
            });
            const send = vi.spyOn(server.ws, 'send');
            vi.spyOn(server.config.logger, 'error').mockImplementation(() => {});
            await server.transformRequest('/entry.js');
            await expect.poll(() => server?.watcher.getWatched()[root]).toContain('entry.js');
            await writeApplicationMessage(root, 'First change');
            await expect
                .poll(() => readCatalog(root), { timeout: 10000 })
                .toContain('First change');
            await expect
                .poll(() => send.mock.calls, { timeout: 10000 })
                .toContainEqual([{ type: 'full-reload' }]);
            await writeFile(
                join(root, 'lang/en/app.php'),
                "<?php return ['broken' => new stdClass];",
            );
            await expect
                .poll(() => send.mock.calls, { timeout: 10000 })
                .toContainEqual([expect.objectContaining({ type: 'error' })]);
            expect(await readCatalog(root)).toContain('First change');
            send.mockClear();
            await writeApplicationMessage(root, 'First change');
            await expect
                .poll(() => send.mock.calls, { timeout: 10000 })
                .toContainEqual([{ type: 'full-reload' }]);
            expect(await readCatalog(root)).toContain('First change');
            if (missedRecoveryEvent) muteWatcherNotifications(server);
            await writeApplicationMessage(root, 'Recovered');
            await expect
                .poll(async () => (await readCatalog(root)).includes('Recovered'), {
                    timeout: 10000,
                })
                .toBe(true);
            await mkdir(join(root, 'config'));
            await writeFile(
                join(root, 'config/front-awesome.php'),
                "<?php return ['exclude_keys' => ['app.*']];",
            );
            await expect
                .poll(() => readCatalog(root), { timeout: 10000 })
                .not.toContain('app.greeting');
            await rm(join(root, 'config/front-awesome.php'));
            await expect.poll(() => readCatalog(root), { timeout: 10000 }).toContain('Recovered');
            await rm(join(root, 'lang/en/app.php'));
            await expect
                .poll(() => readCatalog(root), { timeout: 10000 })
                .not.toContain('app.greeting');
        } finally {
            await closeTranslationFixture(server, root);
        }
    },
    30000,
);

test('exports language files created while Vite starts watching', async () => {
    const root = await createTranslationFixture();
    let server: ViteDevServer | undefined;
    try {
        server = await createServer({
            root,
            configFile: false,
            logLevel: 'silent',
            plugins: [
                frontAwesome({ translations: laravelExporter }),
                {
                    name: 'publish-language-files-at-startup',
                    async configResolved() {
                        await writeApplicationMessage(root, 'Created during startup');
                    },
                },
            ],
            server: { middlewareMode: true, hmr: false, watch: { usePolling: true, interval: 25 } },
            optimizeDeps: { noDiscovery: true },
        });

        await expect
            .poll(() => readCatalog(root), { timeout: 10000 })
            .toContain('Created during startup');
    } finally {
        await closeTranslationFixture(server, root);
    }
}, 30000);

test('selects literal native locale imports from the chosen installed edition without exporting Laravel', async () => {
    const root = await createTranslationFixture();
    let server: ViteDevServer | undefined;
    try {
        for (const name of ['@awesome.me/webawesome', '@web.awesome.me/webawesome-pro']) {
            const directory = join(root, 'node_modules', name);
            await mkdir(join(directory, 'dist/translations'), { recursive: true });
            await writeFile(join(directory, 'package.json'), JSON.stringify({ name }));
            await writeFile(join(directory, 'dist/translations/zh-cn.js'), 'export default {};');
        }
        for (const edition of ['core', 'pro'] satisfies Array<'core' | 'pro'>) {
            server = await createServer({
                root,
                configFile: false,
                logLevel: 'silent',
                plugins: [frontAwesome({ webAwesome: edition })],
                server: {
                    middlewareMode: true,
                    hmr: false,
                    watch: { usePolling: true, interval: 25 },
                },
                optimizeDeps: { noDiscovery: true },
            });
            const result = await server.transformRequest(
                'virtual:front-awesome/web-awesome-locales',
            );
            expect(result?.code).toContain('"zh-CN"');
            expect(result?.code).toContain(
                edition === 'core' ? '@awesome.me/webawesome' : '@web.awesome.me/webawesome-pro',
            );
            await server.close();
            server = undefined;
        }
    } finally {
        await closeTranslationFixture(server, root);
    }
});
