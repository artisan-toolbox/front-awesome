import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { createApp } from 'vue';
import { createLocalization } from '../../resources/js/localization';
import catalog from './fixtures/printingCatalog.json';

const loaders = vi.hoisted(() => ({
    en: vi.fn(async () => {}),
    es: vi.fn<() => Promise<unknown>>(),
    pt: vi.fn(async () => {}),
}));
vi.mock('virtual:front-awesome/web-awesome-locales', () => ({ default: loaders }));

function deferred() {
    let resolve: (value?: unknown) => void = () => {};
    let reject: (error: Error) => void = () => {};
    const promise = new Promise<unknown>((done, fail) => {
        resolve = done;
        reject = fail;
    });
    return { promise, resolve, reject };
}

test('caches imports, reports retryable failures and prevents late imports from changing the HTML locale', async () => {
    const original = document.documentElement.lang;
    document.documentElement.lang = 'en';
    const container = document.createElement('div');
    document.body.append(container);
    const localization = createLocalization(catalog);
    const app = createApp({ render: () => null }).use(localization);
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
        document.documentElement.lang = original;
    });
    await localization.retryWebAwesome();
    expect(loaders.en).toHaveBeenCalledTimes(1);
    const stale = deferred();
    loaders.es.mockImplementationOnce(() => stale.promise);
    localization.setLocale('es');
    await expect.poll(() => loaders.es.mock.calls.length).toBe(1);
    localization.setLocale('pt-BR');
    await localization.retryWebAwesome();
    stale.reject(new Error('Previous locale failed.'));
    await Promise.resolve();
    await Promise.resolve();
    expect(localization.webAwesomeError.value).toBeUndefined();
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(localization.locale.value).toBe('pt-BR');
    expect(loaders.pt).toHaveBeenCalledTimes(1);
    loaders.es.mockRejectedValueOnce(new Error('Translation unavailable.'));
    localization.setLocale('es');
    await expect
        .poll(() => localization.webAwesomeError.value?.message)
        .toContain('retryWebAwesome');
    expect(document.documentElement.lang).toBe('es');
    loaders.es.mockResolvedValueOnce({});
    await localization.retryWebAwesome();
    expect(loaders.es).toHaveBeenCalledTimes(3);
    expect(localization.webAwesomeError.value).toBeUndefined();
    await localization.retryWebAwesome();
    expect(loaders.es).toHaveBeenCalledTimes(3);
});
