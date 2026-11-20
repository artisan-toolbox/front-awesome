import { unwatchFile } from 'node:fs';
import { mkdir, rename, rm, utimes, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer, type ViteDevServer } from 'vite';
import { expect, test, vi } from 'vite-plus/test';
import { frontAwesome } from '@artisan-toolbox/front-awesome/vite';
import {
    closeTranslationFixture,
    controlledWatcher,
    createTranslationFixture,
    laravelExporter,
    readCatalog,
    writeApplicationMessage,
} from './fixtures/localization/vite';

test.each([false, true])(
    'watches configuration creation and directory replacement outside the Vite root (existing directory: %s)',
    async (existingDirectory) => {
        const root = await createTranslationFixture();
        const client = join(root, 'client');
        const configuration = join(root, 'config');
        let server: ViteDevServer | undefined;
        try {
            await mkdir(client);
            await writeApplicationMessage(root, 'Kept outside the Vite root');
            if (existingDirectory) await mkdir(configuration);
            server = await createServer({
                root: client,
                configFile: false,
                logLevel: 'silent',
                plugins: [frontAwesome({ translations: { ...laravelExporter, cwd: root } })],
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
            expect(await readCatalog(root)).toContain('Kept outside the Vite root');

            if (!existingDirectory) await mkdir(configuration);
            await writeFile(
                join(configuration, 'front-awesome.php'),
                "<?php return ['exclude_keys' => ['app.*']];",
            );
            await expect
                .poll(() => readCatalog(root), { timeout: 10000 })
                .not.toContain('app.greeting');

            const replacement = join(configuration, 'front-awesome.php.tmp');
            await writeFile(replacement, '<?php return [];');
            await rename(replacement, join(configuration, 'front-awesome.php'));
            await expect
                .poll(() => readCatalog(root), { timeout: 10000 })
                .toContain('Kept outside the Vite root');
            await writeFile(
                join(configuration, 'front-awesome.php'),
                "<?php return ['exclude_keys' => ['app.*']];",
            );
            await expect
                .poll(() => readCatalog(root), { timeout: 10000 })
                .not.toContain('app.greeting');

            await rm(configuration, { recursive: true });
            await expect
                .poll(() => readCatalog(root), { timeout: 10000 })
                .toContain('Kept outside the Vite root');
            await mkdir(configuration);
            await writeFile(
                join(configuration, 'front-awesome.php'),
                "<?php return ['exclude_keys' => ['app.*']];",
            );
            await expect
                .poll(() => readCatalog(root), { timeout: 10000 })
                .not.toContain('app.greeting');
        } finally {
            await closeTranslationFixture(server, root);
        }
    },
    30000,
);

test('updates a replaced config outside the Vite root after shared polling stops', async () => {
    const root = await createTranslationFixture();
    const client = join(root, 'client');
    const config = join(root, 'config/front-awesome.php');
    const replacement = `${config}.tmp`;
    const watcher = controlledWatcher();
    let server: ViteDevServer | undefined;
    try {
        await mkdir(client);
        await writeApplicationMessage(root, 'Included after config replacement');
        server = await createServer({
            root: client,
            configFile: false,
            logLevel: 'silent',
            plugins: [
                watcher.plugin,
                frontAwesome({ translations: { ...laravelExporter, cwd: root } }),
            ],
            server: { middlewareMode: true, hmr: false, watch: { usePolling: true, interval: 25 } },
            optimizeDeps: { noDiscovery: true },
        });

        const send = vi.spyOn(server.ws, 'send');
        await mkdir(join(root, 'config'));
        await writeFile(config, "<?php return ['exclude_keys' => ['app.*']];");
        await expect
            .poll(() => readCatalog(root), { timeout: 10000 })
            .not.toContain('app.greeting');
        await expect.poll(() => send.mock.calls).toContainEqual([{ type: 'full-reload' }]);

        send.mockClear();
        unwatchFile(config);
        await writeFile(replacement, '<?php return [];');
        await rename(replacement, config);

        await expect
            .poll(
                async () => (await readCatalog(root)).includes('Included after config replacement'),
                {
                    timeout: 10000,
                },
            )
            .toBe(true);
        await expect.poll(() => send.mock.calls).toContainEqual([{ type: 'full-reload' }]);
    } finally {
        await closeTranslationFixture(server, root);
    }
}, 30000);

test('updates the catalog when a replacement config preserves its modification time', async () => {
    const root = await createTranslationFixture();
    const configuration = join(root, 'config');
    const config = join(configuration, 'front-awesome.php');
    const replacement = join(configuration, 'front-awesome.php.tmp');
    const modified = new Date('2026-01-01T00:00:00Z');
    const accessed = new Date('2026-01-02T00:00:00Z');
    let server: ViteDevServer | undefined;
    try {
        await writeApplicationMessage(root, 'Initially included');
        await mkdir(configuration);
        await writeFile(config, '<?php return [];');
        await utimes(config, accessed, modified);
        await writeFile(replacement, "<?php return ['exclude_keys' => ['app.*']];");
        await utimes(replacement, accessed, modified);
        server = await createServer({
            root,
            configFile: false,
            logLevel: 'silent',
            plugins: [frontAwesome({ translations: laravelExporter })],
            server: { middlewareMode: true, hmr: false, watch: { usePolling: true, interval: 25 } },
            optimizeDeps: { noDiscovery: true },
        });
        await expect
            .poll(() => server?.watcher.getWatched()[configuration])
            .toContain('front-awesome.php');
        expect(await readCatalog(root)).toContain('Initially included');

        await rename(replacement, config);

        await expect
            .poll(() => readCatalog(root), { timeout: 10000 })
            .not.toContain('app.greeting');
    } finally {
        await closeTranslationFixture(server, root);
    }
}, 30000);
