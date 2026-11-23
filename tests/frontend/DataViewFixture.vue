<template>
    <template v-if="layoutChanges">
        <button @click="layouts = { list: {}, grid: {} }">Remove table layout</button>
        <button @click="view = 'table'">Request unavailable layout</button>
        <output data-testid="external-view">{{ view }}</output>
    </template>
    <DataViewSearch
        v-if="standaloneSearch"
        :adapter="catalog"
        field="title"
        label="Sidebar title"
    />
    <DataView
        :adapter="catalog"
        :views="layouts"
        :key="revision"
        :row-key="identify"
        :selection="selectionMode"
        :selected-keys="model"
        :control-label="(subject) => (subject.kind === 'row' ? subject.row.name : undefined)"
        @update:selected-keys="updateSelection"
        v-model:view="view"
        label="Catalog"
        caption="Products"
        :size="size"
        :hide-header="hideHeader"
        :hide-footer="hideFooter"
        :state-layout="stateLayout"
        :skeleton-rows="skeletonRows"
        :preserve-skeleton-rows="preserveSkeletonRows"
        data-testid="catalog"
    >
        <template v-if="customStates" #loading="{ view }"><span>Reading {{ view }}</span></template>
        <template v-if="customStates" #empty="{ view }"><span>Empty {{ view }}</span></template>
        <template v-if="skeleton" #skeleton="{ index, columns, adapter, view, selection }">
            <td v-for="column in columns" :key="column.label" data-placeholder>
                {{ index }} {{ column.label }} {{ adapter === catalog && view === 'table' }}
                {{ selection?.mode }}
            </td>
        </template>
        <template v-if="customToolbar" #toolbar><span>Custom toolbar</span></template>
        <template v-if="customFilters" #filters><span>Custom filters</span></template>
        <template v-if="customPagination" #pagination><span>Host pagination</span></template>
        <template #cell-name="{ row, adapter, value }"
            ><strong>{{ row.name.toUpperCase() }}</strong
            ><span v-if="adapter !== catalog">Wrong handle</span
            ><span class="cell-value">{{ value }}</span></template
        >
        <template #cell-actions="{ row, adapter }"
            ><button type="button" @click="adapter.paging.reload()">
                Refresh {{ row.id }}
            </button></template
        >
        <template #grid-item="{ row, adapter }"
            ><article>
                {{ row.name }} card <span v-if="adapter !== catalog">Wrong handle</span>
            </article></template
        >
        <template #list-item="{ row }">{{ row.name }} list</template>
        <template #footer="{ adapter, view: active, selection: chosen }"
            ><output data-testid="view-state"
                >{{ active }} {{ adapter.status }}
                {{ adapter === catalog ? 'same handle' : 'wrong handle' }}</output
            ><output v-if="selection" data-testid="selection-state"
                >{{ JSON.stringify(chosen?.keys) }}
                {{ chosen?.rows.map((row) => row.name).join(',') }}</output
            ><button v-if="captureScope" type="button" @click="saved = chosen">
                Capture selection
            </button></template
        >
    </DataView>
    <DataView
        v-if="shared"
        :adapter="catalog"
        :views="{ list: {} }"
        row-key="id"
        :selection="selectionMode"
        label="Shared catalog"
    >
        <template #list-item="{ row }">Shared {{ row.name }}</template>
    </DataView>
</template>
<script setup lang="ts">
import { shallowRef } from 'vue';
import { useDataAdapter } from '@artisan-toolbox/dapter';
import {
    DataView,
    DataViewSearch,
    type DataViewViews,
    type DataViewLayout,
    type DataViewSize,
    type DataViewSelection,
} from '@artisan-toolbox/front-awesome/data-view';
import { decodeRow } from './data-view-fixtures';
const props = defineProps<{
    infinite?: boolean;
    standaloneSearch?: boolean;
    historyId?: string;
    shared?: boolean;
    size?: DataViewSize;
    gridOnly?: boolean;
    layoutChanges?: boolean;
    selection?: 'single' | 'multiple';
    prefill?: readonly (string | number)[];
    ignoreSelection?: boolean;
    grouped?: boolean;
    joined?: boolean;
    customToolbar?: boolean;
    customPagination?: boolean;
    customFilters?: boolean;
    hideHeader?: boolean;
    hideFooter?: boolean;
    stateLayout?: 'row' | 'replace';
    skeletonRows?: number;
    preserveSkeletonRows?: boolean;
    skeleton?: boolean;
    customStates?: boolean;
    captureScope?: boolean;
}>();
const catalog = useDataAdapter('Catalog', {
    decodeRow,
    protocol: 2,
    paging: 'source',
    infinite: props.infinite ?? false,
    url: props.historyId !== undefined,
    id: props.historyId,
    searchDebounce: 0,
});
const saved = shallowRef<DataViewSelection<ReturnType<typeof decodeRow>, string | number> | null>(
    null,
);
const revision = shallowRef(0);
const selectionMode = shallowRef(props.selection);
const model = shallowRef(props.prefill);
const emissions: (string | number)[][] = [];
let keyCalls = 0;
function identify(row: ReturnType<typeof decodeRow>, index: number) {
    keyCalls++;
    return props.joined ? (index === 0 ? row.id : String(index)) : row.id;
}
function updateSelection(keys: (string | number)[]) {
    emissions.push(keys);
    if (props.prefill !== undefined && !props.ignoreSelection) model.value = keys;
}
const view = shallowRef<DataViewLayout>('table');
const layouts = shallowRef<DataViewViews<(typeof catalog.data)[number]>>(
    props.gridOnly
        ? { grid: {} }
        : {
              table: {
                  columns: [
                      { field: 'id', label: 'ID', align: 'end' },
                      {
                          field: 'name',
                          label: 'Name',
                          orderBy: 'title',
                          groupBy: props.grouped ? (row) => row.name[0] : undefined,
                      },
                      { id: 'computed', label: 'Computed', accessor: (row) => `Product ${row.id}` },
                      { kind: 'display', id: 'actions', label: 'Actions' },
                  ],
                  striped: true,
                  hover: true,
              },
              grid: {},
              list: {},
          },
);
defineExpose({
    catalog,
    layouts,
    view,
    model,
    emissions,
    revision,
    selectionMode,
    saved,
    keyCalls: () => keyCalls,
});
</script>
