<template>
    <div>
        <template v-if="scenario === 'mutation-observer-1'">
            <div class="mutation-overview">
                <MutationObserver data-upstream-index="0" attr="variant">
                    <Button data-upstream-index="1" appearance="filled" variant="brand"
                        >Click to mutate</Button
                    >
                </MutationObserver>

                <p>The observer saw the variant change to <span class="current">brand</span>.</p>
            </div>
        </template>
        <template v-if="scenario === 'mutation-observer-2'">
            <div class="mutation-child-list">
                <MutationObserver data-upstream-index="0" child-list>
                    <div class="buttons">
                        <Button data-upstream-index="1" appearance="filled" variant="brand"
                            >Add button</Button
                        >
                    </div>
                </MutationObserver>

                <p>
                    Add buttons, then click a numbered one to remove it. The observer saw
                    <span class="log">no changes yet</span>.
                </p>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, MutationObserver } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
