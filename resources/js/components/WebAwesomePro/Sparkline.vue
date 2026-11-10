<template>
    <wa-sparkline ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-sparkline>
</template>

<script setup lang="ts">
import type { SparklineProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { sparklineDefinition } from '../../WebAwesome/proComponentDefinitions';

interface Props extends /* @vue-ignore */ SparklineProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [sparklineDefinition],
    'wa-sparkline',
    () => import('#front-awesome-webawesome-pro/components/sparkline/sparkline.js'),
    { props },
);
</script>
