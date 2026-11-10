<template>
    <wa-include ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-include>
</template>

<script setup lang="ts">
import type { IncludeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { includeDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ IncludeProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [includeDefinition],
    'wa-include',
    () => import('#front-awesome-webawesome/components/include/include.js'),
    { props },
);
</script>
