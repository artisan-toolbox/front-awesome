<template>
    <wa-badge ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-badge>
</template>

<script setup lang="ts">
import type { BadgeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { badgeDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ BadgeProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [badgeDefinition],
    'wa-badge',
    () => import('#front-awesome-webawesome/components/badge/badge.js'),
    { props },
);
</script>
