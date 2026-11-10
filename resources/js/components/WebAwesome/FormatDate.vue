<template>
    <wa-format-date ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-format-date>
</template>

<script setup lang="ts">
import type { FormatDateProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { formatDateDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ FormatDateProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [formatDateDefinition],
    'wa-format-date',
    () => import('#front-awesome-webawesome/components/format-date/format-date.js'),
    { props },
);
</script>
