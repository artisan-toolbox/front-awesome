import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { build, createServer, type ViteDevServer } from 'vite';
import { expect, test, vi } from 'vite-plus/test';
import { frontAwesome } from '@artisan-toolbox/front-awesome/vite';
import { createLocalization } from '../../resources/js/localization';

const php = process.env.PHP_BINARY ?? 'php';
const artisan = resolve(import.meta.dirname, 'fixtures/localization/artisan.php');

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

async function close(server: ViteDevServer | undefined, root: string) {
    await server?.close();
    await rm(root, { recursive: true, force: true });
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
    let server: ViteDevServer | undefined;
    try {
        await applicationMessage(root, 'Initial');
        server = await createServer({
            root,
            configFile: false,
            logLevel: 'silent',
            plugins: [frontAwesome({ translations: { php, artisan } })],
            server: { middlewareMode: true, hmr: false, watch: { usePolling: true, interval: 25 } },
            optimizeDeps: { noDiscovery: true },
        });
        await writeFile(join(root, 'delay-export'), '1');
        await expect
            .poll(() => server?.watcher.getWatched()[join(root, 'lang/en')])
            .toContain('app.php');
        await applicationMessage(root, 'Active export');
        await expect.poll(() => text(root), { timeout: 10000 }).toContain('Active export');
        await applicationMessage(root, 'Trailing export');
        await expect.poll(() => text(root), { timeout: 10000 }).toContain('Trailing export');
        expect((await readFile(join(root, 'export-runs'), 'utf8')).trim().split('\n')).toHaveLength(
            2,
        );
        await expect(readFile(join(root, 'overlapping-export'), 'utf8')).rejects.toThrow();
    } finally {
        await close(server, root);
    }
});
