<template>
    <wa-radio ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-radio>
</template>

<script setup lang="ts">
import type { RadioProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { radioDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ RadioProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [radioDefinition],
    'wa-radio',
    () => import('#front-awesome-webawesome/components/radio/radio.js'),
    { props },
);
</script>
