<template>
    <wa-random-content ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-random-content>
</template>

<script setup lang="ts">
import type { RandomContentProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { randomContentDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ RandomContentProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [randomContentDefinition],
    'wa-random-content',
    () => import('#front-awesome-webawesome/components/random-content/random-content.js'),
    { props },
);
</script>
