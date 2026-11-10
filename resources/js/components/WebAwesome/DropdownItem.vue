<template>
    <wa-dropdown-item ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-dropdown-item>
</template>

<script setup lang="ts">
import type { DropdownItemProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { dropdownItemDefinition } from '../../WebAwesome/componentDefinitions';
import type WaDropdownItem from '@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ DropdownItemProps {
    checked?: WaDropdownItem['checked'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:checked': [value: WaDropdownItem['checked']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [dropdownItemDefinition],
    'wa-dropdown-item',
    () => import('#front-awesome-webawesome/components/dropdown-item/dropdown-item.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaDropdownItem['checked'], WaDropdownItem['checked']>(props, {
                name: 'checked',
                property: 'checked',
                events: [],
                ownerEvent: { tag: 'wa-dropdown', name: 'wa-select', itemKey: 'item' },
                form: false,
                componentName: 'DropdownItem',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:checked', value),
            }),
        ],
    },
);
</script>
