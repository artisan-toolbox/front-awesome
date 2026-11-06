import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const internalWebAwesome = '#front-awesome-webawesome';
const corePackage = '@awesome.me/webawesome';
const proPackage = '@web.awesome.me/webawesome-pro';

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

export function frontAwesome({ webAwesome } = {}) {
    return {
        name: 'front-awesome:web-awesome',
        config(config) {
            const requireFromApp = createRequire(resolve(config.root ?? '.', 'package.json'));
            const proDist =
                webAwesome === 'core'
                    ? undefined
                    : findDist(requireFromApp, proPackage, webAwesome === 'pro');
            const dist = proDist ?? findDist(requireFromApp, corePackage);

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
