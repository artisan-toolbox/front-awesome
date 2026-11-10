<template>
    <wa-scroller ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-scroller>
</template>

<script setup lang="ts">
import type { ScrollerProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { scrollerDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ ScrollerProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [scrollerDefinition],
    'wa-scroller',
    () => import('#front-awesome-webawesome/components/scroller/scroller.js'),
    { props },
);
</script>
