<template>
    <wa-accordion-item ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-accordion-item>
</template>

<script setup lang="ts">
import type { AccordionItemProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { accordionItemDefinition } from '../../WebAwesome/componentDefinitions';
import type WaAccordionItem from '@awesome.me/webawesome/dist/components/accordion-item/accordion-item.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ AccordionItemProps {
    expanded?: WaAccordionItem['expanded'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:expanded': [value: WaAccordionItem['expanded']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [accordionItemDefinition],
    'wa-accordion-item',
    () => import('#front-awesome-webawesome/components/accordion-item/accordion-item.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaAccordionItem['expanded'], WaAccordionItem['expanded']>(props, {
                name: 'expanded',
                property: 'expanded',
                events: [],
                observeAttribute: 'expanded',
                form: false,
                componentName: 'AccordionItem',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:expanded', value),
            }),
        ],
    },
);
</script>
