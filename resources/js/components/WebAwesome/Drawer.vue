<template>
    <wa-drawer ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-drawer>
</template>

<script setup lang="ts">
import type { DrawerProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { drawerDefinition } from '../../WebAwesome/componentDefinitions';
import type WaDrawer from '@awesome.me/webawesome/dist/components/drawer/drawer.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ DrawerProps {
    open?: WaDrawer['open'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:open': [value: WaDrawer['open']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [drawerDefinition],
    'wa-drawer',
    () => import('#front-awesome-webawesome/components/drawer/drawer.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaDrawer['open'], WaDrawer['open']>(props, {
                name: 'open',
                property: 'open',
                events: ['wa-after-show', 'wa-after-hide'],
                form: false,
                componentName: 'Drawer',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:open', value),
            }),
        ],
    },
);
</script>
