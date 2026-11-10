<template>
    <wa-chart ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-chart>
</template>

<script setup lang="ts">
import type { ChartProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { chartDefinition } from '../../WebAwesome/proComponentDefinitions';

interface Props extends /* @vue-ignore */ ChartProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [chartDefinition],
    'wa-chart',
    () => import('#front-awesome-webawesome-pro/components/chart/chart.js'),
    { props },
);
</script>
