<template>
    <wa-qr-code ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-qr-code>
</template>

<script setup lang="ts">
import type { QrCodeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { qrCodeDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ QrCodeProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [qrCodeDefinition],
    'wa-qr-code',
    () => import('#front-awesome-webawesome/components/qr-code/qr-code.js'),
    { props },
);
</script>
