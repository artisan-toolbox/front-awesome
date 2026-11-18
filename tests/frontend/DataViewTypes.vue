<template>
    <DataView
        :adapter="catalog"
        :views="views"
        row-key="id"
        selection="multiple"
        v-model:selected-keys="keys"
        :control-label="
            (subject) =>
                subject.kind === 'row' ? subject.row.name + subject.key.toFixed() : undefined
        "
    >
        <template #cell-name="{ row, adapter, value, rowKey, selected, selection }">
            {{ rowKey.toFixed() }} {{ selected }}
            <button @click="selection?.set(rowKey, true)">Select</button>
            <button v-if="selection?.mode === 'multiple'" @click="selection.setAllLoaded(true)">
                Select loaded
            </button>
            {{ row.name.toUpperCase() }} {{ row.id.toFixed() }} {{ value }}
            <button @click="adapter.fields?.status?.filters?.selected?.call({ value: 'active' })">
                Filter
            </button>
            <button @click="adapter.actions?.http('rename', { id: row.id, name: row.name })">
                Rename
            </button>
            <button
                @click="
                    adapter.actions?.visit(
                        'rename',
                        { id: row.id, name: row.name },
                        { preserveScroll: true },
                    )
                "
            >
                Visit
            </button>
            <button
                @click="
                    adapter.actions
                        ?.http('rename', row)
                        .then(
                            (outcome) =>
                                outcome.status === 'completed' && outcome.data.name.toUpperCase(),
                        )
                "
            >
                Check result
            </button>
        </template>
        <template #grid-item="{ row, adapter }">{{ row.name }} {{ adapter.paging.mode }}</template>
        <template #toolbar="{ adapter }"
            ><button @click="adapter.paging.goToPage(2)">Page two</button></template
        >
    </DataView>
    <DataView :adapter="catalog" :views="{ grid: {} }" :row-key="(row, index) => row.name + index"
        ><template #grid-item="{ row, rowKey }"
            >{{ row.name.toUpperCase() }} {{ rowKey.toUpperCase() }}</template
        ></DataView
    >
</template>
<script setup lang="ts">
import {
    defineActions,
    useDataAdapter,
    type AdapterDefinition,
    type ReadonlyDeep,
} from '@artisan-toolbox/dapter';
import { shallowRef } from 'vue';
import {
    DataView,
    type DataViewViews,
    type DataViewRowKey,
    type DataViewScope,
    type DataViewItemScope,
    type DataViewCellScope,
    type DataViewSlots,
} from '@artisan-toolbox/front-awesome/data-view';
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
    rename: { transports: ['http', 'visit'], decodeInput: decodeRow, decodeResult: decodeRow },
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
            { field: 'name', label: 'Name', groupBy: (row) => row.name },
            { kind: 'display', id: 'actions', label: 'Actions' },
        ],
    },
    grid: {},
} satisfies DataViewViews<(typeof catalog.data)[number]>;
const keys = shallowRef<number[]>([]);
type H = typeof catalog;
type Row = H['data'][number];
const scope: DataViewScope<H> = { adapter: catalog, view: 'table' };
const item: DataViewItemScope<H> = { ...scope, row: { id: 1, name: 'Notebook' }, index: 0 };
const cell: DataViewCellScope<H> = { ...item, column: views.table.columns[0], value: 'Notebook' };
const slots: DataViewSlots<H> = { 'cell-name': ({ row }) => row.name };
slots['cell-name']?.(cell);
const oldKey: DataViewRowKey<Row> = (row) => row.id;
oldKey(item.row);
</script>
