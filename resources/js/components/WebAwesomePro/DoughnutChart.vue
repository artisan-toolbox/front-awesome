<template>
    <wa-doughnut-chart ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-doughnut-chart>
</template>

<script setup lang="ts">
import type { DoughnutChartProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { doughnutChartDefinition } from '../../WebAwesome/proComponentDefinitions';

interface Props extends /* @vue-ignore */ DoughnutChartProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [doughnutChartDefinition],
    'wa-doughnut-chart',
    () => import('#front-awesome-webawesome-pro/components/doughnut-chart/doughnut-chart.js'),
    { props },
);
</script>
