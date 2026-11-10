<template>
    <wa-tree ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-tree>
</template>

<script setup lang="ts">
import type { TreeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { treeDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ TreeProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [treeDefinition],
    'wa-tree',
    () => import('#front-awesome-webawesome/components/tree/tree.js'),
    { props },
);
</script>
