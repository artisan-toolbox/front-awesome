import { execFile } from 'node:child_process';
import { readFileSync, statSync, unwatchFile, watchFile } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { promisify } from 'node:util';

const execute = promisify(execFile);

export function translationExport(options) {
    const settings = options === true ? {} : options;
    let cwd;
    let manifest;
    let server;
    let timer;
    let scheduledReload = false;
    let pendingExport;
    let running;
    let closed = false;
    let active;
    let lastExportFailed = false;
    const watched = new Set();
    const inputWatchers = new Map();

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
            if (server && !closed) watchPaths();
        } finally {
            await finished;
            active = undefined;
        }
    }

    function watchPaths() {
        const inputs = new Set(manifest.watchPaths);
        for (const [path, listener] of inputWatchers) {
            if (inputs.has(path)) continue;
            unwatchFile(path, listener);
            inputWatchers.delete(path);
        }

        const paths = new Set();
        for (const path of inputs) {
            if (!inputWatchers.has(path)) {
                const listener = (current, previous) => {
                    if (statsChanged(current, previous)) scheduleExport();
                };
                // Watch the input itself, including missing paths Vite cannot yet discover.
                watchFile(
                    path,
                    { persistent: false, interval: server.config.server.watch?.interval ?? 100 },
                    listener,
                );
                inputWatchers.set(path, listener);
            }
            let parent = path;
            while (
                !statSync(parent, { throwIfNoEntry: false })?.isDirectory() &&
                dirname(parent) !== parent
            )
                parent = dirname(parent);
            paths.add(parent);
        }
        const added = [];
        for (const path of [...paths].sort((first, second) => first.length - second.length)) {
            const key = pathKey(path);
            const covered = [...watched].some((directory) => {
                const root = pathKey(directory);
                return key === root || key.startsWith(root.endsWith('/') ? root : `${root}/`);
            });
            if (covered) continue;
            watched.add(path);
            added.push(path);
        }
        if (added.length) server.watcher.add(added);
    }

    async function drain() {
        while (pendingExport && !closed) {
            const reload = pendingExport.reload || lastExportFailed;
            pendingExport = undefined;
            try {
                const output = manifest.output;
                const before = reload ? undefined : readCatalog(output);
                await exportCatalog();
                if (
                    !closed &&
                    (reload || output !== manifest.output || before !== readCatalog(output))
                ) {
                    server.ws.send({ type: 'full-reload' });
                }
                lastExportFailed = false;
            } catch (error) {
                if (closed) return;
                lastExportFailed = true;
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
        if (event.includes('Dir')) watchPaths();
        scheduleExport(true);
    }

    function scheduleExport(reload = false) {
        if (closed) return;
        scheduledReload ||= reload;
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = undefined;
            pendingExport = { reload: scheduledReload || pendingExport?.reload === true };
            scheduledReload = false;
            if (!running) {
                running = drain().finally(() => {
                    running = undefined;
                });
            }
        }, 75);
    }

    function onRawChange(event, file, details) {
        if (event !== 'change') return;
        const { curr, prev } = details ?? {};
        if (!curr || !prev || !statsChanged(curr, prev)) return;
        if (curr.isFile() && prev.isFile()) {
            onChange(event, file);
        } else if (curr.isDirectory() || prev.isDirectory()) {
            const directory = pathKey(file);
            if (manifest.watchPaths.some((input) => directory.startsWith(`${pathKey(input)}/`))) {
                scheduleExport();
            }
        }
    }

    return {
        async start(root) {
            cwd = resolve(settings.cwd ?? root);
            await exportCatalog();
        },
        watch(viteServer) {
            if (viteServer.config.server.watch === null) return;
            server = viteServer;
            server.watcher.on('all', onChange);
            server.watcher.on('raw', onRawChange);
            server.watcher.once('ready', scheduleExport);
            watchPaths();
            // Vite may have finished its initial scan before this hook.
            scheduleExport();
        },
        async close() {
            closed = true;
            pendingExport = undefined;
            clearTimeout(timer);
            server?.watcher.off('all', onChange);
            server?.watcher.off('raw', onRawChange);
            server?.watcher.off('ready', scheduleExport);
            for (const [path, listener] of inputWatchers) unwatchFile(path, listener);
            inputWatchers.clear();
            active?.controller.abort();
            await active?.finished;
            await running;
        },
    };
}

function statsChanged(current, previous) {
    return (
        current.size !== previous.size ||
        current.mtimeMs !== previous.mtimeMs ||
        current.ctimeMs !== previous.ctimeMs ||
        current.ino !== previous.ino
    );
}

function readCatalog(path) {
    try {
        return readFileSync(path, 'utf8');
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
}

function pathKey(path) {
    const normalized = path.replaceAll('\\', '/');
    return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}
