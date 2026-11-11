<template>
    <slot
        :appearance="appearance"
        :toggle="toggle"
        :system="system"
        :dark="dark"
        :light="light"
        :pending="pending"
        :error="error"
    />
</template>

<script setup lang="ts">
import { computed, inject, onMounted, shallowRef } from 'vue';
import { appearanceKey } from './appearance';
import type { AppearancePreference } from './appearance';
import { preferencesKey } from './context';

defineOptions({ inheritAttrs: false });

defineSlots<{
    default(props: {
        appearance: AppearancePreference;
        toggle: () => void;
        system: () => void;
        dark: () => void;
        light: () => void;
        pending: boolean;
        error: string | undefined;
    }): unknown;
}>();

const controller = inject(appearanceKey, undefined);
const preferences = inject(preferencesKey, undefined);
const pending = computed(() => preferences?.pending.value ?? false);
const error = computed(() => preferences?.errors.value.appearance ?? preferences?.error.value);

if (controller === undefined) {
    throw new Error('Appearance requires app.use(createFrontAwesome({ appearance: true })).');
}

const mounted = shallowRef(false);
const appearance = computed(() =>
    controller.serverConfirmed || mounted.value ? controller.appearance.value : 'system',
);
const { setAppearance, toggle } = controller;
const system = () => setAppearance('system');
const dark = () => setAppearance('dark');
const light = () => setAppearance('light');

onMounted(() => {
    mounted.value = true;
});
</script>
