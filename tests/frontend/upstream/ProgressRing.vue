<template>
    <div>
        <template v-if="scenario === 'progress-ring-1'">
            <ProgressRing data-upstream-index="0" :value="25"></ProgressRing>
        </template>
        <template v-if="scenario === 'progress-ring-2'">
            <ProgressRing data-upstream-index="0" :value="25" label="Sync progress"></ProgressRing>
        </template>
        <template v-if="scenario === 'progress-ring-3'">
            <ProgressRing data-upstream-index="0" :value="50" style="--size: 200px"></ProgressRing>
        </template>
        <template v-if="scenario === 'progress-ring-4'">
            <ProgressRing
                data-upstream-index="0"
                :value="50"
                style="--track-width: 6px; --indicator-width: 12px"
            ></ProgressRing>
        </template>
        <template v-if="scenario === 'progress-ring-5'">
            <ProgressRing
                data-upstream-index="0"
                :value="50"
                style="
                    --track-color: var(--wa-color-success-fill-quiet);
                    --indicator-color: var(--wa-color-success-fill-loud);
                "
            ></ProgressRing>
        </template>
        <template v-if="scenario === 'progress-ring-6'">
            <div class="progress-ring-overview">
                <ProgressRing data-upstream-index="0" :value="50" class="progress-ring-values"
                    >50%</ProgressRing
                >

                <Divider data-upstream-index="1"></Divider>

                <div class="wa-cluster">
                    <Button data-upstream-index="2" appearance="filled" circle
                        ><Icon data-upstream-index="3" name="minus" label="Decrease"></Icon
                    ></Button>
                    <Button data-upstream-index="4" appearance="filled" circle
                        ><Icon data-upstream-index="5" name="plus" label="Increase"></Icon
                    ></Button>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Divider,
    Icon,
    ProgressRing,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
