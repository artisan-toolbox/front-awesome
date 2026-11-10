<template>
    <wa-intersection-observer ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-intersection-observer>
</template>

<script setup lang="ts">
import type { IntersectionObserverProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { intersectionObserverDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ IntersectionObserverProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [intersectionObserverDefinition],
    'wa-intersection-observer',
    () =>
        import('#front-awesome-webawesome/components/intersection-observer/intersection-observer.js'),
    { props },
);
</script>
