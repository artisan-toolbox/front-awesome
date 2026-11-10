<template>
    <wa-callout ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-callout>
</template>

<script setup lang="ts">
import type { CalloutProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { calloutDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ CalloutProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [calloutDefinition],
    'wa-callout',
    () => import('#front-awesome-webawesome/components/callout/callout.js'),
    { props },
);
</script>
