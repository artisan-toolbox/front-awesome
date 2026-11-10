<template>
    <wa-copy-button ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-copy-button>
</template>

<script setup lang="ts">
import type { CopyButtonProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { copyButtonDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ CopyButtonProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [copyButtonDefinition],
    'wa-copy-button',
    () => import('#front-awesome-webawesome/components/copy-button/copy-button.js'),
    { props },
);
</script>
