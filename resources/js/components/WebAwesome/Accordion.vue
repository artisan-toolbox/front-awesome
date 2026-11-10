<template>
    <wa-accordion ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-accordion>
</template>

<script setup lang="ts">
import type { AccordionProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { accordionDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ AccordionProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [accordionDefinition],
    'wa-accordion',
    () => import('#front-awesome-webawesome/components/accordion/accordion.js'),
    { props },
);
</script>
