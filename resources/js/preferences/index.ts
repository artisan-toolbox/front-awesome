import { router } from '@inertiajs/vue3';
import { computed, inject, shallowRef, type App } from 'vue';
import { canonicalLocale } from '../localization/catalog';
import { writeLocale } from '../localization/controller';
import { appearanceKey, type AppearancePreference } from './appearance';
import { isAppearance, parsePreferences } from './bootstrap';
import { preferencesKey } from './context';
import type { PreferenceErrors, PreferenceField, PreferencesService } from './types';

export { usePreferences } from './context';
export type {
    PreferenceErrors,
    PreferenceField,
    Preferences,
    PreferencesBootstrap,
    PreferencesService,
} from './types';

type Mutation =
    | { field: 'appearance'; value: AppearancePreference }
    | { field: 'locale'; value: string }
    | { field: 'timezone'; value: string }
    | { field: 'currency'; value: string | null };
type Status = 'idle' | 'writing' | 'navigating' | 'reconciling' | 'uncertain' | 'disposed';
const documents = new WeakMap<Document, PreferencesService>();
const messages = {
    network_failure: 'Preferences could not be confirmed. Retry your selection or call refresh().',
    refresh_failure: 'Preferences could not be refreshed. Call refresh() to retry.',
    wait_loading: 'Wait for server preferences to finish loading.',
    invalid_appearance: 'Choose system, light, or dark appearance.',
    invalid_locale: 'Choose a selectable locale.',
    invalid_timezone: 'Choose a selectable timezone.',
    invalid_currency: 'Choose a selectable currency or no currency preference.',
    not_accepted: 'This preference was not accepted.',
    navigation_failure: 'Navigation ended without confirmed preferences. Call refresh() to retry.',
};

export function createPreferences(input: unknown): PreferencesService {
    const initial = parsePreferences(input);
    const confirmed = shallowRef(initial);
    const status = shallowRef<Status>('idle');
    const errors = shallowRef<PreferenceErrors>({});
    const error = shallowRef<string>();
    const systemDark = shallowRef(false);
    const queue: Mutation[] = [];
    let installedApp: App | undefined;
    let browserDocument: Document | undefined;
    let ownVisit = false;
    let generation = 0;
    let incoming: ReturnType<typeof parsePreferences> | undefined;
    let refreshAfterWrite = false;
    const resolvedAppearance = computed(() =>
        confirmed.value.appearance === 'system'
            ? systemDark.value
                ? 'dark'
                : 'light'
            : confirmed.value.appearance,
    );

    function localizedMessage(key: keyof typeof messages): string {
        const name = `front-awesome::preferences.${key}`;
        const localization = installedApp?.config.globalProperties.$frontAwesome?.localization;
        const translated = localization?.t(name);
        return translated && translated !== name ? translated : messages[key];
    }

    function apply(): void {
        const classes = browserDocument?.documentElement.classList;
        const dark = resolvedAppearance.value === 'dark';
        classes?.toggle('dark', dark);
        classes?.toggle('wa-dark', dark);
        classes?.toggle('wa-light', !dark);
        if (browserDocument) writeLocale(browserDocument, confirmed.value.locale);
    }

    function snapshot(props: Record<string, unknown>): ReturnType<typeof parsePreferences> {
        const next = parsePreferences(props[initial.key]);
        if (next.key !== initial.key || next.updateUrl !== initial.updateUrl)
            throw new TypeError(
                'Front Awesome preference configuration changed. Reload this page.',
            );
        return next;
    }

    function accept(props: Record<string, unknown>, mutation = false): void {
        const next = snapshot(props);
        const changed =
            next.appearance !== confirmed.value.appearance ||
            next.locale !== confirmed.value.locale ||
            next.timezone !== confirmed.value.timezone ||
            next.currency !== confirmed.value.currency;
        confirmed.value = next;
        apply();
        if (changed || mutation) router.flushAll();
    }

    function fail(message: string, field?: PreferenceField): void {
        queue.length = 0;
        status.value = 'uncertain';
        error.value = message;
        if (field) errors.value = { ...errors.value, [field]: message };
    }

    function guarded(callback: () => void, field?: PreferenceField): void {
        try {
            callback();
        } catch (cause) {
            fail(
                cause instanceof Error
                    ? cause.message
                    : 'Front Awesome could not read server preferences.',
                field,
            );
        }
    }

    function dispatch(callback: () => void): void {
        ownVisit = true;
        try {
            callback();
        } finally {
            ownVisit = false;
        }
    }

    function drain(): void {
        if (status.value !== 'idle') return;
        const mutation = queue.shift();
        if (!mutation) return;
        const view = browserDocument?.defaultView;
        if (!view) {
            fail('Changing preferences requires an installed browser document.', mutation.field);
            return;
        }
        const request = ++generation;
        let started = false;
        status.value = 'writing';
        incoming = undefined;
        const failed = () => {
            if (request === generation) fail(localizedMessage('network_failure'), mutation.field);
        };
        guarded(
            () =>
                dispatch(() =>
                    router.patch(
                        initial.updateUrl + view.location.hash,
                        { [mutation.field]: mutation.value },
                        {
                            replace: true,
                            preserveState: true,
                            preserveScroll: true,
                            errorBag: 'frontAwesomePreferences',
                            onStart() {
                                started = true;
                            },
                            headers: {
                                'X-Front-Awesome-Return':
                                    view.location.pathname + view.location.search,
                            },
                            onBeforeUpdate(page) {
                                if (request !== generation) return;
                                guarded(() => {
                                    incoming = snapshot(page.props);
                                }, mutation.field);
                            },
                            onSuccess(page) {
                                if (request !== generation) return;
                                guarded(() => {
                                    accept(page.props, true);
                                    status.value = 'idle';
                                }, mutation.field);
                            },
                            onError(validation) {
                                if (request !== generation) return;
                                if (incoming) {
                                    confirmed.value = incoming;
                                    apply();
                                }
                                const message = validation[mutation.field];
                                errors.value = {
                                    ...errors.value,
                                    [mutation.field]:
                                        typeof message === 'string'
                                            ? message
                                            : localizedMessage('not_accepted'),
                                };
                                status.value = 'idle';
                            },
                            onCancel: failed,
                            onHttpException() {
                                failed();
                                return false;
                            },
                            onNetworkError() {
                                failed();
                                return false;
                            },
                            onFinish() {
                                if (request !== generation) return;
                                if (status.value === 'writing') failed();
                                if (refreshAfterWrite) {
                                    refreshAfterWrite = false;
                                    reconcile();
                                    return;
                                }
                                drain();
                            },
                        },
                    ),
                ),
            mutation.field,
        );
        if (!started && request === generation && status.value === 'writing')
            fail(localizedMessage('not_accepted'), mutation.field);
    }

    function enqueue(mutation: Mutation): void {
        if (!browserDocument || status.value === 'disposed') {
            fail('Changing preferences requires an installed browser document.', mutation.field);
            return;
        }
        if (status.value === 'navigating' || status.value === 'reconciling') {
            errors.value = {
                ...errors.value,
                [mutation.field]: localizedMessage('wait_loading'),
            };
            return;
        }
        error.value = undefined;
        errors.value = { ...errors.value, [mutation.field]: undefined };
        queue.push(mutation);
        if (status.value === 'uncertain') status.value = 'idle';
        drain();
    }

    function reconcile(full = false): void {
        if (!browserDocument || status.value === 'disposed') return;
        if (status.value === 'writing') return;
        queue.length = 0;
        const request = ++generation;
        let started = false;
        status.value = 'reconciling';
        error.value = undefined;
        const failed = () => {
            if (request === generation) fail(localizedMessage('refresh_failure'));
        };
        guarded(() =>
            dispatch(() =>
                router.reload({
                    ...(full ? {} : { only: [initial.key] }),
                    onStart() {
                        started = true;
                    },
                    onSuccess(page) {
                        if (request !== generation) return;
                        guarded(() => {
                            accept(page.props);
                            errors.value = {};
                            status.value = 'idle';
                        });
                    },
                    onError: failed,
                    onCancel: failed,
                    onHttpException() {
                        failed();
                        return false;
                    },
                    onNetworkError() {
                        failed();
                        return false;
                    },
                    onFinish() {
                        if (request === generation && status.value === 'reconciling') failed();
                    },
                }),
            ),
        );
        if (!started && request === generation && status.value === 'reconciling') failed();
    }

    const service: PreferencesService = {
        appearance: computed(() => confirmed.value.appearance),
        resolvedAppearance,
        locale: computed(() => confirmed.value.locale),
        timezone: computed(() => confirmed.value.timezone),
        currency: computed(() => confirmed.value.currency),
        get locales() {
            return confirmed.value.locales;
        },
        get timezones() {
            return confirmed.value.timezones;
        },
        get currencies() {
            return confirmed.value.currencies;
        },
        pending: computed(() => ['writing', 'navigating', 'reconciling'].includes(status.value)),
        errors: computed(() => errors.value),
        error: computed(() => error.value),
        setAppearance(value) {
            if (!isAppearance(value)) {
                errors.value = {
                    ...errors.value,
                    appearance: localizedMessage('invalid_appearance'),
                };
                return;
            }
            enqueue({ field: 'appearance', value });
        },
        setLocale(value) {
            const locale = canonicalLocale(value);
            if (!locale || !service.locales.some((entry) => entry.locale === locale)) {
                errors.value = { ...errors.value, locale: localizedMessage('invalid_locale') };
                return;
            }
            const wireLocale = confirmed.value.wireLocales.get(locale);
            if (wireLocale) enqueue({ field: 'locale', value: wireLocale });
        },
        setTimezone(value) {
            if (!service.timezones.includes(value)) {
                errors.value = { ...errors.value, timezone: localizedMessage('invalid_timezone') };
                return;
            }
            enqueue({ field: 'timezone', value });
        },
        setCurrency(value) {
            if (value !== null && !service.currencies.includes(value)) {
                errors.value = { ...errors.value, currency: localizedMessage('invalid_currency') };
                return;
            }
            enqueue({ field: 'currency', value });
        },
        formatDate(value, options) {
            return new Intl.DateTimeFormat(confirmed.value.locale, {
                timeZone: confirmed.value.timezone,
                ...options,
            }).format(value);
        },
        refresh: () => reconcile(),
        install(app) {
            if (installedApp === app) return;
            if (installedApp)
                throw new Error('Create a separate preferences service for each Vue application.');
            if (app.runWithContext(() => inject(preferencesKey, undefined)))
                throw new Error('This Vue application already has a preferences service.');
            if (typeof document !== 'undefined' && documents.has(document))
                throw new Error('Only one preferences service may own a browser document.');
            installedApp = app;
            app.provide(preferencesKey, service);
            app.provide(appearanceKey, {
                appearance: service.appearance,
                serverConfirmed: true,
                setAppearance: service.setAppearance,
                toggle: () =>
                    service.setAppearance(resolvedAppearance.value === 'dark' ? 'light' : 'dark'),
            });
            app.config.globalProperties.$frontAwesome = {
                ...app.config.globalProperties.$frontAwesome,
                preferences: service,
            };
            if (typeof document === 'undefined') return;
            browserDocument = document;
            documents.set(document, service);
            const view = browserDocument.defaultView;
            const media = view?.matchMedia?.('(prefers-color-scheme: dark)');
            const systemChanged = () => {
                systemDark.value = media?.matches === true;
                apply();
            };
            systemChanged();
            media?.addEventListener('change', systemChanged);
            let history = false;
            let cachedVisit: Event | undefined;
            const reconcileCachedVisit = () => {
                cachedVisit = undefined;
                history = false;
                status.value = 'idle';
                reconcile(true);
            };
            const popstate = (event: PopStateEvent) => {
                if (event.state === null) return;
                history = true;
                generation++;
                queue.length = 0;
                status.value = 'navigating';
            };
            const pageshow = (event: PageTransitionEvent) => {
                if (event.persisted) reconcile(true);
            };
            view?.addEventListener('popstate', popstate);
            view?.addEventListener('pageshow', pageshow);
            const stopBefore = router.on('before', (event) => {
                const { detail } = event;
                if (ownVisit || detail.visit.prefetch) return;
                if (status.value === 'writing' || status.value === 'uncertain') router.flushAll();
                const options = { ...detail.visit, headers: { ...detail.visit.headers } };
                cachedVisit =
                    router.getCached(detail.visit.url, options) ||
                    router.getPrefetching(detail.visit.url, options)
                        ? event
                        : undefined;
            });
            const stopStart = router.on('start', ({ detail }) => {
                if (ownVisit || detail.visit.prefetch) return;
                if (detail.visit.async && status.value === 'writing') {
                    queue.length = 0;
                    refreshAfterWrite = true;
                    return;
                }
                generation++;
                queue.length = 0;
                status.value = 'navigating';
            });
            const stopNavigate = router.on('navigate', ({ detail }) => {
                if (
                    history ||
                    (cachedVisit && !cachedVisit.defaultPrevented) ||
                    ('type' in detail && detail.type === 'history') ||
                    ('cached' in detail && detail.cached === true)
                ) {
                    reconcileCachedVisit();
                    return;
                }
                if (status.value === 'writing') {
                    guarded(() => {
                        incoming = snapshot(detail.page.props);
                    });
                    return;
                }
                if (status.value === 'reconciling') return;
                guarded(() => {
                    accept(detail.page.props);
                    errors.value = {};
                    error.value = undefined;
                    status.value = 'idle';
                });
            });
            const stopSuccess = router.on('success', ({ detail }) => {
                if (status.value === 'writing' || status.value === 'reconciling') return;
                if (cachedVisit && !cachedVisit.defaultPrevented) {
                    reconcileCachedVisit();
                    return;
                }
                guarded(() => {
                    accept(detail.page.props);
                    errors.value = {};
                    error.value = undefined;
                    status.value = 'idle';
                });
            });
            const stopError = router.on('error', ({ detail }) => {
                if (status.value === 'writing' || status.value === 'reconciling') return;
                if ('page' in detail && detail.page)
                    guarded(() => {
                        const page = detail.page;
                        if (
                            typeof page === 'object' &&
                            page !== null &&
                            'props' in page &&
                            typeof page.props === 'object' &&
                            page.props !== null
                        ) {
                            const next = parsePreferences(Reflect.get(page.props, initial.key));
                            confirmed.value = next;
                            apply();
                        }
                    });
                status.value = 'idle';
            });
            const stopFinish = router.on('finish', () => {
                if (status.value === 'navigating') fail(localizedMessage('navigation_failure'));
            });
            app.onUnmount(() => {
                generation++;
                queue.length = 0;
                status.value = 'disposed';
                stopBefore();
                stopStart();
                stopNavigate();
                stopSuccess();
                stopError();
                stopFinish();
                media?.removeEventListener('change', systemChanged);
                view?.removeEventListener('popstate', popstate);
                view?.removeEventListener('pageshow', pageshow);
                if (browserDocument) documents.delete(browserDocument);
                browserDocument = undefined;
            });
        },
    };
    return service;
}
