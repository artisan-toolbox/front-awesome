<template>
    <wa-bar-chart ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-bar-chart>
</template>

<script setup lang="ts">
import type { BarChartProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { barChartDefinition } from '../../WebAwesome/proComponentDefinitions';

interface Props extends /* @vue-ignore */ BarChartProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [barChartDefinition],
    'wa-bar-chart',
    () => import('#front-awesome-webawesome-pro/components/bar-chart/bar-chart.js'),
    { props },
);
</script>
