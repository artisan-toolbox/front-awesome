<template>
    <wa-resize-observer ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-resize-observer>
</template>

<script setup lang="ts">
import type { ResizeObserverProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { resizeObserverDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ ResizeObserverProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [resizeObserverDefinition],
    'wa-resize-observer',
    () => import('#front-awesome-webawesome/components/resize-observer/resize-observer.js'),
    { props },
);
</script>
