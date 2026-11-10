<template>
    <wa-animated-image ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-animated-image>
</template>

<script setup lang="ts">
import type { AnimatedImageProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { animatedImageDefinition } from '../../WebAwesome/componentDefinitions';
import type WaAnimatedImage from '@awesome.me/webawesome/dist/components/animated-image/animated-image.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ AnimatedImageProps {
    play?: WaAnimatedImage['play'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:play': [value: WaAnimatedImage['play']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [animatedImageDefinition],
    'wa-animated-image',
    () => import('#front-awesome-webawesome/components/animated-image/animated-image.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaAnimatedImage['play'], WaAnimatedImage['play']>(props, {
                name: 'play',
                property: 'play',
                events: [],
                observeAttribute: 'play',
                form: false,
                componentName: 'AnimatedImage',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:play', value),
            }),
        ],
    },
);
</script>
