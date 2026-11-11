import type { LaravelLocalizationCatalog } from './types';
import { canonicalLocale } from './canonicalLocale.mjs';

export { canonicalLocale } from './canonicalLocale.mjs';

function record(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function validateCatalog(value: unknown): asserts value is LaravelLocalizationCatalog {
    if (!record(value) || value.version !== 1)
        throw new TypeError(
            'Front Awesome localization requires catalog version 1. Regenerate the Laravel translation catalog.',
        );
    if (
        typeof value.fallbackLocale !== 'string' ||
        !record(value.locales) ||
        !Object.keys(value.locales).length
    )
        throw new TypeError(
            'Front Awesome localization requires a fallback locale and a nonempty locales object.',
        );
    if (!Object.hasOwn(value.locales, value.fallbackLocale))
        throw new TypeError(
            'Front Awesome localization fallbackLocale must name an exported locale.',
        );
    for (const [locale, entry] of Object.entries(value.locales)) {
        if (
            !canonicalLocale(locale) ||
            !record(entry) ||
            typeof entry.sourceLocale !== 'string' ||
            !canonicalLocale(entry.sourceLocale) ||
            typeof entry.label !== 'string' ||
            !entry.label ||
            !record(entry.messages) ||
            Object.values(entry.messages).some((message) => typeof message !== 'string')
        )
            throw new TypeError(
                `Front Awesome localization catalog has an invalid locale entry "${locale}". Regenerate it with Laravel.`,
            );
    }
    if (
        value.availableLocales !== undefined &&
        (!Array.isArray(value.availableLocales) ||
            value.availableLocales.length === 0 ||
            value.availableLocales.some((locale: unknown) => typeof locale !== 'string'))
    ) {
        throw new TypeError(
            'Front Awesome localization availableLocales must be a nonempty list of locale IDs.',
        );
    }
}

export function parseCatalog(
    value: unknown,
): LaravelLocalizationCatalog & { availableLocales: readonly string[] } {
    validateCatalog(value);
    const locales: LaravelLocalizationCatalog['locales'] = {};
    for (const [tag, entry] of Object.entries(value.locales)) {
        const locale = canonicalLocale(tag);
        if (!locale)
            throw new TypeError(
                `Front Awesome localization catalog has an invalid locale entry "${tag}".`,
            );
        if (Object.hasOwn(locales, locale))
            throw new TypeError(
                `Front Awesome localization catalog contains duplicate canonical locale "${locale}".`,
            );
        locales[locale] = { ...entry, messages: { ...entry.messages } };
    }
    const fallbackLocale = canonicalLocale(value.fallbackLocale);
    if (!fallbackLocale || !Object.hasOwn(locales, fallbackLocale))
        throw new TypeError(
            'Front Awesome localization fallbackLocale must name an exported locale.',
        );
    const availableLocales: string[] = [];
    for (const tag of value.availableLocales ?? Object.keys(value.locales)) {
        const locale = canonicalLocale(tag);
        if (!locale || !Object.hasOwn(locales, locale) || availableLocales.includes(locale)) {
            throw new TypeError(
                'Front Awesome localization availableLocales must reference unique exported locales.',
            );
        }
        availableLocales.push(locale);
    }
    return { version: 1, fallbackLocale, availableLocales, locales };
}
