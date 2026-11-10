<template>
    <wa-skeleton ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-skeleton>
</template>

<script setup lang="ts">
import type { SkeletonProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { skeletonDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ SkeletonProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [skeletonDefinition],
    'wa-skeleton',
    () => import('#front-awesome-webawesome/components/skeleton/skeleton.js'),
    { props },
);
</script>
