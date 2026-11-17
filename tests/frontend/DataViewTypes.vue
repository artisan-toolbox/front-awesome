<template>
    <DataView :adapter="catalog" :views="views" row-key="id">
        <template #cell-name="{ row, adapter, value }">
            {{ row.name.toUpperCase() }} {{ row.id.toFixed() }} {{ value }}
            <button @click="adapter.fields?.status?.filters?.selected?.call({ value: 'active' })">
                Filter
            </button>
            <button @click="adapter.actions?.http('rename', { id: row.id, name: row.name })">
                Rename
            </button>
        </template>
        <template #grid-item="{ row, adapter }">{{ row.name }} {{ adapter.paging.mode }}</template>
        <template #toolbar="{ adapter }"
            ><button @click="adapter.paging.goToPage(2)">Page two</button></template
        >
    </DataView>
    <DataView :adapter="catalog" :views="{ grid: {} }" :row-key="(row) => row.id"
        ><template #grid-item="{ row }">{{ row.name.toUpperCase() }}</template></DataView
    >
</template>
<script setup lang="ts">
import {
    defineActions,
    useDataAdapter,
    type AdapterDefinition,
    type ReadonlyDeep,
} from '@artisan-toolbox/dapter';
import { DataView, type DataViewViews } from '@artisan-toolbox/front-awesome/data-view';
import { decodeRow, definition } from './data-view-fixtures';
const finiteDefinition = {
    ...definition,
    fields: {
        ...definition.fields,
        status: {
            search: null,
            order: null,
            filters: { selected: { values: ['active', 'archived'], multiple: false } },
        },
    },
} as const satisfies AdapterDefinition;
function decodeDefinition(value: ReadonlyDeep<AdapterDefinition>) {
    if (JSON.stringify(value) !== JSON.stringify(finiteDefinition))
        throw new Error('Unexpected catalog definition');
    return finiteDefinition;
}
const actions = defineActions({
    rename: { transports: ['http'], decodeInput: decodeRow, decodeResult: decodeRow },
});
const catalog = useDataAdapter('Catalog', {
    decodeRow,
    decodeDefinition,
    actionDefinitions: actions,
    protocol: 2,
    url: false,
});
const views = {
    table: {
        columns: [
            { field: 'name', label: 'Name' },
            { kind: 'display', id: 'actions', label: 'Actions' },
        ],
    },
    grid: {},
} satisfies DataViewViews<(typeof catalog.data)[number]>;
</script>
