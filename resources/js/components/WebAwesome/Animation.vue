<template>
    <wa-animation ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-animation>
</template>

<script setup lang="ts">
import type { AnimationProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { animationDefinition } from '../../WebAwesome/componentDefinitions';
import type WaAnimation from '@awesome.me/webawesome/dist/components/animation/animation.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ AnimationProps {
    play?: WaAnimation['play'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:play': [value: WaAnimation['play']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [animationDefinition],
    'wa-animation',
    () => import('#front-awesome-webawesome/components/animation/animation.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaAnimation['play'], WaAnimation['play']>(props, {
                name: 'play',
                property: 'play',
                events: ['wa-start', 'wa-finish', 'wa-cancel'],
                form: false,
                componentName: 'Animation',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:play', value),
            }),
        ],
    },
);
</script>
