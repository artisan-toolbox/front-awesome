import { ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer, type ViteDevServer } from 'vite';
import { expect, test, vi } from 'vite-plus/test';
import { frontAwesome } from '@artisan-toolbox/front-awesome/vite';
import {
    closeTranslationFixture,
    controlledWatcher,
    createTranslationFixture,
    exportEvents,
    processExporter,
    readCatalog,
    writeApplicationMessage,
} from './fixtures/localization/vite';

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

test('updates the catalog when Vite misses creation and deletion events', async () => {
    const root = await createTranslationFixture();
    const directory = join(root, 'lang/en');
    const input = join(directory, 'app.json');
    const watcher = controlledWatcher();
    let server: ViteDevServer | undefined;
    try {
        server = await createServer({
            root,
            configFile: false,
            logLevel: 'silent',
            plugins: [watcher.plugin, frontAwesome({ translations: processExporter })],
            server: { middlewareMode: true, hmr: false },
            optimizeDeps: { noDiscovery: true },
        });
        await expect
            .poll(() => exportEvents(root), { timeout: 10000 })
            .toEqual(['Started {}', 'Finished {}', 'Started {}', 'Finished {}']);
        const send = vi.spyOn(server.ws, 'send');
        await mkdir(directory, { recursive: true });
        await writeFile(input, '{"greeting":"New language directory"}');

        await expect
            .poll(() => readCatalog(root), { timeout: 10000 })
            .toContain('New language directory');
        await expect.poll(() => send.mock.calls).toContainEqual([{ type: 'full-reload' }]);

        send.mockClear();
        const prev = await stat(directory);
        await rm(input);
        await utimes(directory, prev.atime, new Date('2026-01-01T00:00:00Z'));
        watcher.rawChange(directory, { prev, curr: await stat(directory) });
        await expect.poll(() => readCatalog(root), { timeout: 10000 }).toBe('{}');
        await expect.poll(() => send.mock.calls).toContainEqual([{ type: 'full-reload' }]);
    } finally {
        await closeTranslationFixture(server, root);
    }
}, 30000);

test('serializes active exports and runs a trailing export for changes during a child process', async () => {
    const root = await createTranslationFixture();
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
            plugins: [watcher.plugin, frontAwesome({ translations: processExporter })],
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
        expect(await readCatalog(root)).toBe(initial);

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
        expect(await readCatalog(root)).toBe(trailing);
    } finally {
        await rm(pause, { force: true });
        await closeTranslationFixture(server, root);
    }
}, 30000);

test('waits for an aborted exporter to exit before server close resolves', async () => {
    const root = await createTranslationFixture();
    let server: ViteDevServer | undefined;
    let closing: Promise<void> | undefined;
    try {
        await writeApplicationMessage(root, 'Initial');
        server = await createServer({
            root,
            configFile: false,
            logLevel: 'silent',
            plugins: [frontAwesome({ translations: processExporter })],
            server: { middlewareMode: true, hmr: false, watch: { usePolling: true, interval: 25 } },
            optimizeDeps: { noDiscovery: true },
        });
        await expect
            .poll(() => server?.watcher.getWatched()[join(root, 'lang/en')])
            .toContain('app.php');
        await writeFile(join(root, 'hold-export'), '1');
        await writeApplicationMessage(root, 'Active export');
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
        await closeTranslationFixture(server, root);
    }
});
