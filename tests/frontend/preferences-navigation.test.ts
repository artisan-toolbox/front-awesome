import type { HttpRequestConfig, HttpResponse, Page } from '@inertiajs/core';
import { createRenderer } from 'vue';
import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import type { PreferencesBootstrap } from '../../resources/js/preferences';

const bootstrap = {
    appearance: 'light',
    locale: 'en',
    timezone: 'UTC',
    currency: null,
    currencies: ['USD'],
    key: 'preferences',
    updateUrl: '/preferences',
    locales: [
        { locale: 'en', sourceLocale: 'en', label: 'English' },
        { locale: 'pt-BR', sourceLocale: 'pt_BR', label: 'Portuguese' },
    ],
    timezones: ['UTC'],
} satisfies PreferencesBootstrap;

function page(url: string, locale = 'en'): Page {
    return {
        component: 'Example',
        url,
        version: null,
        props: {
            errors: {},
            preferences: { ...bootstrap, locale },
            title: locale === 'en' ? 'Welcome' : 'Bem-vindo',
        },
        flash: {},
        rescuedProps: [],
        rememberedState: {},
    };
}

async function setup(replace: boolean) {
    vi.resetModules();
    const view = Object.assign(new EventTarget(), {
        location: new URL('https://example.test/initial'),
        navigator: { userAgent: 'Node' },
        requestAnimationFrame: (callback: () => void) => setTimeout(callback, 0),
        setTimeout,
        clearTimeout,
        scrollTo() {},
        scrollX: 0,
        scrollY: 0,
        sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    });
    const history = {
        state: null,
        scrollRestoration: 'auto',
        replaceState(state: null, _unused: string, url: string) {
            this.state = state;
            if (url) view.location = new URL(url, view.location);
        },
        pushState(state: null, unused: string, url: string) {
            this.replaceState(state, unused, url);
        },
    };
    Object.assign(view, { history });
    const document = Object.assign(new EventTarget(), {
        defaultView: view,
        documentElement: { lang: 'en', classList: { toggle() {} } },
        querySelectorAll: () => [],
        querySelector: () => null,
        getElementById: () => null,
    });
    document.addEventListener('inertia:navigate', (event) => {
        if (replace) event.stopImmediatePropagation();
        if (event instanceof CustomEvent && event.detail) {
            Reflect.deleteProperty(event.detail, 'type');
            Reflect.deleteProperty(event.detail, 'cached');
        }
    });
    vi.stubGlobal('window', view);
    vi.stubGlobal('document', document);
    vi.stubGlobal('sessionStorage', view.sessionStorage);
    vi.stubGlobal('requestAnimationFrame', view.requestAnimationFrame);
    const { http, router } = await import('@inertiajs/core');
    const { createPreferences } = await import('../../resources/js/preferences');
    let current = page('/initial', 'pt-BR');
    router.init({
        initialPage: current,
        resolveComponent: () => Promise.resolve({}),
        swapComponent: ({ page }) => {
            current = page;
            return Promise.resolve();
        },
    });
    await Promise.resolve();
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
    const preferences = createPreferences({ ...bootstrap, locale: 'pt-BR' });
    const app = renderer.createApp({ render: () => null }).use(preferences);
    app.mount({});
    const client = http.getClient();
    onTestFinished(() => {
        app.unmount();
        router.cancelAll();
        router.flushAll();
        http.setClient(client);
        vi.unstubAllGlobals();
    });
    return { preferences, document, router, http, current: () => current };
}

test.for([
    { inFlight: false, replace: false },
    { inFlight: true, replace: false },
    { inFlight: false, replace: true },
    { inFlight: true, replace: true },
])(
    'refreshes all translated server props after cached navigation without modern metadata %j',
    async ({ inFlight, replace }) => {
        const { preferences, current, router, http } = await setup(replace);
        const requests: HttpRequestConfig[] = [];
        let releasePrefetch: () => void = () => {
            throw new Error('The prefetch request has not started.');
        };
        http.setClient({
            request(config) {
                requests.push(config);
                const response = (locale: string): HttpResponse => ({
                    status: 200,
                    headers: { 'x-inertia': 'true' },
                    data: JSON.stringify(page('/target', locale)),
                });
                if (config.headers?.Purpose === 'prefetch')
                    return new Promise((resolve) => {
                        releasePrefetch = () => resolve(response('en'));
                    });
                return Promise.resolve(response('pt-BR'));
            },
        });
        router.prefetch('/target', {}, { cacheFor: 60000 });
        await expect.poll(() => requests.length).toBe(1);
        expect(preferences.locale.value).toBe('pt-BR');
        if (!inFlight) {
            releasePrefetch();
            await expect.poll(() => router.getCached('/target')).not.toBeNull();
        }
        router.visit('/target', { replace });
        if (inFlight) releasePrefetch();
        await expect.poll(() => requests.length).toBe(2);
        await expect.poll(() => preferences.pending.value).toBe(false);
        expect(preferences.locale.value).toBe('pt-BR');
        expect(current().props.title).toBe('Bem-vindo');
        expect(requests[1]?.headers?.['X-Inertia-Partial-Data']).toBeUndefined();
        expect(requests[1]?.headers?.Purpose).toBeUndefined();
    },
);

test('leaves a canceled cached visit outside the next client-side navigation', async () => {
    const { preferences, current, router, http } = await setup(false);
    const request = vi.fn(async (): Promise<HttpResponse> => ({
        status: 200,
        headers: { 'x-inertia': 'true' },
        data: JSON.stringify(page('/target')),
    }));
    http.setClient({ request });
    router.prefetch('/target', {}, { cacheFor: 60000 });
    await expect.poll(() => router.getCached('/target')).not.toBeNull();
    const stop = router.on('before', () => false);
    onTestFinished(stop);
    router.visit('/target');
    expect(preferences.pending.value).toBe(false);
    router.push({ url: '/client', props: page('/client', 'pt-BR').props });
    await expect.poll(() => current().url).toBe('/client');
    expect(preferences.locale.value).toBe('pt-BR');
    expect(request).toHaveBeenCalledTimes(1);
});
