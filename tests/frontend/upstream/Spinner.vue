<template>
    <div>
        <template v-if="scenario === 'spinner-1'">
            <Spinner data-upstream-index="0"></Spinner>
        </template>
        <template v-if="scenario === 'spinner-2'">
            <Spinner data-upstream-index="0"></Spinner>
            <Spinner data-upstream-index="1" style="font-size: 2rem"></Spinner>
            <Spinner data-upstream-index="2" style="font-size: 3rem"></Spinner>
        </template>
        <template v-if="scenario === 'spinner-3'">
            <Spinner data-upstream-index="0" style="font-size: 50px; --track-width: 10px"></Spinner>
        </template>
        <template v-if="scenario === 'spinner-4'">
            <Spinner
                data-upstream-index="0"
                style="
                    font-size: 3rem;
                    --indicator-color: var(--wa-color-success-fill-loud);
                    --track-color: var(--wa-color-success-fill-quiet);
                "
            ></Spinner>
        </template>
        <template v-if="scenario === 'spinner-5'">
            <Spinner data-upstream-index="0" style="font-size: 3rem; --speed: 4s"></Spinner>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Spinner } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
