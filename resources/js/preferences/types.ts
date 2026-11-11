import type { App, ComputedRef } from 'vue';
import type { LocalizationLocale } from '../localization/types';
import type { AppearancePreference } from './appearance';

export interface Preferences {
    readonly appearance: AppearancePreference;
    readonly locale: string;
    readonly timezone: string;
    readonly currency: string | null;
}

export type PreferenceField = keyof Preferences;
export type PreferenceErrors = Readonly<Partial<Record<PreferenceField, string>>>;

export interface PreferencesBootstrap extends Preferences {
    readonly key: string;
    readonly updateUrl: string;
    readonly locales: readonly LocalizationLocale[];
    readonly timezones: readonly string[];
    readonly currencies: readonly string[];
}

export interface PreferencesService {
    readonly appearance: ComputedRef<AppearancePreference>;
    readonly resolvedAppearance: ComputedRef<'light' | 'dark'>;
    readonly locale: ComputedRef<string>;
    readonly timezone: ComputedRef<string>;
    readonly currency: ComputedRef<string | null>;
    readonly locales: readonly LocalizationLocale[];
    readonly timezones: readonly string[];
    readonly currencies: readonly string[];
    readonly pending: ComputedRef<boolean>;
    readonly errors: ComputedRef<PreferenceErrors>;
    readonly error: ComputedRef<string | undefined>;
    setAppearance(this: void, value: AppearancePreference): void;
    setLocale(this: void, value: string): void;
    setTimezone(this: void, value: string): void;
    setCurrency(this: void, value: string | null): void;
    /** Format an instant using the confirmed locale and timezone; explicit options override defaults. */
    formatDate(this: void, value: Date | number, options?: Intl.DateTimeFormatOptions): string;
    /** Reload current server preferences after an uncertain response or cached history visit. */
    refresh(this: void): void;
    install(app: App): void;
}
