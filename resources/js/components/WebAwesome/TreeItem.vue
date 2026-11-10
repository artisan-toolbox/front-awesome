<template>
    <wa-tree-item ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-tree-item>
</template>

<script setup lang="ts">
import type { TreeItemProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { treeItemDefinition } from '../../WebAwesome/componentDefinitions';
import type WaTreeItem from '@awesome.me/webawesome/dist/components/tree-item/tree-item.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ TreeItemProps {
    expanded?: WaTreeItem['expanded'];
    selected?: WaTreeItem['selected'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:expanded': [value: WaTreeItem['expanded']];
    'update:selected': [value: WaTreeItem['selected']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [treeItemDefinition],
    'wa-tree-item',
    () => import('#front-awesome-webawesome/components/tree-item/tree-item.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaTreeItem['expanded'], WaTreeItem['expanded']>(props, {
                name: 'expanded',
                property: 'expanded',
                events: ['wa-after-expand', 'wa-after-collapse'],
                form: false,
                componentName: 'TreeItem',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:expanded', value),
            }),
            useWebAwesomeModel<WaTreeItem['selected'], WaTreeItem['selected']>(props, {
                name: 'selected',
                property: 'selected',
                events: [],
                observeAttribute: 'selected',
                form: false,
                componentName: 'TreeItem',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:selected', value),
            }),
        ],
    },
);
</script>
