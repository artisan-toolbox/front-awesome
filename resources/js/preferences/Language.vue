<template>
    <slot
        :locale="locale"
        :locales="locales"
        :setLocale="setLocale"
        :pending="pending"
        :error="error"
    />
</template>

<script setup lang="ts">
import { useLocalization } from '../localization/context';
import type { LocalizationLocale } from '../localization/types';
import { computed, inject } from 'vue';
import { preferencesKey } from './context';

defineOptions({ inheritAttrs: false });
defineSlots<{
    default(props: {
        locale: string;
        locales: readonly LocalizationLocale[];
        setLocale: (locale: string) => void;
        pending: boolean;
        error: string | undefined;
    }): unknown;
}>();
const preferences = inject(preferencesKey, undefined);
const localization = preferences ?? useLocalization();
const { locale, setLocale } = localization;
const locales = computed(() => localization.locales);
const pending = computed(() => preferences?.pending.value ?? false);
const error = computed(() => preferences?.errors.value.locale ?? preferences?.error.value);
</script>
