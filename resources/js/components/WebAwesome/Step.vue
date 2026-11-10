<template>
    <wa-step ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-step>
</template>

<script setup lang="ts">
import type { StepProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { stepDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ StepProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [stepDefinition],
    'wa-step',
    () => import('#front-awesome-webawesome/components/step/step.js'),
    { props },
);
</script>
