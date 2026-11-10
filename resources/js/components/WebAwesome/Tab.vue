<template>
    <wa-tab ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-tab>
</template>

<script setup lang="ts">
import type { TabProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { tabDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ TabProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [tabDefinition],
    'wa-tab',
    () => import('#front-awesome-webawesome/components/tab/tab.js'),
    { props },
);
</script>
