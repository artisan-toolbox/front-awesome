<template>
    <slot :appearance="appearance" :toggle="toggle" :system="system" :dark="dark" :light="light" />
</template>

<script setup lang="ts">
import { computed, inject, onMounted, shallowRef } from 'vue';
import { appearanceKey } from '../appearance';
import type { AppearancePreference } from '../appearance';

defineOptions({ inheritAttrs: false });

defineSlots<{
    default(props: {
        appearance: AppearancePreference;
        toggle: () => void;
        system: () => void;
        dark: () => void;
        light: () => void;
    }): unknown;
}>();

const controller = inject(appearanceKey, undefined);

if (controller === undefined) {
    throw new Error('Appearance requires app.use(createFrontAwesome({ appearance: true })).');
}

const mounted = shallowRef(false);
const appearance = computed(() => (mounted.value ? controller.appearance.value : 'system'));
const { setAppearance, toggle } = controller;
const system = () => setAppearance('system');
const dark = () => setAppearance('dark');
const light = () => setAppearance('light');

onMounted(() => {
    mounted.value = true;
});
</script>
