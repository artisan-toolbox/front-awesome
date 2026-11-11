import { expectTypeOf, test } from 'vite-plus/test';
import type { ComputedRef } from 'vue';
import { createLocalization } from '../../resources/js/localization';
import type { LocalizationOptions } from '../../resources/js/localization';
import type { Composer } from 'vue-i18n';
import catalog from './fixtures/printingCatalog.json';

type CatalogMessages = typeof catalog.locales.en.messages;
declare module 'vue-i18n' {
    interface DefineLocaleMessage extends CatalogMessages {}
}

test('accepts generated JSON and native Vue I18n formatting options with generated schema augmentation', () => {
    const localization = createLocalization(catalog, {
        numberFormats: { en: { money: { style: 'currency', currency: 'USD' } } },
        datetimeFormats: { en: { short: { year: 'numeric', timeZone: 'UTC' } } },
        missingWarn: false,
        fallbackWarn: false,
        escapeParameter: true,
    });
    expectTypeOf(localization.locale).toEqualTypeOf<ComputedRef<string>>();
    expectTypeOf(localization.t).toEqualTypeOf<Composer['t']>();
    expectTypeOf(localization.n).toEqualTypeOf<Composer['n']>();
    expectTypeOf(localization.d).toEqualTypeOf<Composer['d']>();
    if (process.env.FRONT_AWESOME_TYPE_ERRORS) {
        // @ts-expect-error The HTML element owns the active locale.
        localization.locale.value = 'es';
        // @ts-expect-error Laravel catalogs own all translated messages.
        const messages: LocalizationOptions = { messages: {} };
        // @ts-expect-error The HTML element owns the active locale.
        const locale: LocalizationOptions = { locale: 'en' };
        // @ts-expect-error Laravel catalogs own the fallback locale.
        const fallback: LocalizationOptions = { fallbackLocale: 'es' };
        // @ts-expect-error The adapter uses supported Laravel message functions.
        const compiler: LocalizationOptions = { messageCompiler: () => () => '' };
        const format: LocalizationOptions = {
            // @ts-expect-error Native Intl currency displays remain typed.
            numberFormats: { en: { money: { currencyDisplay: 'invalid' } } },
        };
        void [messages, locale, fallback, compiler, format];
    }
});
