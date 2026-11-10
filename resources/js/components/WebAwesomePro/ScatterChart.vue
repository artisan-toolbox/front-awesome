<template>
    <wa-scatter-chart ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-scatter-chart>
</template>

<script setup lang="ts">
import type { ScatterChartProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { scatterChartDefinition } from '../../WebAwesome/proComponentDefinitions';

interface Props extends /* @vue-ignore */ ScatterChartProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [scatterChartDefinition],
    'wa-scatter-chart',
    () => import('#front-awesome-webawesome-pro/components/scatter-chart/scatter-chart.js'),
    { props },
);
</script>
