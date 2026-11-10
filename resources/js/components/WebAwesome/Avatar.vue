<template>
    <wa-avatar ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-avatar>
</template>

<script setup lang="ts">
import type { AvatarProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { avatarDefinition } from '../../WebAwesome/componentDefinitions';

interface Props extends /* @vue-ignore */ AvatarProps {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [avatarDefinition],
    'wa-avatar',
    () => import('#front-awesome-webawesome/components/avatar/avatar.js'),
    { props },
);
</script>
