import { expectTypeOf, test } from 'vite-plus/test';
import type { ComputedRef } from 'vue';
import { createPreferences, usePreferences } from '@artisan-toolbox/front-awesome';
import type {
    AppearancePreference,
    FrontAwesomeOptions,
    PreferenceErrors,
    PreferencesService,
} from '@artisan-toolbox/front-awesome';
import Appearance from '@artisan-toolbox/front-awesome/components/Appearance.vue';
import Language from '@artisan-toolbox/front-awesome/components/Language.vue';
import Timezone from '@artisan-toolbox/front-awesome/components/Timezone.vue';
import Currency from '@artisan-toolbox/front-awesome/components/Currency.vue';
import { Timezone as NamedTimezone } from '@artisan-toolbox/front-awesome/components';
import DirectTimezone from '@artisan-toolbox/front-awesome/preferences/Timezone.vue';

test('exposes readonly service state, typed actions and all renderless slot contracts', () => {
    type AppearanceSlot = Parameters<InstanceType<typeof Appearance>['$slots']['default']>[0];
    type LanguageSlot = Parameters<InstanceType<typeof Language>['$slots']['default']>[0];
    type TimezoneSlot = Parameters<InstanceType<typeof Timezone>['$slots']['default']>[0];
    type CurrencySlot = Parameters<InstanceType<typeof Currency>['$slots']['default']>[0];
    expectTypeOf(createPreferences).returns.toEqualTypeOf<PreferencesService>();
    expectTypeOf(usePreferences).returns.toEqualTypeOf<PreferencesService>();
    expectTypeOf<FrontAwesomeOptions['preferences']>().toEqualTypeOf<
        PreferencesService | undefined
    >();
    expectTypeOf<PreferencesService['appearance']>().toEqualTypeOf<
        ComputedRef<AppearancePreference>
    >();
    expectTypeOf<PreferencesService['resolvedAppearance']>().toEqualTypeOf<
        ComputedRef<'dark' | 'light'>
    >();
    expectTypeOf<PreferencesService['locale']>().toEqualTypeOf<ComputedRef<string>>();
    expectTypeOf<PreferencesService['timezone']>().toEqualTypeOf<ComputedRef<string>>();
    expectTypeOf<PreferencesService['currency']>().toEqualTypeOf<ComputedRef<string | null>>();
    expectTypeOf<CurrencySlot['currency']>().toEqualTypeOf<string | null>();
    expectTypeOf<CurrencySlot['setCurrency']>().parameter(0).toEqualTypeOf<string | null>();
    expectTypeOf<CurrencySlot['currencies']>().toEqualTypeOf<readonly string[]>();
    expectTypeOf<PreferencesService['errors']>().toEqualTypeOf<ComputedRef<PreferenceErrors>>();
    expectTypeOf<AppearanceSlot['appearance']>().toEqualTypeOf<AppearancePreference>();
    expectTypeOf<AppearanceSlot['dark']>().returns.toBeVoid();
    expectTypeOf<AppearanceSlot['pending']>().toEqualTypeOf<boolean>();
    expectTypeOf<LanguageSlot['setLocale']>().parameter(0).toEqualTypeOf<string>();
    expectTypeOf<TimezoneSlot['setTimezone']>().parameter(0).toEqualTypeOf<string>();
    expectTypeOf<TimezoneSlot['timezones']>().toEqualTypeOf<readonly string[]>();
    expectTypeOf<TimezoneSlot['pending']>().toEqualTypeOf<boolean>();
    expectTypeOf<TimezoneSlot['error']>().toEqualTypeOf<string | undefined>();
    expectTypeOf(NamedTimezone).toEqualTypeOf(DirectTimezone);
    if (process.env.FRONT_AWESOME_TYPE_ERRORS) {
        const preferences = usePreferences();
        // @ts-expect-error Appearance choices remain a closed public union.
        preferences.setAppearance('sepia');
        // @ts-expect-error Currency resets use null, not undefined.
        preferences.setCurrency(undefined);
        // @ts-expect-error Confirmed state cannot be changed without persistence.
        preferences.timezone.value = 'UTC';
        // @ts-expect-error Readonly server choices cannot be replaced by consumer state.
        preferences.timezones.push('UTC');
        // @ts-expect-error Native Intl format options remain typed.
        preferences.formatDate(new Date(), { hourCycle: 'invalid' });
    }
});
