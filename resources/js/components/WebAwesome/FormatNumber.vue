<template>
    <wa-format-number ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-format-number>
</template>

<script setup lang="ts">
import type { FormatNumberProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { formatNumberDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ FormatNumberProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [formatNumberDefinition],
    'wa-format-number',
    () => import('#front-awesome-webawesome/components/format-number/format-number.js'),
    { props },
);
</script>
