<template>
    <wa-pagination ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-pagination>
</template>

<script setup lang="ts">
import type { PaginationProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { paginationDefinition } from '../../WebAwesome/componentDefinitions';
import type WaPagination from '@awesome.me/webawesome/dist/components/pagination/pagination.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ PaginationProps {
    page?: WaPagination['page'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:page': [value: WaPagination['page']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [paginationDefinition],
    'wa-pagination',
    () => import('#front-awesome-webawesome/components/pagination/pagination.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaPagination['page'], WaPagination['page']>(props, {
                name: 'page',
                property: 'page',
                events: ['wa-page-change'],
                form: false,
                componentName: 'Pagination',
                acceptsWrite: modelDomains.number,
                acceptsRead: modelDomains.number,
                emitValue: (value) => emit('update:page', value),
            }),
        ],
    },
);
</script>
