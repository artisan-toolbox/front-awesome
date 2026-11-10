<template>
    <wa-option ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-option>
</template>

<script setup lang="ts">
import type { OptionProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { optionDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ OptionProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [optionDefinition],
    'wa-option',
    () => import('#front-awesome-webawesome/components/option/option.js'),
    { props },
);
</script>
