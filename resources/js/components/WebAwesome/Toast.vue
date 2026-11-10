<template>
    <wa-toast ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-toast>
</template>

<script setup lang="ts">
import type { ToastProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { toastDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ ToastProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [toastDefinition],
    'wa-toast',
    () => import('#front-awesome-webawesome/components/toast/toast.js'),
    { props },
);
</script>
