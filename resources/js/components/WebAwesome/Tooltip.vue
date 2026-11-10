<template>
    <wa-tooltip ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-tooltip>
</template>

<script setup lang="ts">
import type { TooltipProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { tooltipDefinition } from '../../WebAwesome/componentDefinitions';
import type WaTooltip from '@awesome.me/webawesome/dist/components/tooltip/tooltip.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ TooltipProps {
    open?: WaTooltip['open'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:open': [value: WaTooltip['open']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [tooltipDefinition],
    'wa-tooltip',
    () => import('#front-awesome-webawesome/components/tooltip/tooltip.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaTooltip['open'], WaTooltip['open']>(props, {
                name: 'open',
                property: 'open',
                events: ['wa-after-show', 'wa-after-hide'],
                form: false,
                componentName: 'Tooltip',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:open', value),
            }),
        ],
    },
);
</script>
