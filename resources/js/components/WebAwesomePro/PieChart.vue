<template>
    <wa-pie-chart ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-pie-chart>
</template>

<script setup lang="ts">
import type { PieChartProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { pieChartDefinition } from '../../WebAwesome/proComponentDefinitions';

interface Props extends /* @vue-ignore */ PieChartProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [pieChartDefinition],
    'wa-pie-chart',
    () => import('#front-awesome-webawesome-pro/components/pie-chart/pie-chart.js'),
    { props },
);
</script>
