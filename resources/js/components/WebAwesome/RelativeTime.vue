<template>
    <wa-relative-time ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-relative-time>
</template>

<script setup lang="ts">
import type { RelativeTimeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { relativeTimeDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ RelativeTimeProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [relativeTimeDefinition],
    'wa-relative-time',
    () => import('#front-awesome-webawesome/components/relative-time/relative-time.js'),
    { props },
);
</script>
