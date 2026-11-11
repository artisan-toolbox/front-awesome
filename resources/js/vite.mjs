import { createRequire } from 'node:module';
import { readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { translationExport } from './vite-translations.mjs';

const internalWebAwesome = '#front-awesome-webawesome';
const internalProWebAwesome = '#front-awesome-webawesome-pro';
const corePackage = '@awesome.me/webawesome';
const proPackage = '@web.awesome.me/webawesome-pro';
const localeModule = 'virtual:front-awesome/web-awesome-locales';
const resolvedLocaleModule = `\0${localeModule}`;

function findDist(requireFromApp, packageName, required = false) {
    try {
        return resolve(dirname(requireFromApp.resolve(`${packageName}/package.json`)), 'dist');
    } catch (error) {
        if (
            !required &&
            error instanceof Error &&
            'code' in error &&
            error.code === 'MODULE_NOT_FOUND'
        ) {
            return undefined;
        }

        throw error;
    }
}

export function frontAwesome({ webAwesome, translations = false } = {}) {
    let licensedDist;
    let selectedDist;
    const exporter = translations ? translationExport(translations) : undefined;
    return {
        name: 'front-awesome:web-awesome',
        enforce: 'pre',
        async config(config) {
            await exporter?.start(resolve(config.root ?? '.'));
            const requireFromApp = createRequire(resolve(config.root ?? '.', 'package.json'));
            licensedDist = findDist(requireFromApp, proPackage, webAwesome === 'pro');
            const proDist = webAwesome === 'core' ? undefined : licensedDist;
            const dist = proDist ?? findDist(requireFromApp, corePackage);
            selectedDist = dist;

            return {
                resolve: dist ? { alias: { [internalWebAwesome]: dist } } : undefined,
                optimizeDeps: {
                    // Keep app and package custom elements in the same module graph in development.
                    exclude: [
                        '@artisan-toolbox/front-awesome',
                        internalWebAwesome,
                        proDist ? proPackage : corePackage,
                    ],
                },
            };
        },
        resolveId(source) {
            if (source === localeModule) return resolvedLocaleModule;
            if (!source.startsWith(`${internalProWebAwesome}/`)) return;
            if (!licensedDist) {
                const component = source.split('/')[2] ?? 'This component';
                throw new Error(
                    `Front Awesome ${component} requires Web Awesome Pro. Install @web.awesome.me/webawesome-pro with your licensed registry configuration before importing this component.`,
                );
            }
            return resolve(licensedDist, source.slice(internalProWebAwesome.length + 1));
        },
        async load(id) {
            if (id !== resolvedLocaleModule) return;
            const translations = selectedDist ? resolve(selectedDist, 'translations') : undefined;
            const files = translations
                ? await readdir(translations).catch((error) => {
                      if (error.code === 'ENOENT') return [];
                      throw error;
                  })
                : [];
            const loaders = files
                .filter((file) => file.endsWith('.js'))
                .sort()
                .map((file) => {
                    const [locale] = Intl.getCanonicalLocales(
                        file.slice(0, -3).replaceAll('_', '-'),
                    );
                    return `${JSON.stringify(locale)}: () => import(${JSON.stringify(resolve(translations, file).replaceAll('\\', '/'))})`;
                });
            return `export default {${loaders.join(',\n')}};`;
        },
        configureServer(server) {
            exporter?.watch(server);
        },
        closeBundle() {
            exporter?.close();
        },
        configResolved(config) {
            for (const plugin of config.plugins) {
                if (plugin.name !== 'vite:vue' || !plugin.api?.options) {
                    continue;
                }

                const options = plugin.api.options;
                const { template = {} } = options;
                const { compilerOptions = {} } = template;
                const { isCustomElement } = compilerOptions;

                plugin.api.options = {
                    ...options,
                    template: {
                        ...template,
                        compilerOptions: {
                            ...compilerOptions,
                            isCustomElement: (tag) =>
                                isCustomElement?.(tag) || tag.startsWith('wa-'),
                        },
                    },
                };
            }
        },
    };
}
