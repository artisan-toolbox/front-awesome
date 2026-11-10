<template>
    <wa-zoomable-frame ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-zoomable-frame>
</template>

<script setup lang="ts">
import type { ZoomableFrameProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { zoomableFrameDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ ZoomableFrameProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [zoomableFrameDefinition],
    'wa-zoomable-frame',
    () => import('#front-awesome-webawesome/components/zoomable-frame/zoomable-frame.js'),
    { props },
);
</script>
