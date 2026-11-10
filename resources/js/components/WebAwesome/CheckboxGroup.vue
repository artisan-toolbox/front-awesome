<template>
    <wa-checkbox-group ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-checkbox-group>
</template>

<script setup lang="ts">
import type { CheckboxGroupProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { checkboxGroupDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ CheckboxGroupProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [checkboxGroupDefinition],
    'wa-checkbox-group',
    () => import('#front-awesome-webawesome/components/checkbox-group/checkbox-group.js'),
    { props },
);
</script>
