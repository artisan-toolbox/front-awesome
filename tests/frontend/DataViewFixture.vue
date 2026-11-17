<template>
    <template v-if="layoutChanges">
        <button @click="layouts = { list: {}, grid: {} }">Remove table layout</button>
        <button @click="view = 'table'">Request unavailable layout</button>
        <output data-testid="external-view">{{ view }}</output>
    </template>
    <DataView
        :adapter="catalog"
        :views="layouts"
        row-key="id"
        v-model:view="view"
        label="Catalog"
        caption="Products"
        :size="size"
        data-testid="catalog"
    >
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
        <template #footer="{ adapter, view: active }"
            ><output data-testid="view-state"
                >{{ active }} {{ adapter.status }}
                {{ adapter === catalog ? 'same handle' : 'wrong handle' }}</output
            ></template
        >
    </DataView>
    <DataView
        v-if="shared"
        :adapter="catalog"
        :views="{ list: {} }"
        row-key="id"
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
    type DataViewViews,
    type DataViewLayout,
    type DataViewSize,
} from '@artisan-toolbox/front-awesome/data-view';
import { decodeRow } from './data-view-fixtures';
const props = defineProps<{
    infinite?: boolean;
    shared?: boolean;
    size?: DataViewSize;
    gridOnly?: boolean;
    layoutChanges?: boolean;
}>();
const catalog = useDataAdapter('Catalog', {
    decodeRow,
    protocol: 2,
    paging: 'source',
    infinite: props.infinite ?? false,
    url: false,
    searchDebounce: 0,
});
const view = shallowRef<DataViewLayout>('table');
const layouts = shallowRef<DataViewViews<(typeof catalog.data)[number]>>(
    props.gridOnly
        ? { grid: {} }
        : {
              table: {
                  columns: [
                      { field: 'id', label: 'ID', align: 'end' },
                      { field: 'name', label: 'Name', orderBy: 'title' },
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
defineExpose({ catalog, layouts, view });
</script>
