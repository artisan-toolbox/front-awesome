import { type Stats } from 'node:fs';
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { type Plugin, type ViteDevServer } from 'vite';
import { vi } from 'vite-plus/test';

export const laravelExporter = {
    php: process.env.PHP_BINARY ?? 'php',
    artisan: resolve(import.meta.dirname, 'artisan.php'),
};

export const processExporter = {
    php: process.execPath,
    artisan: resolve(import.meta.dirname, 'export-process.mjs'),
};

export async function createTranslationFixture() {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'front-awesome-translations-')));
    await writeFile(join(root, 'package.json'), '{}');
    await writeFile(
        join(root, 'entry.js'),
        "import catalog from './generated/catalog.json'; export default catalog;",
    );
    return root;
}

export async function readCatalog(root: string) {
    return readFile(join(root, 'generated/catalog.json'), 'utf8');
}

export async function writeApplicationMessage(root: string, value: string) {
    await mkdir(join(root, 'lang/en'), { recursive: true });
    await writeFile(join(root, 'lang/en/app.php'), `<?php return ['greeting' => '${value}'];`);
}

export async function exportEvents(root: string) {
    return (await readFile(join(root, 'export-events'), 'utf8')).trim().split('\n');
}

export function controlledWatcher() {
    let emit: ViteDevServer['watcher']['emit'];
    return {
        plugin: {
            name: 'control-translation-watch-notifications',
            enforce: 'pre',
            configureServer(server: ViteDevServer) {
                emit = muteWatcherNotifications(server);
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

export function muteWatcherNotifications(server: ViteDevServer) {
    const emit = server.watcher.emit.bind(server.watcher);
    vi.spyOn(server.watcher, 'emit').mockImplementation((event, ...args) => {
        if (event === 'all' || event === 'raw' || event === 'ready') return false;
        return emit(event, ...args);
    });
    return emit;
}

export async function closeTranslationFixture(server: ViteDevServer | undefined, root: string) {
    await server?.close();
    await rm(root, { recursive: true, force: true });
}
