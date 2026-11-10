<template>
    <wa-markdown ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-markdown>
</template>

<script setup lang="ts">
import type { MarkdownProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { markdownDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ MarkdownProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [markdownDefinition],
    'wa-markdown',
    () => import('#front-awesome-webawesome/components/markdown/markdown.js'),
    { props },
);
</script>
