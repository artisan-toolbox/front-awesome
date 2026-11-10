<template>
    <wa-spinner ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-spinner>
</template>

<script setup lang="ts">
import type { SpinnerProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { spinnerDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ SpinnerProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [spinnerDefinition],
    'wa-spinner',
    () => import('#front-awesome-webawesome/components/spinner/spinner.js'),
    { props },
);
</script>
