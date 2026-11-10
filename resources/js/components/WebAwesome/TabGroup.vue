<template>
    <wa-tab-group ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-tab-group>
</template>

<script setup lang="ts">
import type { TabGroupProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { tabGroupDefinition } from '../../WebAwesome/componentDefinitions';
import type WaTabGroup from '@awesome.me/webawesome/dist/components/tab-group/tab-group.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ TabGroupProps {
    active?: WaTabGroup['active'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:active': [value: WaTabGroup['active']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [tabGroupDefinition],
    'wa-tab-group',
    () => import('#front-awesome-webawesome/components/tab-group/tab-group.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaTabGroup['active'], WaTabGroup['active']>(props, {
                name: 'active',
                property: 'active',
                events: ['wa-tab-show'],
                form: false,
                componentName: 'TabGroup',
                acceptsWrite: modelDomains.string,
                acceptsRead: modelDomains.string,
                emitValue: (value) => emit('update:active', value),
            }),
        ],
    },
);
</script>
