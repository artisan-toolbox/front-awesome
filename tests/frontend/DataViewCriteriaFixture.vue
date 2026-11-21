<template>
    <aside v-if="sidebar" aria-label="Filter stock">
        <form @submit.prevent="submissions++">
            <DataViewFilter
                :adapter="adapter"
                filter="single"
                label="Stock mark"
                :control-label="name"
            />
            <DataViewSearch :adapter="adapter" field="notes" />
            <button type="submit">Save host form</button>
            <output data-testid="submissions">{{ submissions }}</output>
        </form>
    </aside>
    <DataView :adapter="adapter" :views="{ grid: {} }" row-key="id" :control-label="name">
        <template #grid-item="{ row }">{{ row.name }}</template>
    </DataView>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useDataAdapter } from '@artisan-toolbox/dapter';
import {
    DataView,
    DataViewFilter,
    DataViewSearch,
    type DataViewLabelSubject,
} from '@artisan-toolbox/front-awesome/data-view';
import { decodeRow } from './data-view-fixtures';
const props = defineProps<{ sidebar?: boolean; debounce?: number }>();
const submissions = ref(0);
const adapter = useDataAdapter('Catalog', {
    decodeRow,
    protocol: 2,
    paging: 'source',
    url: false,
    searchDebounce: props.debounce ?? 0,
});
function name(subject: DataViewLabelSubject<ReturnType<typeof decodeRow>, number>) {
    if (subject.kind === 'field') return subject.field;
    if (subject.kind === 'filter') return (subject.field ?? 'global') + ' ' + subject.filter;
    if (subject.kind === 'option')
        return typeof subject.value + ' ' + JSON.stringify(subject.value);
}
defineExpose({ adapter });
</script>
