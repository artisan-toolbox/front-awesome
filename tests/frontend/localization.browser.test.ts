import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { page } from 'vitest/browser';
import { createApp, h } from 'vue';
import { createLocalization } from '../../resources/js/localization';
import type { LocalizationOptions } from '../../resources/js/localization';
import Fixture from './fixtures/LocalizationFixture.vue';
import catalog from './fixtures/printingCatalog.json';
import '@artisan-toolbox/front-awesome/web-awesome.css';

const options: LocalizationOptions = {
    numberFormats: {
        en: { money: { style: 'currency', currency: 'USD' } },
        es: { money: { style: 'currency', currency: 'EUR' } },
        'pt-BR': { money: { style: 'currency', currency: 'BRL' } },
    },
    datetimeFormats: Object.fromEntries(
        ['en', 'es', 'pt-BR'].map((locale) => [
            locale,
            { short: { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' } },
        ]),
    ),
};
function nativeCopyButton() {
    return document.querySelector('wa-copy-button')?.shadowRoot?.querySelector('button');
}
function mount(lang: string, visible = true, input: unknown = catalog) {
    const root = document.documentElement;
    const original = root.getAttribute('lang');
    root.lang = lang;
    const container = document.createElement('div');
    document.body.append(container);
    const localization = createLocalization(input, options);
    const app = createApp(visible ? Fixture : { render: () => h('div') }).use(localization);
    app.mount(container);
    let mounted = true;
    const unmount = () => {
        if (mounted) app.unmount();
        mounted = false;
    };
    onTestFinished(() => {
        unmount();
        container.remove();
        if (original === null) root.removeAttribute('lang');
        else root.lang = original;
    });
    return { localization, app, container, unmount };
}

test('follows html.lang in two wrapper-free selectors, native accessible names and Intl formatters', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const { localization } = mount('en');
    const selector = page.getByTestId('language-1');
    await expect.element(page.getByTestId('localized-title')).toHaveTextContent('Print documents');
    await expect.poll(() => nativeCopyButton()?.getAttribute('aria-label')).toBe('Copy');
    const copy = nativeCopyButton();
    if (!copy) throw new Error('The native copy button did not render.');
    await expect.element(copy).toHaveAccessibleName('Copy');
    await selector.getByRole('button', { name: 'Español' }).click();
    expect(document.documentElement.lang).toBe('es');
    expect(localization.locale.value).toBe('es');
    await expect
        .element(page.getByTestId('localized-title'))
        .toHaveTextContent(catalog.locales.es.messages['front-awesome::printing.title']);
    await expect.element(copy).toHaveAccessibleName('Copiar');
    expect(page.getByTestId('language-2').element().querySelector('output')?.textContent).toBe(
        'es',
    );
    expect(page.getByTestId('localized-money').element().textContent).toBe(
        new Intl.NumberFormat('es', { style: 'currency', currency: 'EUR' }).format(1234.5),
    );
    document.documentElement.lang = 'pt_BR';
    await expect.poll(() => localization.locale.value).toBe('pt-BR');
    await localization.retryWebAwesome();
    await expect.element(copy).toHaveAccessibleName('Copiar');
    await expect
        .element(page.getByTestId('localized-title'))
        .toHaveTextContent(catalog.locales['pt-BR'].messages['front-awesome::printing.title']);
    expect(document.documentElement.lang).toBe('pt_BR');
    expect(page.getByTestId('localized-date').element().textContent).toBe(
        new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'UTC',
        }).format(new Date('2026-11-10T12:00:00Z')),
    );
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    await selector.getByRole('button', { name: 'English' }).click();
    await expect.element(copy).toHaveAccessibleName('Copy');
});

test('offers only generated selections while following an externally selected HTML language', async () => {
    const { localization } = mount('en', true, { ...catalog, availableLocales: ['es'] });
    const selector = page.getByTestId('language-1');
    expect(selector.element().querySelectorAll('button')).toHaveLength(1);
    expect(localization.locales.map(({ locale }) => locale)).toEqual(['es']);
    expect(() => localization.setLocale('en')).toThrow('not a selectable');
    await selector.getByRole('button', { name: 'Español' }).click();
    expect(document.documentElement.lang).toBe('es');
    document.documentElement.lang = 'pt_BR';
    await expect.poll(() => localization.locale.value).toBe('pt-BR');
    await expect
        .element(page.getByTestId('localized-title'))
        .toHaveTextContent('Imprimir documentos');
    expect(selector.element().querySelectorAll('button')).toHaveLength(1);
});

test('preserves valid requested regions for Intl and falls back messages independently', async () => {
    const { localization } = mount('es-AR');
    expect(localization.locale.value).toBe('es-AR');
    expect(localization.t('front-awesome::printing.title')).toBe(
        catalog.locales.es.messages['front-awesome::printing.title'],
    );
    expect(localization.n(1234.5)).toBe(new Intl.NumberFormat('es-AR').format(1234.5));
    document.documentElement.lang = 'fr-CA';
    await expect.poll(() => localization.locale.value).toBe('fr-CA');
    expect(localization.t('front-awesome::printing.title')).toBe('Print documents');
    expect(localization.n(1234.5)).toBe(new Intl.NumberFormat('fr-CA').format(1234.5));
    document.documentElement.lang = '!invalid';
    await expect.poll(() => localization.locale.value).toBe('en');
    expect(document.documentElement.lang).toBe('!invalid');
    expect(() => localization.setLocale('fr')).toThrow('not a selectable');
    localization.setLocale('pt_BR');
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(localization.locale.value).toBe('pt-BR');
});

test('synchronizes independent Vue apps and releases each document observer owner on unmount', async () => {
    const first = mount('es', false);
    const second = mount('es', false);
    first.localization.setLocale('pt-BR');
    expect(second.localization.locale.value).toBe('pt-BR');
    first.unmount();
    second.localization.setLocale('en');
    expect(second.localization.locale.value).toBe('en');
    expect(first.localization.locale.value).toBe('pt-BR');
    second.unmount();
    document.documentElement.lang = 'es';
    await Promise.resolve();
    expect(second.localization.locale.value).toBe('en');
    const third = mount('es', false);
    expect(third.localization.locale.value).toBe('es');
});
