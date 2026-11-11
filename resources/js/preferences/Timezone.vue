<template>
    <slot
        :timezone="timezone"
        :timezones="timezones"
        :setTimezone="setTimezone"
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
        timezone: string;
        timezones: readonly string[];
        setTimezone: (timezone: string) => void;
        pending: boolean;
        error: string | undefined;
    }): unknown;
}>();
const preferences = usePreferences();
const { timezone, setTimezone, pending } = preferences;
const timezones = computed(() => preferences.timezones);
const error = computed(() => preferences.errors.value.timezone ?? preferences.error.value);
</script>
