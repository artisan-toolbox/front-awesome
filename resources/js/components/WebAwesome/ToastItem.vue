<template>
    <wa-toast-item ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-toast-item>
</template>

<script setup lang="ts">
import type { ToastItemProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { toastItemDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ ToastItemProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [toastItemDefinition],
    'wa-toast-item',
    () => import('#front-awesome-webawesome/components/toast-item/toast-item.js'),
    { props },
);
</script>
