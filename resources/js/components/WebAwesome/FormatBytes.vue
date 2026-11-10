<template>
    <wa-format-bytes ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-format-bytes>
</template>

<script setup lang="ts">
import type { FormatBytesProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { formatBytesDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ FormatBytesProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [formatBytesDefinition],
    'wa-format-bytes',
    () => import('#front-awesome-webawesome/components/format-bytes/format-bytes.js'),
    { props },
);
</script>
