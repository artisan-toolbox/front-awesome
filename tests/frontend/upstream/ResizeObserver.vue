<template>
    <div>
        <template v-if="scenario === 'resize-observer-1'">
            <div class="resize-observer-overview">
                <ResizeObserver data-upstream-index="0">
                    <div class="box"><span class="dimensions">0 × 0</span></div>
                </ResizeObserver>
                <small>Drag the box's bottom-right corner to resize it.</small>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ResizeObserver } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
