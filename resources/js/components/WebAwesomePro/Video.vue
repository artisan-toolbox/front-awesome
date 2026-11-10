<template>
    <wa-video ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-video>
</template>

<script setup lang="ts">
import type { VideoProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { videoDefinition } from '../../WebAwesome/proComponentDefinitions';
import type WaVideo from '@web.awesome.me/webawesome-pro/dist/components/video/video.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ VideoProps {
    playing?: WaVideo['playing'];
    currentTime?: WaVideo['currentTime'];
    volume?: WaVideo['volume'];
    muted?: WaVideo['muted'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:playing': [value: WaVideo['playing']];
    'update:currentTime': [value: WaVideo['currentTime']];
    'update:volume': [value: WaVideo['volume']];
    'update:muted': [value: WaVideo['muted']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [videoDefinition],
    'wa-video',
    () => import('#front-awesome-webawesome-pro/components/video/video.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaVideo['playing'], WaVideo['playing']>(props, {
                name: 'playing',
                property: 'playing',
                events: ['play', 'pause', 'ended', 'error'],
                writer: { kind: 'boolean-method', on: 'play', off: 'pause' },
                form: false,
                componentName: 'Video',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:playing', value),
            }),
            useWebAwesomeModel<WaVideo['currentTime'], WaVideo['currentTime']>(props, {
                name: 'currentTime',
                property: 'currentTime',
                events: ['timeupdate'],
                form: false,
                componentName: 'Video',
                acceptsWrite: modelDomains.number,
                acceptsRead: modelDomains.number,
                emitValue: (value) => emit('update:currentTime', value),
            }),
            useWebAwesomeModel<WaVideo['volume'], WaVideo['volume']>(props, {
                name: 'volume',
                property: 'volume',
                events: ['volumechange'],
                form: false,
                componentName: 'Video',
                acceptsWrite: modelDomains.number,
                acceptsRead: modelDomains.number,
                emitValue: (value) => emit('update:volume', value),
            }),
            useWebAwesomeModel<WaVideo['muted'], WaVideo['muted']>(props, {
                name: 'muted',
                property: 'muted',
                events: ['volumechange'],
                form: false,
                componentName: 'Video',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:muted', value),
            }),
        ],
    },
);
</script>
