<template>
    <wa-mutation-observer ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-mutation-observer>
</template>

<script setup lang="ts">
import type { MutationObserverProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { mutationObserverDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ MutationObserverProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [mutationObserverDefinition],
    'wa-mutation-observer',
    () => import('#front-awesome-webawesome/components/mutation-observer/mutation-observer.js'),
    { props },
);
</script>
