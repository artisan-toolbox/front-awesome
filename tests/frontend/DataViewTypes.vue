<template>
    <DataViewSearch :adapter="catalog" field="name" />
    <DataViewFilter :adapter="catalog" field="status" filter="selected" label="Status" />
    <DataViewStatus :adapter="catalog" />
    <DataViewPagination :adapter="catalog" size="s" />
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
        <template #skeleton="{ index, columns, adapter, view, selection }">
            <td v-for="column in columns" :key="column.label">
                {{ index.toFixed() }} {{ column.label.toUpperCase() }} {{ view }}
                {{ adapter.data[0]?.name.toUpperCase() }} {{ selection?.keys[0]?.toFixed() }}
            </td>
        </template>
        <template #head-name="{ name, sortDirection, adapter, column, selection }">
            {{ name.toUpperCase() }} {{ column.label }}
            {{ sortDirection === null ? 'Unavailable' : sortDirection.toFixed() }}
            {{ adapter.data[0]?.name.toUpperCase() }}
            <span>{{ selection?.keys[0]?.toFixed() }}</span>
        </template>
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
    DataViewSearch,
    DataViewFilter,
    DataViewStatus,
    DataViewPagination,
    type DataViewViews,
    type DataViewRowKey,
    type DataViewScope,
    type DataViewItemScope,
    type DataViewCellScope,
    type DataViewSlots,
    type DataViewHeadScope,
    type DataViewSortDirection,
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
const head: DataViewHeadScope<H> = {
    ...scope,
    column: views.table.columns[0],
    name: 'Name',
    sortDirection: 0,
};
const direction: DataViewSortDirection = head.sortDirection;
void direction;
const slots: DataViewSlots<H> = {
    skeleton: ({ columns, index, adapter }) => columns[index]?.label ?? adapter.data[0]?.name,
    'cell-name': ({ row }) => row.name,
    'head-name': ({ name, sortDirection }) => name + sortDirection,
};
slots['head-name']?.(head);
slots['cell-name']?.(cell);
const oldKey: DataViewRowKey<Row> = (row) => row.id;
oldKey(item.row);
</script>
