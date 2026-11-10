<template>
    <wa-carousel ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-carousel>
</template>

<script setup lang="ts">
import type { CarouselProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { carouselDefinition } from '../../WebAwesome/componentDefinitions';
import type WaCarousel from '@awesome.me/webawesome/dist/components/carousel/carousel.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ CarouselProps {
    currentSlide?: WaCarousel['currentSlide'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:currentSlide': [value: WaCarousel['currentSlide']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [carouselDefinition],
    'wa-carousel',
    () => import('#front-awesome-webawesome/components/carousel/carousel.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaCarousel['currentSlide'], WaCarousel['currentSlide']>(props, {
                name: 'currentSlide',
                property: 'currentSlide',
                events: ['wa-slide-change'],
                writer: { kind: 'method', method: 'goToSlide' },
                reader: { kind: 'detail', key: 'index' },
                form: false,
                componentName: 'Carousel',
                acceptsWrite: modelDomains.number,
                acceptsRead: modelDomains.number,
                emitValue: (value) => emit('update:currentSlide', value),
            }),
        ],
    },
);
</script>
