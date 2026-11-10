<template>
    <wa-popup ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-popup>
</template>

<script setup lang="ts">
import type { PopupProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { popupDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ PopupProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [popupDefinition],
    'wa-popup',
    () => import('#front-awesome-webawesome/components/popup/popup.js'),
    { props },
);
</script>
