import { ChildProcess } from 'node:child_process';
import {
    mkdir,
    mkdtemp,
    readFile,
    realpath,
    rename,
    rm,
    stat,
    utimes,
    writeFile,
} from 'node:fs/promises';
import { existsSync, type Stats } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { build, createServer, type Plugin, type ViteDevServer } from 'vite';
import { expect, test, vi } from 'vite-plus/test';
import { frontAwesome } from '@artisan-toolbox/front-awesome/vite';
import { createLocalization } from '../../resources/js/localization';

const php = process.env.PHP_BINARY ?? 'php';
const artisan = resolve(import.meta.dirname, 'fixtures/localization/artisan.php');
const exportProcess = resolve(import.meta.dirname, 'fixtures/localization/export-process.mjs');

async function fixture() {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'front-awesome-translations-')));
    await writeFile(join(root, 'package.json'), '{}');
    await writeFile(
        join(root, 'entry.js'),
        "import catalog from './generated/catalog.json'; export default catalog;",
    );
    return root;
}

async function text(root: string) {
    return readFile(join(root, 'generated/catalog.json'), 'utf8');
}

async function applicationMessage(root: string, value: string) {
    await mkdir(join(root, 'lang/en'), { recursive: true });
    await writeFile(join(root, 'lang/en/app.php'), `<?php return ['greeting' => '${value}'];`);
}

async function exportEvents(root: string) {
    return (await readFile(join(root, 'export-events'), 'utf8')).trim().split('\n');
}

function controlledWatcher() {
    let emit: ViteDevServer['watcher']['emit'];
    return {
        plugin: {
            name: 'control-translation-watch-notifications',
            enforce: 'pre',
            configureServer(server: ViteDevServer) {
                emit = server.watcher.emit.bind(server.watcher);
                vi.spyOn(server.watcher, 'emit').mockImplementation((event, ...args) => {
                    if (event === 'all' || event === 'raw' || event === 'ready') return false;
                    return emit(event, ...args);
                });
            },
        } satisfies Plugin,
        change(file: string) {
            emit('all', 'change', file);
        },
        rawChange(directory: string, details: { curr: Stats; prev: Stats }) {
            emit('raw', 'change', directory, details);
        },
    };
}

async function close(server: ViteDevServer | undefined, root: string) {
    await server?.close();
    await rm(root, { recursive: true, force: true });
}

function processExists(pid: number) {
    try {
        process.kill(pid, 0);
        return true;
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ESRCH') return false;
        throw error;
    }
}

function hasSpawn(value: object): value is { spawn: (...args: never[]) => unknown } {
    return 'spawn' in value && typeof value.spawn === 'function';
}

test('exports through the real Laravel command before a clean Vite build scans JSON imports', async () => {
    const root = await fixture();
    try {
        await applicationMessage(root, 'Built by Laravel');
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
            plugins: [frontAwesome({ translations: { php, artisan } })],
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
        expect(await text(root)).toContain('front-awesome::printing.title');
        expect(await readFile(join(root, 'generated/catalog.d.ts'), 'utf8')).toContain(
            '"app.greeting": string;',
        );
        const localization = createLocalization(JSON.parse(await text(root)));
        expect(localization.locales.map(({ locale }) => locale)).toEqual(['en']);
        expect(localization.t('app.welcome', { name: 'Ana' })).toBe('Welcome, Ana!');
        expect(localization.t('app.documents', { count: 2 })).toBe('2 documents');
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test('fails a build when the exporter fails and leaves the prior catalog intact', async () => {
    const root = await fixture();
    try {
        await mkdir(join(root, 'generated'));
        await writeFile(join(root, 'generated/catalog.json'), '{"prior":true}');
        await applicationMessage(root, 'Valid');
        await writeFile(join(root, 'lang/en/app.php'), "<?php return ['invalid' => false];");
        await expect(
            build({
                root,
                configFile: false,
                logLevel: 'silent',
                plugins: [frontAwesome({ translations: { php, artisan } })],
                build: { write: false, rolldownOptions: { input: join(root, 'entry.js') } },
            }),
        ).rejects.toThrow();
        expect(await text(root)).toBe('{"prior":true}');
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test('reports invalid executable arguments without leaving an unhandled rejection', async () => {
    const root = await fixture();
    try {
        const plugin = frontAwesome({
            translations: {
                // @ts-expect-error Verify the error exposed to JavaScript consumers.
                php: 42,
                artisan,
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
        await close(undefined, root);
    }
});

test('watches missing lang creation, changes, deletion, config, errors and recovery', async () => {
    const root = await fixture();
    let server: ViteDevServer | undefined;
    try {
        server = await createServer({
            root,
            configFile: false,
            logLevel: 'silent',
            plugins: [frontAwesome({ translations: { php, artisan } })],
            server: { middlewareMode: true, hmr: false, watch: { usePolling: true, interval: 25 } },
            optimizeDeps: { noDiscovery: true },
        });
        const send = vi.spyOn(server.ws, 'send');
        vi.spyOn(server.config.logger, 'error').mockImplementation(() => {});
        await server.transformRequest('/entry.js');
        await expect.poll(() => server?.watcher.getWatched()[root]).toContain('entry.js');
        await applicationMessage(root, 'First change');
        await expect.poll(() => text(root), { timeout: 10000 }).toContain('First change');
        await expect.poll(() => send.mock.calls).toContainEqual([{ type: 'full-reload' }]);
        await writeFile(join(root, 'lang/en/app.php'), "<?php return ['broken' => new stdClass];");
        await expect
            .poll(() => send.mock.calls, { timeout: 10000 })
            .toContainEqual([expect.objectContaining({ type: 'error' })]);
        expect(await text(root)).toContain('First change');
        send.mockClear();
        await applicationMessage(root, 'First change');
        await expect.poll(() => send.mock.calls).toContainEqual([{ type: 'full-reload' }]);
        expect(await text(root)).toContain('First change');
        await applicationMessage(root, 'Recovered');
        await expect.poll(() => text(root), { timeout: 10000 }).toContain('Recovered');
        await mkdir(join(root, 'config'));
        await writeFile(
            join(root, 'config/front-awesome.php'),
            "<?php return ['exclude_keys' => ['app.*']];",
        );
        await expect.poll(() => text(root), { timeout: 10000 }).not.toContain('app.greeting');
        await rm(join(root, 'config/front-awesome.php'));
        await expect.poll(() => text(root), { timeout: 10000 }).toContain('Recovered');
        await rm(join(root, 'lang/en/app.php'));
        await expect.poll(() => text(root), { timeout: 10000 }).not.toContain('app.greeting');
    } finally {
        await close(server, root);
    }
}, 30000);

test('exports language files created while Vite starts watching', async () => {
    const root = await fixture();
    let server: ViteDevServer | undefined;
    try {
        server = await createServer({
            root,
            configFile: false,
            logLevel: 'silent',
            plugins: [
                frontAwesome({ translations: { php, artisan } }),
                {
                    name: 'publish-language-files-at-startup',
                    async configResolved() {
                        await applicationMessage(root, 'Created during startup');
                    },
                },
            ],
            server: { middlewareMode: true, hmr: false, watch: { usePolling: true, interval: 25 } },
            optimizeDeps: { noDiscovery: true },
        });

        await expect.poll(() => text(root), { timeout: 10000 }).toContain('Created during startup');
    } finally {
        await close(server, root);
    }
}, 30000);

test('updates the catalog when Vite misses creation and deletion events', async () => {
    const root = await fixture();
    const directory = join(root, 'lang/en');
    const input = join(directory, 'app.json');
    const watcher = controlledWatcher();
    let server: ViteDevServer | undefined;
    try {
        server = await createServer({
            root,
            configFile: false,
            logLevel: 'silent',
            plugins: [
                watcher.plugin,
                frontAwesome({ translations: { php: process.execPath, artisan: exportProcess } }),
            ],
            server: { middlewareMode: true, hmr: false },
            optimizeDeps: { noDiscovery: true },
        });
        await expect
            .poll(() => exportEvents(root), { timeout: 10000 })
            .toEqual(['Started {}', 'Finished {}', 'Started {}', 'Finished {}']);
        const send = vi.spyOn(server.ws, 'send');
        await mkdir(directory, { recursive: true });
        await writeFile(input, '{"greeting":"New language directory"}');

        await expect.poll(() => text(root), { timeout: 10000 }).toContain('New language directory');
        await expect.poll(() => send.mock.calls).toContainEqual([{ type: 'full-reload' }]);

        send.mockClear();
        const prev = await stat(directory);
        await rm(input);
        await utimes(directory, prev.atime, new Date('2026-01-01T00:00:00Z'));
        watcher.rawChange(directory, { prev, curr: await stat(directory) });
        await expect.poll(() => text(root), { timeout: 10000 }).toBe('{}');
        await expect.poll(() => send.mock.calls).toContainEqual([{ type: 'full-reload' }]);
    } finally {
        await close(server, root);
    }
}, 30000);

test.each([false, true])(
    'watches configuration creation and directory replacement outside the Vite root (existing directory: %s)',
    async (existingDirectory) => {
        const root = await fixture();
        const client = join(root, 'client');
        const configuration = join(root, 'config');
        let server: ViteDevServer | undefined;
        try {
            await mkdir(client);
            await applicationMessage(root, 'Kept outside the Vite root');
            if (existingDirectory) await mkdir(configuration);
            server = await createServer({
                root: client,
                configFile: false,
                logLevel: 'silent',
                plugins: [frontAwesome({ translations: { php, artisan, cwd: root } })],
                server: {
                    middlewareMode: true,
                    hmr: false,
                    watch: { usePolling: true, interval: 25 },
                },
                optimizeDeps: { noDiscovery: true },
            });
            await expect
                .poll(() => server?.watcher.getWatched()[join(root, 'lang/en')])
                .toContain('app.php');
            expect(await text(root)).toContain('Kept outside the Vite root');

            if (!existingDirectory) await mkdir(configuration);
            await writeFile(
                join(configuration, 'front-awesome.php'),
                "<?php return ['exclude_keys' => ['app.*']];",
            );
            await expect.poll(() => text(root), { timeout: 10000 }).not.toContain('app.greeting');

            const replacement = join(configuration, 'front-awesome.php.tmp');
            await writeFile(replacement, '<?php return [];');
            await rename(replacement, join(configuration, 'front-awesome.php'));
            await expect
                .poll(() => text(root), { timeout: 10000 })
                .toContain('Kept outside the Vite root');
            await writeFile(
                join(configuration, 'front-awesome.php'),
                "<?php return ['exclude_keys' => ['app.*']];",
            );
            await expect.poll(() => text(root), { timeout: 10000 }).not.toContain('app.greeting');

            await rm(configuration, { recursive: true });
            await expect
                .poll(() => text(root), { timeout: 10000 })
                .toContain('Kept outside the Vite root');
            await mkdir(configuration);
            await writeFile(
                join(configuration, 'front-awesome.php'),
                "<?php return ['exclude_keys' => ['app.*']];",
            );
            await expect.poll(() => text(root), { timeout: 10000 }).not.toContain('app.greeting');
        } finally {
            await close(server, root);
        }
    },
    30000,
);

test('updates the catalog when a replacement config preserves its modification time', async () => {
    const root = await fixture();
    const configuration = join(root, 'config');
    const config = join(configuration, 'front-awesome.php');
    const replacement = join(configuration, 'front-awesome.php.tmp');
    const modified = new Date('2026-01-01T00:00:00Z');
    const accessed = new Date('2026-01-02T00:00:00Z');
    let server: ViteDevServer | undefined;
    try {
        await applicationMessage(root, 'Initially included');
        await mkdir(configuration);
        await writeFile(config, '<?php return [];');
        await utimes(config, accessed, modified);
        await writeFile(replacement, "<?php return ['exclude_keys' => ['app.*']];");
        await utimes(replacement, accessed, modified);
        server = await createServer({
            root,
            configFile: false,
            logLevel: 'silent',
            plugins: [frontAwesome({ translations: { php, artisan } })],
            server: { middlewareMode: true, hmr: false, watch: { usePolling: true, interval: 25 } },
            optimizeDeps: { noDiscovery: true },
        });
        await expect
            .poll(() => server?.watcher.getWatched()[configuration])
            .toContain('front-awesome.php');
        expect(await text(root)).toContain('Initially included');

        await rename(replacement, config);

        await expect.poll(() => text(root), { timeout: 10000 }).not.toContain('app.greeting');
    } finally {
        await close(server, root);
    }
}, 30000);

test('selects literal native locale imports from the chosen installed edition without exporting Laravel', async () => {
    const root = await fixture();
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
        await close(server, root);
    }
});

test('serializes active exports and runs a trailing export for changes during a child process', async () => {
    const root = await fixture();
    const input = join(root, 'lang/en/app.json');
    const pause = join(root, 'pause-export');
    const initial = '{"greeting":"Initial"}';
    const active = '{"greeting":"Active export"}';
    const trailing = '{"greeting":"Trailing export"}';
    const initialEvents = [
        `Started ${initial}`,
        `Finished ${initial}`,
        `Started ${initial}`,
        `Finished ${initial}`,
    ];
    const watcher = controlledWatcher();
    let server: ViteDevServer | undefined;
    try {
        await mkdir(join(root, 'lang/en'), { recursive: true });
        await writeFile(input, initial);
        server = await createServer({
            root,
            configFile: false,
            logLevel: 'silent',
            plugins: [
                watcher.plugin,
                frontAwesome({ translations: { php: process.execPath, artisan: exportProcess } }),
            ],
            server: { middlewareMode: true, hmr: false },
            optimizeDeps: { noDiscovery: true },
        });
        await expect.poll(() => exportEvents(root), { timeout: 10000 }).toEqual(initialEvents);
        await writeFile(pause, '');
        await writeFile(input, active);
        watcher.change(input);
        await expect
            .poll(() => exportEvents(root), { timeout: 10000 })
            .toEqual([...initialEvents, `Started ${active}`]);
        expect(await text(root)).toBe(initial);

        await writeFile(input, trailing);
        const launcher = ChildProcess.prototype;
        if (!hasSpawn(launcher)) {
            throw new Error('Expected the Node child process launcher.');
        }
        const spawn = vi.spyOn(launcher, 'spawn');
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        try {
            watcher.change(input);
            await vi.runOnlyPendingTimersAsync();
            expect(spawn).not.toHaveBeenCalled();
        } finally {
            vi.useRealTimers();
            spawn.mockRestore();
        }
        await rm(pause);

        await expect
            .poll(() => exportEvents(root), { timeout: 10000 })
            .toEqual([
                ...initialEvents,
                `Started ${active}`,
                `Finished ${active}`,
                `Started ${trailing}`,
                `Finished ${trailing}`,
            ]);
        expect(await text(root)).toBe(trailing);
    } finally {
        await rm(pause, { force: true });
        await close(server, root);
    }
}, 30000);

test('waits for an aborted exporter to exit before server close resolves', async () => {
    const root = await fixture();
    let server: ViteDevServer | undefined;
    let closing: Promise<void> | undefined;
    try {
        await applicationMessage(root, 'Initial');
        server = await createServer({
            root,
            configFile: false,
            logLevel: 'silent',
            plugins: [
                frontAwesome({ translations: { php: process.execPath, artisan: exportProcess } }),
            ],
            server: { middlewareMode: true, hmr: false, watch: { usePolling: true, interval: 25 } },
            optimizeDeps: { noDiscovery: true },
        });
        await expect
            .poll(() => server?.watcher.getWatched()[join(root, 'lang/en')])
            .toContain('app.php');
        await writeFile(join(root, 'hold-export'), '1');
        await applicationMessage(root, 'Active export');
        await expect.poll(() => existsSync(join(root, 'export-pid'))).toBe(true);
        const pid = Number(await readFile(join(root, 'export-pid'), 'utf8'));
        expect(pid).toBeGreaterThan(0);
        const send = vi.spyOn(server.ws, 'send');
        let runningAtClose = true;
        closing = server.close().then(() => {
            runningAtClose = processExists(pid);
        });
        await expect
            .poll(() => existsSync(join(root, 'export-stopping')) || !processExists(pid))
            .toBe(true);
        await rm(join(root, 'hold-export'));
        await closing;
        expect(runningAtClose).toBe(false);
        expect(send.mock.calls).not.toContainEqual([expect.objectContaining({ type: 'error' })]);
    } finally {
        await rm(join(root, 'hold-export'), { force: true });
        await closing;
        await close(server, root);
    }
});
