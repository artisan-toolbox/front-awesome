<template>
    <wa-comparison ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-comparison>
</template>

<script setup lang="ts">
import type { ComparisonProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { comparisonDefinition } from '../../WebAwesome/componentDefinitions';
import type WaComparison from '@awesome.me/webawesome/dist/components/comparison/comparison.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ ComparisonProps {
    position?: WaComparison['position'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:position': [value: WaComparison['position']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [comparisonDefinition],
    'wa-comparison',
    () => import('#front-awesome-webawesome/components/comparison/comparison.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaComparison['position'], WaComparison['position']>(props, {
                name: 'position',
                property: 'position',
                events: ['change'],
                form: false,
                componentName: 'Comparison',
                acceptsWrite: modelDomains.number,
                acceptsRead: modelDomains.number,
                emitValue: (value) => emit('update:position', value),
            }),
        ],
    },
);
</script>
