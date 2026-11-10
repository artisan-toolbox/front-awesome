<template>
    <wa-dropdown ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-dropdown>
</template>

<script setup lang="ts">
import type { DropdownProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { dropdownDefinition } from '../../WebAwesome/componentDefinitions';
import type WaDropdown from '@awesome.me/webawesome/dist/components/dropdown/dropdown.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ DropdownProps {
    open?: WaDropdown['open'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:open': [value: WaDropdown['open']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [dropdownDefinition],
    'wa-dropdown',
    () => import('#front-awesome-webawesome/components/dropdown/dropdown.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaDropdown['open'], WaDropdown['open']>(props, {
                name: 'open',
                property: 'open',
                events: ['wa-after-show', 'wa-after-hide'],
                form: false,
                componentName: 'Dropdown',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:open', value),
            }),
        ],
    },
);
</script>
