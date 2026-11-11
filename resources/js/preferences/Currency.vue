<template>
    <slot
        :currency="currency"
        :currencies="currencies"
        :setCurrency="setCurrency"
        :pending="pending"
        :error="error"
    />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePreferences } from './context';

defineOptions({ inheritAttrs: false });
defineSlots<{
    default(props: {
        currency: string | null;
        currencies: readonly string[];
        setCurrency: (currency: string | null) => void;
        pending: boolean;
        error: string | undefined;
    }): unknown;
}>();
const preferences = usePreferences();
const { currency, setCurrency, pending } = preferences;
const currencies = computed(() => preferences.currencies);
const error = computed(() => preferences.errors.value.currency ?? preferences.error.value);
</script>
