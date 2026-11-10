<template>
    <wa-progress-ring ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-progress-ring>
</template>

<script setup lang="ts">
import type { ProgressRingProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { progressRingDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ ProgressRingProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [progressRingDefinition],
    'wa-progress-ring',
    () => import('#front-awesome-webawesome/components/progress-ring/progress-ring.js'),
    { props },
);
</script>
