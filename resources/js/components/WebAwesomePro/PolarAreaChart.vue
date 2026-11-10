<template>
    <wa-polar-area-chart ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-polar-area-chart>
</template>

<script setup lang="ts">
import type { PolarAreaChartProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { polarAreaChartDefinition } from '../../WebAwesome/proComponentDefinitions';

interface Props extends /* @vue-ignore */ PolarAreaChartProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [polarAreaChartDefinition],
    'wa-polar-area-chart',
    () => import('#front-awesome-webawesome-pro/components/polar-area-chart/polar-area-chart.js'),
    { props },
);
</script>
