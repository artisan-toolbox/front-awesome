import {
    getAnimationNames,
    getEasingNames,
} from '#front-awesome-webawesome/utilities/animation.js';
import { allDefined } from '#front-awesome-webawesome/utilities/defined.js';
import { getIconPath, setIconPath } from '#front-awesome-webawesome/utilities/base-path.js';
import {
    registerIconLibrary,
    unregisterIconLibrary,
    getIconLibrary,
} from '#front-awesome-webawesome/components/icon/library.js';
import { getIconFolder } from '#front-awesome-webawesome/components/icon/library.default.js';
import { html } from 'lit';

const upstream = {
    getAnimationNames,
    getEasingNames,
    allDefined,
    getIconPath,
    setIconPath,
    registerIconLibrary,
    unregisterIconLibrary,
    getIconFolder,
};
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

export function scenarioScripts() {
    const listeners: Array<() => void> = [];
    const timers = new Map<number, () => void>();
    const pending = new Set<Promise<void>>();
    const libraries = new Set<string>();
    const defaultIconLibrary = getIconLibrary('default');
    const systemIconLibrary = getIconLibrary('system');
    const iconPath = upstream.getIconPath();
    const intervalHandles = new Set<number>();

    function schedule(callback: TimerHandler, delay = 0, ...args: unknown[]) {
        if (typeof callback !== 'function')
            throw new Error('Upstream fixture timers require callbacks.');
        let finish = () => {};
        const completion = new Promise<void>((resolve) => {
            finish = resolve;
        });
        pending.add(completion);
        const handle = window.setTimeout(() => {
            try {
                callback(...args);
            } finally {
                timers.delete(handle);
                pending.delete(completion);
                finish();
            }
        }, delay);
        timers.set(handle, () => {
            window.clearTimeout(handle);
            pending.delete(completion);
            finish();
        });
        return handle;
    }

    function scopedDocument(root: HTMLElement) {
        return new Proxy(document, {
            get(target, key) {
                if (key === 'querySelector') return root.querySelector.bind(root);
                if (key === 'querySelectorAll') return root.querySelectorAll.bind(root);
                if (key === 'getElementById')
                    return (id: string) => root.querySelector(`#${CSS.escape(id)}`);
                if (key === 'addEventListener')
                    return (
                        type: string,
                        listener: EventListener,
                        options?: AddEventListenerOptions,
                    ) => {
                        document.addEventListener(type, listener, options);
                        listeners.push(() => document.removeEventListener(type, listener, options));
                    };
                const value = Reflect.get(target, key, target);
                return typeof value === 'function' ? value.bind(target) : value;
            },
        });
    }

    return {
        async run(root: HTMLElement, scripts: string[]) {
            for (const script of scripts) {
                const imports: Record<string, unknown> = {};
                const body = script.replace(
                    /^\s*import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]\s*;?/gm,
                    (_full, imported: string, source: string) => {
                        if (
                            ![
                                '/dist/webawesome.js',
                                'https://cdn.jsdelivr.net/npm/lit@3/+esm',
                            ].includes(source)
                        )
                            throw new Error(`Unreviewed upstream script import ${source}`);
                        for (const name of imported.split(',').map((name) => name.trim())) {
                            const value: unknown =
                                name === 'html' ? html : Reflect.get(upstream, name);
                            if (value === undefined)
                                throw new Error(`Missing installed upstream helper ${name}`);
                            imports[name] =
                                name === 'registerIconLibrary'
                                    ? (
                                          ...args: Parameters<typeof upstream.registerIconLibrary>
                                      ) => {
                                          libraries.add(args[0]);
                                          upstream.registerIconLibrary(...args);
                                      }
                                    : value;
                        }
                        return '';
                    },
                );
                const environment = {
                    document: scopedDocument(root),
                    setTimeout: schedule,
                    clearTimeout: (handle: number) => timers.get(handle)?.(),
                    setInterval: (callback: TimerHandler, delay?: number) => {
                        if (typeof callback !== 'function')
                            throw new Error('Upstream fixture intervals require callbacks.');
                        const handle = window.setInterval(() => callback(), delay);
                        intervalHandles.add(handle);
                        return handle;
                    },
                    clearInterval: (handle: number) => {
                        window.clearInterval(handle);
                        intervalHandles.delete(handle);
                    },
                    ...imports,
                };
                const run = new AsyncFunction(...Object.keys(environment), body);
                await run(...Object.values(environment));
            }
        },
        async flush() {
            for (let round = 0; round < 5 && pending.size; round++) await Promise.all(pending);
            if (pending.size) throw new Error('Upstream scenario timers did not settle.');
        },
        dispose() {
            for (const remove of listeners) remove();
            for (const cancel of timers.values()) cancel();
            for (const handle of intervalHandles) window.clearInterval(handle);
            for (const library of libraries) upstream.unregisterIconLibrary(library);
            if (libraries.has('default') && defaultIconLibrary)
                upstream.registerIconLibrary('default', defaultIconLibrary);
            if (libraries.has('system') && systemIconLibrary)
                upstream.registerIconLibrary('system', systemIconLibrary);
            upstream.setIconPath(iconPath);
        },
    };
}
