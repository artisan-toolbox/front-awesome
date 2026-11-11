import { watch } from 'vue';
import type { LocalizationOptions } from '../localization/types';
import type { PreferencesService } from './types';

interface Formats {
    getDateTimeFormat(locale: string): Record<string, Intl.DateTimeFormatOptions>;
    getNumberFormat(locale: string): Record<string, Intl.NumberFormatOptions>;
    mergeDateTimeFormat(locale: string, formats: Record<string, Intl.DateTimeFormatOptions>): void;
    mergeNumberFormat(locale: string, formats: Record<string, Intl.NumberFormatOptions>): void;
}

function retainConsumerChanges<
    Format extends Intl.DateTimeFormatOptions | Intl.NumberFormatOptions,
>(
    baseline: Format,
    current: Format | undefined,
    previous: Format | undefined,
    replaced: boolean,
): void {
    if (!previous || !current) return;
    for (const key of Object.keys(previous)) {
        if (!Object.hasOwn(current, key)) Reflect.deleteProperty(baseline, key);
    }
    for (const [key, value] of Object.entries(current)) {
        if (
            replaced ||
            !Object.hasOwn(previous, key) ||
            !Object.is(Reflect.get(previous, key), value)
        )
            Reflect.set(baseline, key, value);
    }
}

export function installPreferenceFormats(
    preferences: PreferencesService,
    composer: Formats,
    options: LocalizationOptions,
    locales: readonly string[],
): () => void {
    const dates: Record<string, Record<string, Intl.DateTimeFormatOptions>> = Object.fromEntries(
        locales.map((locale) => [
            locale,
            {
                preference: { dateStyle: 'medium', timeStyle: 'short' },
                ...Object.fromEntries(
                    Object.entries(options.datetimeFormats?.[locale] ?? {}).map(([key, format]) => [
                        key,
                        { ...format },
                    ]),
                ),
            },
        ]),
    );
    const numbers: Record<string, Record<string, Intl.NumberFormatOptions>> = Object.fromEntries(
        locales.map((locale) => [
            locale,
            {
                currency: {},
                ...Object.fromEntries(
                    Object.entries(options.numberFormats?.[locale] ?? {}).map(([key, format]) => [
                        key,
                        { ...format },
                    ]),
                ),
            },
        ]),
    );
    const lastDates = new Map<string, Record<string, Intl.DateTimeFormatOptions>>();
    const lastNumbers = new Map<string, Record<string, Intl.NumberFormatOptions>>();
    const dateReferences = new Map<string, Record<string, Intl.DateTimeFormatOptions>>();
    const numberReferences = new Map<string, Record<string, Intl.NumberFormatOptions>>();

    return watch(
        [preferences.timezone, preferences.currency],
        ([timezone, currency]) => {
            for (const locale of locales) {
                const currentDates = composer.getDateTimeFormat(locale);
                const datetimeFormats: Record<string, Intl.DateTimeFormatOptions> = {};
                for (const [key, baseline] of Object.entries(dates[locale])) {
                    retainConsumerChanges(
                        baseline,
                        currentDates[key],
                        lastDates.get(locale)?.[key],
                        currentDates[key] !== dateReferences.get(locale)?.[key],
                    );
                    datetimeFormats[key] = { timeZone: timezone, ...baseline };
                }
                composer.mergeDateTimeFormat(locale, datetimeFormats);
                lastDates.set(
                    locale,
                    Object.fromEntries(
                        Object.entries(datetimeFormats).map(([key, format]) => [
                            key,
                            { ...format },
                        ]),
                    ),
                );
                dateReferences.set(locale, { ...composer.getDateTimeFormat(locale) });

                const currentNumbers = composer.getNumberFormat(locale);
                const numberFormats: Record<string, Intl.NumberFormatOptions> = {};
                for (const [key, baseline] of Object.entries(numbers[locale])) {
                    retainConsumerChanges(
                        baseline,
                        currentNumbers[key],
                        lastNumbers.get(locale)?.[key],
                        currentNumbers[key] !== numberReferences.get(locale)?.[key],
                    );
                    numberFormats[key] = {
                        ...(key === 'currency'
                            ? { style: currency === null ? 'decimal' : 'currency' }
                            : {}),
                        ...(currency === null ? {} : { currency }),
                        ...baseline,
                    };
                }
                composer.mergeNumberFormat(locale, numberFormats);
                lastNumbers.set(
                    locale,
                    Object.fromEntries(
                        Object.entries(numberFormats).map(([key, format]) => [key, { ...format }]),
                    ),
                );
                numberReferences.set(locale, { ...composer.getNumberFormat(locale) });
            }
        },
        { immediate: true, flush: 'sync' },
    );
}
