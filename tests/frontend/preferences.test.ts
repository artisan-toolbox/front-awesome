import { router } from '@inertiajs/vue3';
import type { Page } from '@inertiajs/core';
import { createRenderer, createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import {
    createPreferences,
    usePreferences,
    type PreferencesBootstrap,
} from '@artisan-toolbox/front-awesome/preferences';
import Appearance from '@artisan-toolbox/front-awesome/components/Appearance.vue';
import Language from '@artisan-toolbox/front-awesome/components/Language.vue';
import Timezone from '@artisan-toolbox/front-awesome/components/Timezone.vue';
import { createLocalization, type LocalizationService } from '../../resources/js/localization';
import { useI18n, type Composer } from 'vue-i18n';
import Currency from '@artisan-toolbox/front-awesome/components/Currency.vue';

const bootstrap = {
    appearance: 'system',
    locale: 'en',
    timezone: 'UTC',
    currency: null,
    currencies: ['BRL', 'USD', 'EUR'],
    key: 'display_settings',
    updateUrl: '/front-awesome/preferences',
    locales: [
        { locale: 'en', sourceLocale: 'en', label: 'English' },
        { locale: 'pt-BR', sourceLocale: 'pt_BR', label: 'Portuguese' },
    ],
    timezones: ['UTC', 'America/Sao_Paulo'],
} satisfies PreferencesBootstrap;

const renderer = createRenderer<object, object>({
    createElement: () => ({}),
    createText: () => ({}),
    createComment: () => ({}),
    insert() {},
    remove() {},
    setText() {},
    setElementText() {},
    patchProp() {},
    parentNode: () => null,
    nextSibling: () => null,
});

function page(overrides: Partial<PreferencesBootstrap> = {}): Page {
    return {
        component: 'Example',
        url: '/guide?tab=example#demo',
        version: null,
        props: { errors: {}, display_settings: { ...bootstrap, ...overrides } },
        flash: {},
        rescuedProps: [],
        rememberedState: {},
    };
}

function browser() {
    const classes = new Set<string>(['wa-theme-custom']);
    const media = Object.assign(new EventTarget(), { matches: true });
    const storage = vi.fn(() => {
        throw new Error('Backend preferences must not read localStorage.');
    });
    const view = Object.assign(new EventTarget(), {
        location: new URL('https://example.test/guide?tab=example#demo'),
        matchMedia: () => media,
        MutationObserver: class {
            observe() {}
            disconnect() {}
        },
    });
    Object.defineProperty(view, 'localStorage', { get: storage });
    const document = Object.assign(new EventTarget(), {
        defaultView: view,
        documentElement: {
            lang: 'en',
            classList: {
                toggle(name: string, enabled: boolean) {
                    if (enabled) classes.add(name);
                    else classes.delete(name);
                },
            },
        },
    });
    vi.stubGlobal('document', document);
    vi.stubGlobal('window', view);
    onTestFinished(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });
    return { classes, document, view, media, storage };
}

function setup(localization?: LocalizationService) {
    const environment = browser();
    const preferences = createPreferences(bootstrap);
    let native: Composer | undefined;
    const app = renderer
        .createApp({
            setup() {
                if (localization) native = useI18n({ useScope: 'global' });
                return () => null;
            },
        })
        .use(preferences);
    if (localization) app.use(localization);
    app.mount({});
    onTestFinished(() => app.unmount());
    const patch = vi.spyOn(router, 'patch').mockImplementation((_url, _data, options) => {
        if (options?.onStart) Reflect.apply(options.onStart, undefined, []);
    });
    const reload = vi.spyOn(router, 'reload').mockImplementation((options) => {
        if (options?.onStart) Reflect.apply(options.onStart, undefined, []);
    });
    function visit() {
        const call = patch.mock.lastCall;
        if (!call || !call[2]) throw new Error('No preference visit was sent.');
        return call[2];
    }
    function success(overrides: Partial<PreferencesBootstrap> = {}) {
        const options = visit();
        options.onSuccess?.(page(overrides));
        if (options.onFinish) Reflect.apply(options.onFinish, undefined, []);
    }
    return { ...environment, preferences, patch, reload, visit, success, app, native };
}

function navigate(
    document: EventTarget,
    overrides: Partial<PreferencesBootstrap>,
    metadata: { type?: string; cached?: boolean } = {},
) {
    document.dispatchEvent(
        new CustomEvent('inertia:navigate', { detail: { page: page(overrides), ...metadata } }),
    );
}

test('rejects malformed bootstrap boundaries and accepts a default locale outside the selector list', () => {
    for (const invalid of [
        null,
        {},
        { ...bootstrap, key: '__proto__' },
        { ...bootstrap, key: 'nested.preferences' },
        { ...bootstrap, updateUrl: '//external.test/update' },
        { ...bootstrap, appearance: 'sepia' },
        { ...bootstrap, locale: '' },
        { ...bootstrap, timezones: ['not-a-zone'] },
        { ...bootstrap, locales: [bootstrap.locales[0], bootstrap.locales[0]] },
    ])
        expect(() => createPreferences(invalid)).toThrow(TypeError);
    expect(createPreferences({ ...bootstrap, locale: 'es' }).locale.value).toBe('es');
});

test('uses the confirmed server appearance, language and timezone without touching localStorage', () => {
    const { preferences, storage, classes, document, patch, success } = setup();
    expect(preferences.resolvedAppearance.value).toBe('dark');
    expect(classes).toEqual(new Set(['wa-theme-custom', 'dark', 'wa-dark']));
    preferences.setAppearance('light');
    expect(preferences.appearance.value).toBe('system');
    expect(preferences.pending.value).toBe(true);
    expect(patch).toHaveBeenLastCalledWith(
        '/front-awesome/preferences#demo',
        { appearance: 'light' },
        expect.objectContaining({
            replace: true,
            preserveScroll: true,
            preserveState: true,
            errorBag: 'frontAwesomePreferences',
            headers: { 'X-Front-Awesome-Return': '/guide?tab=example' },
        }),
    );
    success({ appearance: 'dark', locale: 'pt-BR', timezone: 'America/Sao_Paulo' });
    expect(preferences.appearance.value).toBe('dark');
    expect(preferences.pending.value).toBe(false);
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(preferences.timezone.value).toBe('America/Sao_Paulo');
    expect(storage).not.toHaveBeenCalled();
});

test('serializes rapid edits so the server receives each preference after the prior response finishes', () => {
    const { preferences, patch, success } = setup();
    preferences.setAppearance('dark');
    preferences.setLocale('pt_BR');
    preferences.setTimezone('America/Sao_Paulo');
    preferences.setAppearance('light');
    expect(patch).toHaveBeenCalledTimes(1);
    success({ appearance: 'dark' });
    expect(patch.mock.lastCall?.[1]).toEqual({ locale: 'pt-BR' });
    success({ appearance: 'dark', locale: 'pt-BR' });
    expect(patch.mock.lastCall?.[1]).toEqual({ timezone: 'America/Sao_Paulo' });
    success({ appearance: 'dark', locale: 'pt-BR', timezone: 'America/Sao_Paulo' });
    expect(patch.mock.lastCall?.[1]).toEqual({ appearance: 'light' });
    success({ appearance: 'light', locale: 'pt-BR', timezone: 'America/Sao_Paulo' });
    expect(preferences.appearance.value).toBe('light');
    expect(preferences.pending.value).toBe(false);
});

test('keeps confirmed values on validation errors and exposes retryable network uncertainty', () => {
    const { preferences, visit, patch, reload, success } = setup();
    preferences.setLocale('pt-BR');
    visit().onError?.({ locale: 'The locale is not available.' });
    const finish = visit().onFinish;
    if (finish) Reflect.apply(finish, undefined, []);
    expect(preferences.locale.value).toBe('en');
    expect(preferences.errors.value.locale).toBe('The locale is not available.');
    expect(preferences.pending.value).toBe(false);
    preferences.setTimezone('America/Sao_Paulo');
    preferences.setAppearance('dark');
    const options = visit();
    if (options.onNetworkError)
        Reflect.apply(options.onNetworkError, undefined, [new Error('offline')]);
    if (options.onFinish) Reflect.apply(options.onFinish, undefined, []);
    expect(preferences.timezone.value).toBe('UTC');
    expect(preferences.error.value).toContain('could not be confirmed');
    expect(patch).toHaveBeenCalledTimes(2);
    preferences.refresh();
    const refresh = reload.mock.lastCall?.[0];
    expect(refresh?.only).toEqual(['display_settings']);
    refresh?.onSuccess?.(page({ timezone: 'America/Sao_Paulo' }));
    expect(preferences.timezone.value).toBe('America/Sao_Paulo');
    expect(preferences.error.value).toBeUndefined();
    preferences.setAppearance('light');
    success({ appearance: 'light', timezone: 'America/Sao_Paulo' });
});

test('reconciles cached history without applying stale props or persisting them', () => {
    const { preferences, document, patch, reload, success } = setup();
    preferences.setAppearance('dark');
    success({ appearance: 'dark' });
    navigate(document, { appearance: 'light' }, { type: 'history' });
    expect(preferences.appearance.value).toBe('dark');
    expect(reload).toHaveBeenCalledTimes(1);
    expect(reload.mock.lastCall?.[0]?.only).toBeUndefined();
    reload.mock.lastCall?.[0]?.onSuccess?.(page({ appearance: 'dark' }));
    expect(preferences.appearance.value).toBe('dark');
    expect(patch).toHaveBeenCalledTimes(1);
    navigate(document, { appearance: 'light' }, { type: 'visit', cached: true });
    expect(preferences.appearance.value).toBe('dark');
    expect(reload).toHaveBeenCalledTimes(2);
});

test('discards queued edits and stale callbacks across external navigation or unmount', () => {
    const { preferences, document, patch, visit, app, media, classes } = setup();
    preferences.setAppearance('dark');
    preferences.setLocale('pt-BR');
    const stale = visit();
    document.dispatchEvent(
        new CustomEvent('inertia:start', { detail: { visit: { prefetch: false, async: false } } }),
    );
    navigate(document, { appearance: 'light', locale: 'en' }, { type: 'visit' });
    stale.onSuccess?.(page({ appearance: 'dark', locale: 'pt-BR' }));
    if (stale.onFinish) Reflect.apply(stale.onFinish, undefined, []);
    expect(preferences.appearance.value).toBe('light');
    expect(preferences.locale.value).toBe('en');
    expect(patch).toHaveBeenCalledTimes(1);
    preferences.setTimezone('America/Sao_Paulo');
    const pending = visit();
    preferences.setAppearance('dark');
    app.unmount();
    pending.onSuccess?.(page({ appearance: 'dark' }));
    if (pending.onFinish) Reflect.apply(pending.onFinish, undefined, []);
    media.matches = false;
    media.dispatchEvent(new Event('change'));
    navigate(document, { appearance: 'dark' }, { type: 'visit' });
    expect(classes.has('wa-light')).toBe(true);
    expect(patch).toHaveBeenCalledTimes(2);
    expect(preferences.pending.value).toBe(false);
});

test('persists localization direct setters through the installed preferences plugin', () => {
    const { app, preferences, patch, success } = setup();
    const localization = createLocalization({
        version: 1,
        fallbackLocale: 'en',
        locales: {
            en: { sourceLocale: 'en', label: 'English', messages: {} },
            'pt-BR': { sourceLocale: 'pt_BR', label: 'Portuguese', messages: {} },
        },
    });
    app.use(localization);
    localization.setLocale('pt_BR');
    expect(localization.locale.value).toBe('en');
    expect(patch.mock.lastCall?.[1]).toEqual({ locale: 'pt-BR' });
    success({ locale: 'pt-BR' });
    expect(localization.locale.value).toBe('pt-BR');
    expect(preferences.locale.value).toBe('pt-BR');
});

test('formats the same instant with confirmed locale and timezone and permits explicit timezone overrides', () => {
    const { preferences, success } = setup();
    const instant = new Date('2026-01-01T12:00:00Z');
    expect(preferences.formatDate(instant, { hour: '2-digit', hourCycle: 'h23' })).toBe('12');
    preferences.setTimezone('America/Sao_Paulo');
    success({ timezone: 'America/Sao_Paulo' });
    expect(preferences.formatDate(instant, { hour: '2-digit', hourCycle: 'h23' })).toBe('09');
    expect(
        preferences.formatDate(instant, { hour: '2-digit', hourCycle: 'h23', timeZone: 'UTC' }),
    ).toBe('12');
    expect(instant.toISOString()).toBe('2026-01-01T12:00:00.000Z');
});

test('renders all selectors from one server bootstrap without localization or browser storage', async () => {
    const preferences = createPreferences({
        ...bootstrap,
        appearance: 'dark',
        locale: 'pt-BR',
        timezone: 'America/Sao_Paulo',
    });
    const app = createSSRApp({
        setup() {
            expect(usePreferences()).toBe(preferences);
            return () =>
                h('main', [
                    h(
                        Appearance,
                        {},
                        {
                            default: ({
                                appearance,
                                pending,
                            }: {
                                appearance: string;
                                pending: boolean;
                            }) => h('output', `${appearance}:${pending}`),
                        },
                    ),
                    h(
                        Language,
                        {},
                        { default: ({ locale }: { locale: string }) => h('output', locale) },
                    ),
                    h(
                        Timezone,
                        {},
                        { default: ({ timezone }: { timezone: string }) => h('output', timezone) },
                    ),
                ]);
        },
    }).use(preferences);
    const html = await renderToString(app);
    expect(html).toContain('dark:false');
    expect(html).toContain('pt-BR');
    expect(html).toContain('America/Sao_Paulo');
});

test('ignores background prefetches and reconciles async refreshes after the active write', () => {
    const { preferences, patch, document, reload, success } = setup();
    preferences.setAppearance('dark');
    preferences.setLocale('pt-BR');
    document.dispatchEvent(
        new CustomEvent('inertia:start', { detail: { visit: { prefetch: true, async: true } } }),
    );
    expect(preferences.pending.value).toBe(true);
    document.dispatchEvent(
        new CustomEvent('inertia:start', { detail: { visit: { prefetch: false, async: true } } }),
    );
    document.dispatchEvent(
        new CustomEvent('inertia:success', { detail: { page: page({ appearance: 'light' }) } }),
    );
    expect(preferences.appearance.value).toBe('system');
    success({ appearance: 'dark' });
    expect(patch).toHaveBeenCalledTimes(1);
    expect(reload).toHaveBeenCalledTimes(1);
    reload.mock.lastCall?.[0]?.onSuccess?.(page({ appearance: 'dark' }));
    expect(preferences.appearance.value).toBe('dark');
    expect(preferences.pending.value).toBe(false);
});

test('uses fresh server props from replace navigation and flushes stale prefetches', () => {
    const { preferences, document } = setup();
    const flush = vi.spyOn(router, 'flushAll');
    document.dispatchEvent(
        new CustomEvent('inertia:start', { detail: { visit: { prefetch: false, async: false } } }),
    );
    document.dispatchEvent(
        new CustomEvent('inertia:success', {
            detail: { page: page({ appearance: 'light', locale: 'pt-BR' }) },
        }),
    );
    expect(preferences.appearance.value).toBe('light');
    expect(preferences.locale.value).toBe('pt-BR');
    expect(preferences.pending.value).toBe(false);
    expect(flush).toHaveBeenCalledTimes(1);
});

test('uses the current installed localization for internal preference failures', () => {
    const { app, preferences, visit } = setup();
    const localization = createLocalization({
        version: 1,
        fallbackLocale: 'en',
        locales: {
            en: { sourceLocale: 'en', label: 'English', messages: {} },
            es: {
                sourceLocale: 'es',
                label: 'Spanish',
                messages: {
                    'front-awesome::preferences.network_failure':
                        'No se pudieron confirmar las preferencias.',
                    'front-awesome::preferences.invalid_locale': 'Elige un idioma disponible.',
                },
            },
        },
    });
    app.use(localization);
    document.documentElement.lang = 'es';
    const observer = new CustomEvent('inertia:success', {
        detail: { page: page({ locale: 'es' }) },
    });
    document.dispatchEvent(observer);
    preferences.setLocale('invalid');
    expect(preferences.errors.value.locale).toBe('Elige un idioma disponible.');
    preferences.setAppearance('dark');
    const callback = visit().onNetworkError;
    if (!callback) throw new Error('The visit did not install a network error handler.');
    expect(Reflect.apply(callback, undefined, [new Error('offline')])).toBe(false);
    expect(preferences.errors.value.appearance).toBe('No se pudieron confirmar las preferencias.');
});

test('global navigation guards can reject both external visits and preference writes without leaving pending state', () => {
    const { preferences, patch, reload } = setup();
    patch.mockRestore();
    reload.mockRestore();
    const stop = router.on('before', () => false);
    onTestFinished(stop);
    router.get('/other-page');
    expect(preferences.pending.value).toBe(false);
    preferences.setAppearance('light');
    expect(preferences.pending.value).toBe(false);
    expect(preferences.appearance.value).toBe('system');
    expect(preferences.errors.value.appearance).toBe('This preference was not accepted.');
    preferences.refresh();
    expect(preferences.pending.value).toBe(false);
    expect(preferences.error.value).toBeDefined();
});

test('seeds server rendered translations from the confirmed preference locale', () => {
    const app = createSSRApp({ render: () => null });
    app.use(createPreferences({ ...bootstrap, locale: 'es' }));
    const localization = createLocalization({
        version: 1,
        fallbackLocale: 'en',
        locales: {
            en: { sourceLocale: 'en', label: 'English', messages: { hello: 'Hello' } },
            es: { sourceLocale: 'es', label: 'Spanish', messages: { hello: 'Hola' } },
        },
    });
    app.use(localization);
    expect(localization.t('hello')).toBe('Hola');
});

test('does not invalidate host prefetches for unchanged navigation snapshots', () => {
    const { document } = setup();
    const flush = vi.spyOn(router, 'flushAll');
    navigate(document, {}, { type: 'visit', cached: false });
    document.dispatchEvent(new CustomEvent('inertia:success', { detail: { page: page() } }));
    expect(flush).not.toHaveBeenCalled();
    navigate(document, { locale: 'pt-BR' }, { type: 'visit', cached: false });
    document.dispatchEvent(
        new CustomEvent('inertia:success', { detail: { page: page({ locale: 'pt-BR' }) } }),
    );
    expect(flush).toHaveBeenCalledTimes(1);
});

test('accepts server-supported historical timezone identifiers without requiring the browser ICU version to match PHP', () => {
    expect(
        createPreferences({
            ...bootstrap,
            timezone: 'CET',
            timezones: ['UTC', 'CET', 'America/Coyhaique'],
        }).timezone.value,
    ).toBe('CET');
});

test('persists nullable currency changes in sequence and validates the authoritative choices', () => {
    const { preferences, patch, success } = setup();
    expect(preferences.currency.value).toBeNull();
    preferences.setCurrency('BRL');
    preferences.setCurrency('USD');
    preferences.setCurrency(null);
    expect(patch.mock.lastCall?.[1]).toEqual({ currency: 'BRL' });
    expect(preferences.currency.value).toBeNull();
    success({ currency: 'BRL' });
    expect(preferences.currency.value).toBe('BRL');
    expect(patch.mock.lastCall?.[1]).toEqual({ currency: 'USD' });
    success({ currency: 'USD' });
    expect(patch.mock.lastCall?.[1]).toEqual({ currency: null });
    success({ currency: null });
    expect(preferences.currency.value).toBeNull();
    preferences.setCurrency('ZZZ');
    expect(patch).toHaveBeenCalledTimes(3);
    expect(preferences.errors.value.currency).toContain('selectable currency');
    expect(() => createPreferences({ ...bootstrap, currency: 'ZZZ' })).toThrow(TypeError);
    expect(() => createPreferences({ ...bootstrap, currency: undefined })).toThrow(TypeError);
});

test('canonicalizes legacy wire locale tags for UI and sends the original tag for validated persistence', () => {
    const environment = browser();
    const preferences = createPreferences({
        ...bootstrap,
        locale: 'iw',
        locales: [{ locale: 'iw', sourceLocale: 'iw', label: 'Hebrew' }],
    });
    const app = renderer.createApp({ render: () => null }).use(preferences);
    app.mount({});
    onTestFinished(() => app.unmount());
    const patch = vi.spyOn(router, 'patch').mockImplementation((_url, _data, options) => {
        if (options?.onStart) Reflect.apply(options.onStart, undefined, []);
    });
    expect(preferences.locale.value).toBe('he');
    expect(preferences.locales[0].locale).toBe('he');
    expect(environment.document.documentElement.lang).toBe('he');
    preferences.setLocale('he');
    expect(patch.mock.lastCall?.[1]).toEqual({ locale: 'iw' });
});

test('leaves fragment-only null-state popstate events outside the Inertia request lifecycle', () => {
    const { preferences, view, reload } = setup();
    view.dispatchEvent(Object.assign(new Event('popstate'), { state: null }));
    expect(preferences.pending.value).toBe(false);
    expect(reload).not.toHaveBeenCalled();
});

test('updates native global Vue I18n named formats from current preferences and restores original explicit options', () => {
    const localization = createLocalization(
        {
            version: 1,
            fallbackLocale: 'en',
            locales: {
                en: { sourceLocale: 'en', label: 'English', messages: {} },
                'pt-BR': { sourceLocale: 'pt_BR', label: 'Portuguese', messages: {} },
            },
        },
        {
            datetimeFormats: {
                en: {
                    hour: { hour: '2-digit', hourCycle: 'h23' },
                    utc: { hour: '2-digit', hourCycle: 'h23', timeZone: 'UTC' },
                },
            },
            numberFormats: {
                en: {
                    money: { style: 'currency' },
                    euros: { style: 'currency', currency: 'EUR' },
                },
            },
        },
    );
    const { preferences, native, success } = setup(localization);
    if (!native) throw new Error('The native useI18n composer was not installed.');
    const instant = new Date('2026-01-01T12:00:00Z');
    expect(native.d(instant, 'hour')).toBe('12');
    expect(native.n(1234.5, 'currency')).toBe(
        new Intl.NumberFormat('en', { style: 'decimal' }).format(1234.5),
    );
    preferences.setTimezone('America/Sao_Paulo');
    success({ timezone: 'America/Sao_Paulo' });
    expect(native.d(instant, 'hour')).toBe('09');
    expect(native.d(instant, 'utc')).toBe('12');
    expect(native.d(instant, { key: 'hour', timeZone: 'UTC' })).toBe('12');
    expect(native.d(instant, 'preference')).toBe(
        new Intl.DateTimeFormat('en', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'America/Sao_Paulo',
        }).format(instant),
    );
    for (const currency of ['BRL', 'USD', null]) {
        preferences.setCurrency(currency);
        success({ timezone: 'America/Sao_Paulo', currency });
        const expected = new Intl.NumberFormat(
            'en',
            currency === null ? { style: 'decimal' } : { style: 'currency', currency },
        ).format(1234.5);
        expect(native.n(1234.5, 'currency')).toBe(expected);
        expect(localization.n(1234.5, 'currency')).toBe(expected);
        expect(native.n(1234.5, 'euros')).toBe(
            new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' }).format(1234.5),
        );
        if (currency !== null) expect(native.n(1234.5, 'money')).toBe(expected);
    }
    expect(() => native.n(1234.5, 'money')).toThrow('Currency code is required');
    expect(native.d(instant, 'utc')).toBe('12');
});

test('renders nullable currency slots and native preference formatting during SSR', async () => {
    const preferences = createPreferences({
        ...bootstrap,
        locale: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
    });
    const localization = createLocalization({
        version: 1,
        fallbackLocale: 'en',
        locales: {
            en: { sourceLocale: 'en', label: 'English', messages: {} },
            'pt-BR': { sourceLocale: 'pt_BR', label: 'Portuguese', messages: {} },
        },
    });
    const instant = new Date('2026-01-01T00:00:00Z');
    const app = createSSRApp({
        setup() {
            const { n, d } = useI18n({ useScope: 'global' });
            return () =>
                h('main', [
                    h('output', n(12, 'currency')),
                    h('output', d(instant, 'preference')),
                    h(
                        Currency,
                        {},
                        {
                            default: ({ currency }: { currency: string | null }) =>
                                h('output', currency ?? 'None'),
                        },
                    ),
                ]);
        },
    })
        .use(preferences)
        .use(localization);
    const html = await renderToString(app);
    expect(html).toContain(
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(12),
    );
    expect(html).toContain(
        new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'America/Sao_Paulo',
        }).format(instant),
    );
    expect(html).toContain('BRL');
});

test('preserves native Composer formats added later and explicit replacements of preference-backed formats', () => {
    const localization = createLocalization(
        {
            version: 1,
            fallbackLocale: 'en',
            locales: {
                en: { sourceLocale: 'en', label: 'English', messages: {} },
            },
        },
        {
            datetimeFormats: { en: { hour: { hour: '2-digit', hourCycle: 'h23' } } },
            numberFormats: { en: { money: { style: 'currency' } } },
        },
    );
    const { preferences, native, success } = setup(localization);
    if (!native) throw new Error('The native useI18n composer was not installed.');
    preferences.setCurrency('BRL');
    success({ currency: 'BRL' });
    native.mergeNumberFormat('en', {
        foreignLedger: { style: 'currency', currency: 'CAD' },
        currency: { style: 'currency', currency: 'CAD' },
        money: { style: 'currency', currency: 'CAD' },
    });
    native.mergeDateTimeFormat('en', {
        foreignDate: { timeZone: 'Asia/Tokyo', hour: '2-digit', hourCycle: 'h23' },
        hour: { timeZone: 'Asia/Tokyo', hour: '2-digit', hourCycle: 'h23' },
    });
    const instant = new Date('2026-01-01T12:00:00Z');
    const cad = new Intl.NumberFormat('en', { style: 'currency', currency: 'CAD' }).format(42);
    for (const currency of ['USD', null]) {
        preferences.setCurrency(currency);
        success({ currency, timezone: 'America/Sao_Paulo' });
        expect(native.n(42, 'foreignLedger')).toBe(cad);
        expect(native.n(42, 'currency')).toBe(cad);
        expect(native.n(42, 'money')).toBe(cad);
        expect(native.d(instant, 'foreignDate')).toBe('21');
        expect(native.d(instant, 'hour')).toBe('21');
    }
});

test('retains direct native format edits while preference defaults continue to follow untouched fields', () => {
    const localization = createLocalization(
        {
            version: 1,
            fallbackLocale: 'en',
            locales: {
                en: { sourceLocale: 'en', label: 'English', messages: {} },
            },
        },
        { numberFormats: { en: { money: { style: 'currency' } } } },
    );
    const { preferences, native, success } = setup(localization);
    if (!native) throw new Error('The native useI18n composer was not installed.');
    preferences.setCurrency('BRL');
    success({ currency: 'BRL' });
    native.getNumberFormat<{ money: Intl.NumberFormatOptions }>('en').money.currency = 'CAD';
    preferences.setCurrency('USD');
    success({ currency: 'USD' });
    expect(native.n(42, 'money')).toBe(
        new Intl.NumberFormat('en', { style: 'currency', currency: 'CAD' }).format(42),
    );
    expect(native.n(42, 'currency')).toBe(
        new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(42),
    );
});
