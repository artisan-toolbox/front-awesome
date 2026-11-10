<template>
    <div>
        <template v-if="scenario === 'progress-bar-1'">
            <ProgressBar data-upstream-index="0" :value="40"></ProgressBar>
        </template>
        <template v-if="scenario === 'progress-bar-2'">
            <ProgressBar data-upstream-index="0" :value="50" label="Upload progress"></ProgressBar>
        </template>
        <template v-if="scenario === 'progress-bar-3'">
            <ProgressBar data-upstream-index="0" indeterminate></ProgressBar>
        </template>
        <template v-if="scenario === 'progress-bar-4'">
            <ProgressBar
                data-upstream-index="0"
                :value="60"
                style="
                    --track-height: 1.5rem;
                    --track-color: var(--wa-color-neutral-fill-quiet);
                    --indicator-color: var(--wa-color-success-fill-loud);
                "
            ></ProgressBar>
        </template>
        <template v-if="scenario === 'progress-bar-5'">
            <div class="wa-stack">
                <ProgressBar data-upstream-index="0" :value="50" id="progress-bar-demo"
                    >50%</ProgressBar
                >

                <Divider data-upstream-index="1"></Divider>

                <div class="wa-cluster">
                    <Button data-upstream-index="2" pill appearance="filled">
                        <Icon data-upstream-index="3" name="minus" label="Decrease"></Icon>
                    </Button>
                    <Button data-upstream-index="4" pill appearance="filled">
                        <Icon data-upstream-index="5" name="plus" label="Increase"></Icon>
                    </Button>
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
    ProgressBar,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
