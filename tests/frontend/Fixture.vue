<template>
    <Theme v-slot="{ theme, system, dark, light, toggle }">
        <output data-testid="theme-preference">{{ theme }}</output>
        <ButtonGroup v-bind="groupProps" data-testid="theme-controls">
            <Button type="button" :aria-pressed="theme === 'system'" @click="system">System</Button>
            <Button type="button" :aria-pressed="theme === 'dark'" @click="dark">Dark</Button>
            <Button type="button" :aria-pressed="theme === 'light'" @click="light">Light</Button>
            <Button type="button" @click="toggle">Toggle theme</Button>
        </ButtonGroup>
    </Theme>
    <p data-testid="theme-tailwind" class="text-black dark:text-white">Tailwind color mode</p>

    <Button @click="showMosaicastToast">Show Mosaicast toast</Button>
    <Button @click="showFlashToasts">Show Inertia flash toasts</Button>
    <Button @click="router.flash('unrelated', true)">Flash unrelated data</Button>
    <Button @click="toast.show('Toast from setup.', { duration: 0 })">Show toast from setup</Button>
    <Button @click="$frontAwesome.toast.show('Toast from template.', { duration: 0 })">
        Show toast from template
    </Button>
</template>

<script setup lang="ts">
import { mosaicast } from '@artisan-toolbox/mosaicast';
import { router } from '@inertiajs/vue3';
import { useToast } from '@artisan-toolbox/front-awesome';
import { Button, ButtonGroup, Theme } from '@artisan-toolbox/front-awesome/components';
import type { ButtonGroupProps } from '@artisan-toolbox/front-awesome/components';

const toast = useToast();
const groupProps = { label: 'Appearance', orientation: 'horizontal' } satisfies ButtonGroupProps;

function showMosaicastToast(): void {
    mosaicast().emit(
        'front-awesome.toast',
        {
            message: 'Order <123> saved.',
            options: { variant: 'success', duration: 0, icon: 'check', size: 'l' },
        },
        'inertia',
    );
}

function showFlashToasts(): void {
    router.flash('front-awesome.toasts', [
        { message: 'Inventory is low.', options: { variant: 'warning', duration: 0 } },
        { message: 'Malformed toast', options: { variant: 'invalid' } },
        {
            message: '<strong>Review pending orders.</strong>',
            options: { variant: 'brand', duration: 0, allowHtml: true },
        },
    ]);
}
</script>
