<template>
    <wa-page ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-page>
</template>

<script setup lang="ts">
import type { PageProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { pageDefinition } from '../../WebAwesome/componentDefinitions';
import type WaPage from '@awesome.me/webawesome/dist/components/page/page.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ PageProps {
    navOpen?: WaPage['navOpen'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:navOpen': [value: WaPage['navOpen']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [pageDefinition],
    'wa-page',
    () => import('#front-awesome-webawesome/components/page/page.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaPage['navOpen'], WaPage['navOpen']>(props, {
                name: 'navOpen',
                property: 'navOpen',
                events: [],
                observeAttribute: 'nav-open',
                form: false,
                componentName: 'Page',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:navOpen', value),
            }),
        ],
    },
);
</script>
