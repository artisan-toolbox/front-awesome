<template>
    <slot :theme="theme" :toggle="toggle" :system="system" :dark="dark" :light="light" />
</template>

<script setup lang="ts">
import { computed, inject, onMounted, shallowRef } from 'vue';
import { themeKey } from '../theme';
import type { ThemePreference } from '../theme';

defineOptions({ inheritAttrs: false });

defineSlots<{
    default(props: {
        theme: ThemePreference;
        toggle: () => void;
        system: () => void;
        dark: () => void;
        light: () => void;
    }): unknown;
}>();

const controller = inject(themeKey, undefined);

if (controller === undefined) {
    throw new Error('Theme requires app.use(createFrontAwesome({ theme: true })).');
}

const mounted = shallowRef(false);
const theme = computed(() => (mounted.value ? controller.theme.value : 'system'));
const { setTheme, toggle } = controller;
const system = () => setTheme('system');
const dark = () => setTheme('dark');
const light = () => setTheme('light');

onMounted(() => {
    mounted.value = true;
});
</script>
