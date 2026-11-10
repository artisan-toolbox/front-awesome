<template>
    <wa-bubble-chart ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-bubble-chart>
</template>

<script setup lang="ts">
import type { BubbleChartProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { bubbleChartDefinition } from '../../WebAwesome/proComponentDefinitions';

interface Props extends /* @vue-ignore */ BubbleChartProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [bubbleChartDefinition],
    'wa-bubble-chart',
    () => import('#front-awesome-webawesome-pro/components/bubble-chart/bubble-chart.js'),
    { props },
);
</script>
