<template>
    <Appearance v-slot="{ appearance, system, dark, light, toggle }">
        <output data-testid="appearance-preference">{{ appearance }}</output>
        <ButtonGroup v-bind="groupProps" data-testid="appearance-controls">
            <Button type="button" :aria-pressed="appearance === 'system'" @click="system"
                >System</Button
            >
            <Button type="button" :aria-pressed="appearance === 'dark'" @click="dark">Dark</Button>
            <Button type="button" :aria-pressed="appearance === 'light'" @click="light"
                >Light</Button
            >
            <Button type="button" @click="toggle">Toggle appearance</Button>
        </ButtonGroup>
    </Appearance>
    <Input v-model="name" label="Model name" />
    <Input :form="form" field-name="name" label="Inertia name" />
    <Page mobile-breakpoint="600px" data-testid="fixture-page"><main>Page fixture</main></Page>
    <Icon :src="iconSource" label="Fixture icon" data-testid="fixture-icon" />
    <Tag id="fixture-tag" variant="success" data-testid="fixture-tag">Ready</Tag>
    <Tooltip for="fixture-tag" data-testid="fixture-tooltip">Fixture status</Tooltip>
    <Button id="fixture-popover-trigger" type="button">About status</Button>
    <Popover for="fixture-popover-trigger" data-testid="fixture-popover">
        <a href="#fixture-tag">Review status</a>
    </Popover>
    <p data-testid="appearance-tailwind" class="text-black dark:text-white">Tailwind color mode</p>

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
import { shallowRef } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import { useToast } from '@artisan-toolbox/front-awesome';
import {
    Button,
    ButtonGroup,
    Input,
    Icon,
    Page,
    Tag,
    Tooltip,
    Popover,
    Appearance,
} from '@artisan-toolbox/front-awesome/components';
import type { ButtonGroupProps } from '@artisan-toolbox/front-awesome/components';

const toast = useToast();
const name = shallowRef('Ada');
const iconSource = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>')}`;
const form = useForm({ name: 'Grace' });
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
