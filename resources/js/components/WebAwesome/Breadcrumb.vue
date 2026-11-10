<template>
    <wa-breadcrumb ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-breadcrumb>
</template>

<script setup lang="ts">
import type { BreadcrumbProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { breadcrumbDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ BreadcrumbProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [breadcrumbDefinition],
    'wa-breadcrumb',
    () => import('#front-awesome-webawesome/components/breadcrumb/breadcrumb.js'),
    { props },
);
</script>
