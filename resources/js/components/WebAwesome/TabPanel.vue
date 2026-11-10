<template>
    <wa-tab-panel ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-tab-panel>
</template>

<script setup lang="ts">
import type { TabPanelProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { tabPanelDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ TabPanelProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [tabPanelDefinition],
    'wa-tab-panel',
    () => import('#front-awesome-webawesome/components/tab-panel/tab-panel.js'),
    { props },
);
</script>
