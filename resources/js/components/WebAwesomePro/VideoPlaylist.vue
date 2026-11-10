<template>
    <wa-video-playlist ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-video-playlist>
</template>

<script setup lang="ts">
import type { VideoPlaylistProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { videoPlaylistDefinition } from '../../WebAwesome/proComponentDefinitions';
import type WaVideoPlaylist from '@web.awesome.me/webawesome-pro/dist/components/video-playlist/video-playlist.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ VideoPlaylistProps {
    activeIndex?: number;
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:activeIndex': [value: number];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [videoPlaylistDefinition],
    'wa-video-playlist',
    () => import('#front-awesome-webawesome-pro/components/video-playlist/video-playlist.js'),
    {
        props,
        models: [
            useWebAwesomeModel<number, number>(props, {
                name: 'activeIndex',
                property: 'activeIndex',
                events: ['wa-video-change'],
                writer: { kind: 'method', method: 'goTo' },
                reader: { kind: 'detail', key: 'currentIndex' },
                form: false,
                componentName: 'VideoPlaylist',
                acceptsWrite: modelDomains.number,
                acceptsRead: modelDomains.number,
                emitValue: (value) => emit('update:activeIndex', value),
            }),
        ],
    },
);
</script>
