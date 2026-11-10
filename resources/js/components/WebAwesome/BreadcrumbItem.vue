<template>
    <wa-breadcrumb-item ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-breadcrumb-item>
</template>

<script setup lang="ts">
import type { BreadcrumbItemProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { breadcrumbItemDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ BreadcrumbItemProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [breadcrumbItemDefinition],
    'wa-breadcrumb-item',
    () => import('#front-awesome-webawesome/components/breadcrumb-item/breadcrumb-item.js'),
    { props },
);
</script>
