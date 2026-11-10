<template>
    <wa-card ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-card>
</template>

<script setup lang="ts">
import type { CardProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { cardDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ CardProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [cardDefinition],
    'wa-card',
    () => import('#front-awesome-webawesome/components/card/card.js'),
    { props },
);
</script>
