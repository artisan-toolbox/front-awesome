<template>
    <wa-popover ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-popover>
</template>

<script setup lang="ts">
import type { PopoverProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { popoverDefinition } from '../../WebAwesome/componentDefinitions';
import type WaPopover from '@awesome.me/webawesome/dist/components/popover/popover.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ PopoverProps {
    open?: WaPopover['open'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:open': [value: WaPopover['open']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [popoverDefinition],
    'wa-popover',
    () => import('#front-awesome-webawesome/components/popover/popover.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaPopover['open'], WaPopover['open']>(props, {
                name: 'open',
                property: 'open',
                events: ['wa-after-show', 'wa-after-hide'],
                form: false,
                componentName: 'Popover',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:open', value),
            }),
        ],
    },
);
</script>
