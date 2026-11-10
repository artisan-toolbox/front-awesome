<template>
    <wa-radar-chart ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-radar-chart>
</template>

<script setup lang="ts">
import type { RadarChartProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { radarChartDefinition } from '../../WebAwesome/proComponentDefinitions';

interface Props extends /* @vue-ignore */ RadarChartProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [radarChartDefinition],
    'wa-radar-chart',
    () => import('#front-awesome-webawesome-pro/components/radar-chart/radar-chart.js'),
    { props },
);
</script>
