import { canonicalLocale } from '../localization/catalog';
import type { LocalizationLocale } from '../localization/types';
import type { AppearancePreference } from './appearance';
import type { PreferencesBootstrap } from './types';

interface ParsedPreferences extends PreferencesBootstrap {
    readonly wireLocales: ReadonlyMap<string, string>;
}

function record(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isAppearance(value: unknown): value is AppearancePreference {
    return value === 'system' || value === 'light' || value === 'dark';
}

function isTimezone(value: unknown): value is string {
    return typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_+./-]*$/.test(value);
}

function parseLocale(value: unknown): LocalizationLocale {
    if (
        !record(value) ||
        typeof value.locale !== 'string' ||
        !canonicalLocale(value.locale) ||
        typeof value.sourceLocale !== 'string' ||
        !canonicalLocale(value.sourceLocale) ||
        typeof value.label !== 'string' ||
        !value.label
    )
        throw new TypeError('Front Awesome preferences contain an invalid selectable locale.');
    return Object.freeze({
        locale: canonicalLocale(value.locale) ?? value.locale,
        sourceLocale: value.sourceLocale,
        label: value.label,
    });
}

export function parsePreferences(value: unknown): ParsedPreferences {
    if (
        !record(value) ||
        !isAppearance(value.appearance) ||
        typeof value.locale !== 'string' ||
        !canonicalLocale(value.locale) ||
        !isTimezone(value.timezone) ||
        !(
            value.currency === null ||
            (typeof value.currency === 'string' && /^[A-Z]{3}$/.test(value.currency))
        ) ||
        typeof value.key !== 'string' ||
        !/^[A-Za-z_][A-Za-z0-9_]{0,62}$/.test(value.key) ||
        [
            '__proto__',
            'prototype',
            'constructor',
            'errors',
            'auth',
            'flash',
            'deferredProps',
            'onceProps',
        ].includes(value.key) ||
        typeof value.updateUrl !== 'string' ||
        !/^\/(?!\/)/.test(value.updateUrl) ||
        /[\s\\#]/.test(value.updateUrl) ||
        !Array.isArray(value.locales) ||
        !value.locales.length ||
        !Array.isArray(value.timezones) ||
        !value.timezones.length ||
        !Array.isArray(value.currencies) ||
        !value.currencies.length
    )
        throw new TypeError('Front Awesome preferences require the server bootstrap payload.');
    const locales = value.locales.map(parseLocale);
    const wireLocales = new Map<string, string>();
    for (const entry of value.locales) {
        if (record(entry) && typeof entry.locale === 'string') {
            const locale = canonicalLocale(entry.locale);
            if (locale) wireLocales.set(locale, entry.locale);
        }
    }
    const timezones = value.timezones.map((timezone: unknown) => {
        if (!isTimezone(timezone))
            throw new TypeError(
                'Front Awesome preferences contain an invalid selectable timezone.',
            );
        return timezone;
    });
    const currencies = value.currencies.map((currency: unknown) => {
        if (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency))
            throw new TypeError(
                'Front Awesome preferences contain an invalid selectable currency.',
            );
        return currency;
    });
    if (
        new Set(locales.map(({ locale }) => locale)).size !== locales.length ||
        new Set(timezones).size !== timezones.length ||
        !timezones.includes(value.timezone) ||
        new Set(currencies).size !== currencies.length ||
        (value.currency !== null && !currencies.includes(value.currency))
    )
        throw new TypeError(
            'Front Awesome preference choices must be unique and include the timezone.',
        );
    return Object.freeze({
        appearance: value.appearance,
        locale: canonicalLocale(value.locale) ?? value.locale,
        timezone: value.timezone,
        currency: value.currency,
        key: value.key,
        updateUrl: value.updateUrl,
        locales: Object.freeze(locales),
        timezones: Object.freeze(timezones),
        currencies: Object.freeze(currencies),
        wireLocales,
    });
}
