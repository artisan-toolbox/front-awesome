<template>
    <wa-progress-bar ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-progress-bar>
</template>

<script setup lang="ts">
import type { ProgressBarProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { progressBarDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ ProgressBarProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [progressBarDefinition],
    'wa-progress-bar',
    () => import('#front-awesome-webawesome/components/progress-bar/progress-bar.js'),
    { props },
);
</script>
