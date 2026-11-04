<template>
    <Button @click="showMosaicastToast">Show Mosaicast toast</Button>
    <Button @click="showFlashToasts">Show Inertia flash toasts</Button>
    <Button @click="router.flash('unrelated', true)">Flash unrelated data</Button>
    <Button @click="toast.show('Toast from setup.', { duration: 0 })">Show toast from setup</Button>
    <Button @click="$frontAwesome.toast.show('Toast from template.', { duration: 0 })">
        Show toast from template
    </Button>
</template>

<script setup lang="ts">
import { router } from '@inertiajs/vue3';
import { useToast } from '@artisan-toolbox/front-awesome';
import Button from '@artisan-toolbox/front-awesome/components/Button.vue';

const toast = useToast();

function showMosaicastToast(): void {
    document.dispatchEvent(
        new CustomEvent('inertia:navigate', {
            detail: {
                page: {
                    props: {
                        mosaicast: {
                            sessionIdentifier: null,
                            events: [
                                {
                                    name: 'front-awesome.toast',
                                    payload: {
                                        message: 'Order <123> saved.',
                                        options: {
                                            variant: 'success',
                                            duration: 0,
                                            icon: 'check',
                                            size: 'l',
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        }),
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
