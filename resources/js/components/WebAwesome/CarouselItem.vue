<template>
    <wa-carousel-item ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-carousel-item>
</template>

<script setup lang="ts">
import type { CarouselItemProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { carouselItemDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ CarouselItemProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [carouselItemDefinition],
    'wa-carousel-item',
    () => import('#front-awesome-webawesome/components/carousel-item/carousel-item.js'),
    { props },
);
</script>
