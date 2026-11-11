// oxlint-disable-next-line typescript/triple-slash-reference -- Composer-installed consumers need the private Vite module declaration.
/// <reference path="./virtual.d.ts" />
import { computed, inject, shallowRef, type App } from 'vue';
import { createI18n } from 'vue-i18n';
import webAwesomeLoaders from 'virtual:front-awesome/web-awesome-locales';
import { canonicalLocale, parseCatalog } from './catalog';
import { localizationKey } from './context';
import { observeLocale, writeLocale } from './controller';
import { laravelMessage } from './laravelMessages';
import type { LocalizationOptions, LocalizationService } from './types';
import { preferencesKey } from '../preferences/context';
import type { PreferencesService } from '../preferences/types';
import { installPreferenceFormats } from '../preferences/formats';

export { useLocalization } from './context';
export type {
    LaravelLocalizationCatalog,
    LocalizationLocale,
    LocalizationOptions,
    LocalizationService,
} from './types';

const loaded = new Map<string, Promise<unknown>>();
function loadWebAwesome(locale: string): Promise<unknown> {
    const language = locale.split('-')[0];
    const key = Object.hasOwn(webAwesomeLoaders, locale) ? locale : language;
    const loader = webAwesomeLoaders[key];
    if (!loader) return Promise.resolve();
    const cached = loaded.get(key);
    if (cached) return cached;
    const pending = Promise.resolve()
        .then(loader)
        .catch((error: unknown) => {
            loaded.delete(key);
            throw error;
        });
    loaded.set(key, pending);
    return pending;
}

export function createLocalization(
    input: unknown,
    options: LocalizationOptions = {},
): LocalizationService {
    const catalog = parseCatalog(input);
    const messages = Object.fromEntries(
        Object.entries(catalog.locales).map(([locale, entry]) => [
            locale,
            Object.fromEntries(
                Object.entries(entry.messages).map(([key, line]) => [
                    key,
                    laravelMessage(line, entry.sourceLocale),
                ]),
            ),
        ]),
    );
    const i18n = createI18n<
        { message: Record<string, ReturnType<typeof laravelMessage>> },
        string,
        false
    >({
        ...options,
        legacy: false,
        globalInjection: false,
        locale: catalog.fallbackLocale,
        fallbackLocale: [...new Set([catalog.fallbackLocale, 'en'])],
        messages,
        fallbackFormat: false,
        missingWarn: options.missingWarn ?? false,
        fallbackWarn: options.fallbackWarn ?? false,
        messageResolver: (object, key) =>
            object !== null && typeof object === 'object' && Object.hasOwn(object, key)
                ? Reflect.get(object, key)
                : null,
    });
    const error = shallowRef<Error>();
    let browserDocument: Document | undefined;
    let revision = 0;
    let installedApp: App | undefined;
    let preferences: PreferencesService | undefined;
    async function synchronizeWebAwesome() {
        const request = ++revision;
        error.value = undefined;
        try {
            await loadWebAwesome(i18n.global.locale.value);
        } catch (cause) {
            const failure = new Error(
                'Front Awesome could not load the Web Awesome translation. Call retryWebAwesome() to retry.',
                { cause },
            );
            if (request === revision) error.value = failure;
            throw failure;
        }
    }
    const service: LocalizationService = {
        locale: computed(() => i18n.global.locale.value),
        locales: Object.freeze(
            catalog.availableLocales.map((locale) => {
                const entry = catalog.locales[locale];
                return Object.freeze({
                    locale,
                    sourceLocale: entry.sourceLocale,
                    label: entry.label,
                });
            }),
        ),
        t: i18n.global.t,
        n: i18n.global.n,
        d: i18n.global.d,
        webAwesomeError: computed(() => error.value),
        setLocale(value) {
            if (preferences) {
                preferences.setLocale(value);
                return;
            }
            const locale = canonicalLocale(value);
            if (!locale || !catalog.availableLocales.includes(locale))
                throw new RangeError(`Locale "${value}" is not a selectable Front Awesome locale.`);
            if (!browserDocument)
                throw new Error(
                    'Changing language requires an installed browser document. Render the request locale in html.lang.',
                );
            writeLocale(browserDocument, locale);
        },
        retryWebAwesome: synchronizeWebAwesome,
        install(app: App) {
            if (installedApp === app) return;
            if (installedApp)
                throw new Error('Create a separate localization service for each Vue application.');
            if (app.runWithContext(() => inject(localizationKey, undefined)))
                throw new Error('This Vue application already has a localization service.');
            installedApp = app;
            preferences = app.runWithContext(() => inject(preferencesKey, undefined));
            if (preferences) i18n.global.locale.value = preferences.locale.value;
            const stopFormats = preferences
                ? installPreferenceFormats(
                      preferences,
                      i18n.global,
                      options,
                      Object.keys(catalog.locales),
                  )
                : () => {};
            app.use(i18n);
            app.provide(localizationKey, service);
            app.config.globalProperties.$frontAwesome = {
                ...app.config.globalProperties.$frontAwesome,
                localization: service,
            };
            let stop = () => {};
            if (typeof document !== 'undefined') {
                if (browserDocument && browserDocument !== document)
                    throw new Error('Create one localization service per browser document.');
                browserDocument = document;
                stop = observeLocale(document, (locale) => {
                    i18n.global.locale.value = locale ?? catalog.fallbackLocale;
                    void synchronizeWebAwesome().catch(() => {});
                });
            }
            app.onUnmount(() => {
                stop();
                stopFormats();
                browserDocument = undefined;
                revision++;
            });
        },
    };
    return service;
}
