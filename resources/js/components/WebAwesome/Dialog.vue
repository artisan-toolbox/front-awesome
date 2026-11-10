<template>
    <wa-dialog ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-dialog>
</template>

<script setup lang="ts">
import type { DialogProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { dialogDefinition } from '../../WebAwesome/componentDefinitions';
import type WaDialog from '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ DialogProps {
    open?: WaDialog['open'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:open': [value: WaDialog['open']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [dialogDefinition],
    'wa-dialog',
    () => import('#front-awesome-webawesome/components/dialog/dialog.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaDialog['open'], WaDialog['open']>(props, {
                name: 'open',
                property: 'open',
                events: ['wa-after-show', 'wa-after-hide'],
                form: false,
                componentName: 'Dialog',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:open', value),
            }),
        ],
    },
);
</script>
