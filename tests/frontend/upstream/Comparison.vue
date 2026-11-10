<template>
    <div>
        <template v-if="scenario === 'comparison-1'">
            <Comparison data-upstream-index="0">
                <img
                    slot="before"
                    src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80&sat=-100&bri=-5"
                    alt="Grayscale version of kittens in a basket looking around."
                />
                <img
                    slot="after"
                    src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80"
                    alt="Color version of kittens in a basket looking around."
                />
            </Comparison>
        </template>
        <template v-if="scenario === 'comparison-2'">
            <Comparison data-upstream-index="0" :position="25">
                <img
                    slot="before"
                    src="https://images.unsplash.com/photo-1520903074185-8eca362b3dce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1200&q=80"
                    alt="A person sitting on bricks wearing untied boots."
                />
                <img
                    slot="after"
                    src="https://images.unsplash.com/photo-1520640023173-50a135e35804?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80"
                    alt="A person sitting on a yellow curb tying shoelaces on a boot."
                />
            </Comparison>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Comparison } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
