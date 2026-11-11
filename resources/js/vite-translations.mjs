import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { promisify } from 'node:util';

const execute = promisify(execFile);

export function translationExport(options) {
    const settings = options === true ? {} : options;
    let cwd;
    let manifest;
    let server;
    let timer;
    let pending = false;
    let running;
    let closed = false;
    let active;
    const watched = new Set();

    async function exportCatalog() {
        const controller = new AbortController();
        const execution = execute(
            settings.php ?? process.env.PHP_BINARY ?? 'php',
            [
                settings.artisan ?? 'artisan',
                'front-awesome:export-translations',
                '--manifest',
                `--node=${process.execPath}`,
                '--no-ansi',
                '--no-interaction',
            ],
            { cwd, signal: controller.signal, maxBuffer: 1024 * 1024 },
        );
        const finished = execution.child
            ? new Promise((resolve) => execution.child.once('close', resolve))
            : Promise.resolve();
        active = { controller, finished };
        try {
            const { stdout } = await execution;
            const parsed = JSON.parse(stdout.trim());
            if (
                !parsed ||
                typeof parsed.output !== 'string' ||
                typeof parsed.types !== 'string' ||
                !Array.isArray(parsed.watchPaths) ||
                !parsed.watchPaths.every((path) => typeof path === 'string')
            ) {
                throw new Error('Front Awesome translation export returned an invalid manifest.');
            }
            manifest = parsed;
            if (server) watchPaths();
        } finally {
            await finished;
            active = undefined;
        }
    }

    function watchPaths() {
        const paths = new Set(manifest.watchPaths);
        for (const path of manifest.watchPaths) {
            let parent = path;
            while (!existsSync(parent) && dirname(parent) !== parent) parent = dirname(parent);
            paths.add(parent);
        }
        const added = [...paths].filter((path) => !watched.has(path));
        for (const path of added) watched.add(path);
        if (added.length) server.watcher.add(added);
    }

    async function drain() {
        while (pending && !closed) {
            pending = false;
            try {
                await exportCatalog();
                if (!closed) server.ws.send({ type: 'full-reload' });
            } catch (error) {
                if (closed) return;
                const message = `Front Awesome translation export failed. ${error.message}${error.stdout ? `\n${error.stdout}` : ''}`;
                server.config.logger.error(message);
                server.ws.send({ type: 'error', err: { message, stack: error.stack ?? '' } });
            }
        }
    }

    function onChange(event, file) {
        const path = pathKey(isAbsolute(file) ? file : resolve(cwd, file));
        const affected = manifest.watchPaths.some((watchPath) => {
            const root = pathKey(watchPath);
            return path === root || path.startsWith(`${root}/`) || root.startsWith(`${path}/`);
        });
        if (!affected || (!event.includes('Dir') && !/\.(php|json)$/.test(path))) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
            pending = true;
            if (!running) {
                running = drain().finally(() => {
                    running = undefined;
                });
            }
        }, 75);
    }

    return {
        async start(root) {
            cwd = resolve(settings.cwd ?? root);
            await exportCatalog();
        },
        watch(viteServer) {
            server = viteServer;
            watchPaths();
            server.watcher.on('all', onChange);
        },
        async close() {
            closed = true;
            pending = false;
            clearTimeout(timer);
            server?.watcher.off('all', onChange);
            active?.controller.abort();
            await active?.finished;
            await running;
        },
    };
}

function pathKey(path) {
    const normalized = path.replaceAll('\\', '/');
    return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}
