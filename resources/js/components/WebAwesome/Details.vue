<template>
    <wa-details ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-details>
</template>

<script setup lang="ts">
import type { DetailsProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { detailsDefinition } from '../../WebAwesome/componentDefinitions';
import type WaDetails from '@awesome.me/webawesome/dist/components/details/details.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ DetailsProps {
    open?: WaDetails['open'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:open': [value: WaDetails['open']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [detailsDefinition],
    'wa-details',
    () => import('#front-awesome-webawesome/components/details/details.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaDetails['open'], WaDetails['open']>(props, {
                name: 'open',
                property: 'open',
                events: ['wa-after-show', 'wa-after-hide'],
                form: false,
                componentName: 'Details',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:open', value),
            }),
        ],
    },
);
</script>
