<template>
    <DataView :adapter="adapter" :views="{ grid: {} }" row-key="id" :control-label="name">
        <template #grid-item="{ row }">{{ row.name }}</template>
    </DataView>
</template>
<script setup lang="ts">
import { useDataAdapter } from '@artisan-toolbox/dapter';
import { DataView, type DataViewLabelSubject } from '@artisan-toolbox/front-awesome/data-view';
import { decodeRow } from './data-view-fixtures';
const adapter = useDataAdapter('Catalog', {
    decodeRow,
    protocol: 2,
    paging: 'source',
    url: false,
    searchDebounce: 0,
});
function name(subject: DataViewLabelSubject<ReturnType<typeof decodeRow>, number>) {
    if (subject.kind === 'field') return subject.field;
    if (subject.kind === 'filter') return (subject.field ?? 'global') + ' ' + subject.filter;
    if (subject.kind === 'option')
        return typeof subject.value + ' ' + JSON.stringify(subject.value);
}
defineExpose({ adapter });
</script>
