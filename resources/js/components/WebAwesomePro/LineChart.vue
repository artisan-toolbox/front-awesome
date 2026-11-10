<template>
    <wa-line-chart ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-line-chart>
</template>

<script setup lang="ts">
import type { LineChartProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { lineChartDefinition } from '../../WebAwesome/proComponentDefinitions';

interface Props extends /* @vue-ignore */ LineChartProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [lineChartDefinition],
    'wa-line-chart',
    () => import('#front-awesome-webawesome-pro/components/line-chart/line-chart.js'),
    { props },
);
</script>
