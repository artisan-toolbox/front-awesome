<template>
    <wa-data-grid ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-data-grid>
</template>

<script setup lang="ts">
import type { DataGridProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { dataGridDefinition } from '../../WebAwesome/proComponentDefinitions';
import type WaDataGrid from '@web.awesome.me/webawesome-pro/dist/components/data-grid/data-grid.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ DataGridProps {
    page?: WaDataGrid['page'];
    pageSize?: WaDataGrid['pageSize'];
    sort?: WaDataGrid['sort'];
    filters?: WaDataGrid['filters'];
    searchTerm?: WaDataGrid['searchTerm'];
    selectedKeys?: WaDataGrid['selectedKeys'];
    selectedRows?: WaDataGrid['selectedRows'];
    expandedKeys?: WaDataGrid['expandedKeys'];
    columnOrder?: WaDataGrid['columnOrder'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:page': [value: WaDataGrid['page']];
    'update:pageSize': [value: WaDataGrid['pageSize']];
    'update:sort': [value: WaDataGrid['sort']];
    'update:filters': [value: WaDataGrid['filters']];
    'update:searchTerm': [value: WaDataGrid['searchTerm']];
    'update:selectedKeys': [value: WaDataGrid['selectedKeys']];
    'update:selectedRows': [value: WaDataGrid['selectedRows']];
    'update:expandedKeys': [value: WaDataGrid['expandedKeys']];
    'update:columnOrder': [value: WaDataGrid['columnOrder']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [dataGridDefinition],
    'wa-data-grid',
    () => import('#front-awesome-webawesome-pro/components/data-grid/data-grid.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaDataGrid['page'], WaDataGrid['page']>(props, {
                name: 'page',
                property: 'page',
                events: ['wa-page-change'],
                form: false,
                componentName: 'DataGrid',
                acceptsWrite: modelDomains.number,
                acceptsRead: modelDomains.number,
                emitValue: (value) => emit('update:page', value),
            }),
            useWebAwesomeModel<WaDataGrid['pageSize'], WaDataGrid['pageSize']>(props, {
                name: 'pageSize',
                property: 'pageSize',
                events: ['wa-page-change'],
                form: false,
                componentName: 'DataGrid',
                acceptsWrite: modelDomains.number,
                acceptsRead: modelDomains.number,
                emitValue: (value) => emit('update:pageSize', value),
            }),
            useWebAwesomeModel<WaDataGrid['sort'], WaDataGrid['sort']>(props, {
                name: 'sort',
                property: 'sort',
                events: ['wa-sort-change'],
                form: false,
                componentName: 'DataGrid',
                acceptsWrite: modelDomains.sort,
                acceptsRead: modelDomains.sort,
                emitValue: (value) => emit('update:sort', value),
            }),
            useWebAwesomeModel<
                {
                    id: string;
                    value: unknown;
                }[],
                WaDataGrid['filters']
            >(props, {
                name: 'filters',
                property: 'filters',
                events: ['wa-filter-change'],
                form: false,
                componentName: 'DataGrid',
                acceptsWrite: modelDomains.filters,
                acceptsRead: modelDomains.filters,
                emitValue: (value) => emit('update:filters', value),
            }),
            useWebAwesomeModel<WaDataGrid['searchTerm'], WaDataGrid['searchTerm']>(props, {
                name: 'searchTerm',
                property: 'searchTerm',
                events: ['wa-filter-change'],
                form: false,
                componentName: 'DataGrid',
                acceptsWrite: modelDomains.string,
                acceptsRead: modelDomains.string,
                emitValue: (value) => emit('update:searchTerm', value),
            }),
            useWebAwesomeModel<(string | number)[], WaDataGrid['selectedKeys']>(props, {
                name: 'selectedKeys',
                property: 'selectedKeys',
                events: ['wa-row-select'],
                form: false,
                componentName: 'DataGrid',
                acceptsWrite: modelDomains.keys,
                acceptsRead: modelDomains.keys,
                emitValue: (value) => emit('update:selectedKeys', value),
            }),
            useWebAwesomeModel<WaDataGrid['selectedRows'], WaDataGrid['selectedRows']>(props, {
                name: 'selectedRows',
                property: 'selectedRows',
                events: ['wa-row-select'],
                form: false,
                componentName: 'DataGrid',
                acceptsWrite: modelDomains.records,
                acceptsRead: modelDomains.records,
                emitValue: (value) => emit('update:selectedRows', value),
            }),
            useWebAwesomeModel<(string | number)[], WaDataGrid['expandedKeys']>(props, {
                name: 'expandedKeys',
                property: 'expandedKeys',
                events: ['wa-row-expand', 'wa-row-collapse'],
                form: false,
                componentName: 'DataGrid',
                acceptsWrite: modelDomains.keys,
                acceptsRead: modelDomains.keys,
                emitValue: (value) => emit('update:expandedKeys', value),
            }),
            useWebAwesomeModel<string[], WaDataGrid['columnOrder']>(props, {
                name: 'columnOrder',
                property: 'columnOrder',
                events: ['wa-column-move'],
                form: false,
                componentName: 'DataGrid',
                acceptsWrite: modelDomains.strings,
                acceptsRead: modelDomains.strings,
                emitValue: (value) => emit('update:columnOrder', value),
            }),
        ],
    },
);
</script>
