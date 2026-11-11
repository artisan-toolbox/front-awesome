import type { App, ComputedRef } from 'vue';
import type { Composer, ComposerOptions } from 'vue-i18n';

export interface LaravelLocalizationCatalog {
    version: 1;
    fallbackLocale: string;
    availableLocales?: readonly string[];
    locales: Record<
        string,
        {
            sourceLocale: string;
            label: string;
            messages: Record<string, string>;
        }
    >;
}

export interface LocalizationLocale {
    readonly locale: string;
    readonly sourceLocale: string;
    readonly label: string;
}

export type LocalizationOptions = Omit<
    ComposerOptions,
    | 'locale'
    | 'fallbackLocale'
    | 'messages'
    | 'messageResolver'
    | 'messageCompiler'
    | 'inheritLocale'
    | 'flatJson'
    | 'fallbackFormat'
    | 'missing'
    | 'pluralRules'
>;

export interface LocalizationService {
    readonly locale: ComputedRef<string>;
    readonly locales: readonly LocalizationLocale[];
    readonly t: Composer['t'];
    readonly n: Composer['n'];
    readonly d: Composer['d'];
    readonly webAwesomeError: ComputedRef<Error | undefined>;
    setLocale(locale: string): void;
    retryWebAwesome(): Promise<void>;
    install(app: App): void;
}
