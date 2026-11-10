<template>
    <wa-divider ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-divider>
</template>

<script setup lang="ts">
import type { DividerProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { dividerDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ DividerProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [dividerDefinition],
    'wa-divider',
    () => import('#front-awesome-webawesome/components/divider/divider.js'),
    { props },
);
</script>
