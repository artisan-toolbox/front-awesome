<template>
    <div>
        <template v-if="scenario === 'switch-1'">
            <Switch data-upstream-index="0">Enable notifications</Switch>
        </template>
        <template v-if="scenario === 'switch-2'">
            <Switch data-upstream-index="0">Subscribe to the newsletter</Switch>
        </template>
        <template v-if="scenario === 'switch-3'">
            <Switch data-upstream-index="0" hint="You can change this at any time in settings."
                >Email me about new releases</Switch
            >
        </template>
        <template v-if="scenario === 'switch-4'">
            <Switch data-upstream-index="0" checked>Remember this device</Switch>
        </template>
        <template v-if="scenario === 'switch-5'">
            <Switch data-upstream-index="0" disabled>Sync over cellular</Switch>
        </template>
        <template v-if="scenario === 'switch-6'">
            <div class="wa-stack">
                <Switch data-upstream-index="0" size="xs">Extra Small</Switch>
                <Switch data-upstream-index="1" size="s">Small</Switch>
                <Switch data-upstream-index="2" size="m">Medium</Switch>
                <Switch data-upstream-index="3" size="l">Large</Switch>
                <Switch data-upstream-index="4" size="xl">Extra Large</Switch>
            </div>
        </template>
        <template v-if="scenario === 'switch-7'">
            <Switch
                data-upstream-index="0"
                style="--width: 80px; --height: 40px; --thumb-size: 36px"
                >Really big</Switch
            >
        </template>
    </div>
</template>

<script setup lang="ts">
import { Switch } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
