<template>
    <wa-split-panel ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-split-panel>
</template>

<script setup lang="ts">
import type { SplitPanelProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { splitPanelDefinition } from '../../WebAwesome/componentDefinitions';
import type WaSplitPanel from '@awesome.me/webawesome/dist/components/split-panel/split-panel.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ SplitPanelProps {
    position?: WaSplitPanel['position'];
    positionInPixels?: WaSplitPanel['positionInPixels'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:position': [value: WaSplitPanel['position']];
    'update:positionInPixels': [value: WaSplitPanel['positionInPixels']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [splitPanelDefinition],
    'wa-split-panel',
    () => import('#front-awesome-webawesome/components/split-panel/split-panel.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaSplitPanel['position'], WaSplitPanel['position']>(props, {
                name: 'position',
                property: 'position',
                events: ['wa-reposition'],
                form: false,
                componentName: 'SplitPanel',
                acceptsWrite: modelDomains.number,
                acceptsRead: modelDomains.number,
                emitValue: (value) => emit('update:position', value),
            }),
            useWebAwesomeModel<WaSplitPanel['positionInPixels'], WaSplitPanel['positionInPixels']>(
                props,
                {
                    name: 'positionInPixels',
                    property: 'positionInPixels',
                    events: ['wa-reposition'],
                    form: false,
                    componentName: 'SplitPanel',
                    acceptsWrite: modelDomains.number,
                    acceptsRead: modelDomains.number,
                    emitValue: (value) => emit('update:positionInPixels', value),
                },
            ),
        ],
    },
);
</script>
