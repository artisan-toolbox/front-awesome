<template>
    <section
        v-bind="$attrs"
        class="data-view"
        :data-size="size ?? 'm'"
        :aria-label="label ?? 'Results'"
        :aria-busy="state.adapter.paging.loading"
    >
        <slot name="toolbar" :adapter="state.adapter" :view="activeView">
            <DataViewToolbar :adapter="state.adapter" :size="size ?? 'm'" />
        </slot>
        <slot name="filters" :adapter="state.adapter" :view="activeView" />
        <slot name="actions" :adapter="state.adapter" :view="activeView" />
        <div
            v-if="availableViews.length > 1"
            class="data-view-layouts"
            role="group"
            aria-label="Results layout"
        >
            <Button
                v-for="layout in availableViews"
                :key="layout"
                :size="size ?? 'm'"
                :appearance="activeView === layout ? 'filled' : 'outlined'"
                :aria-pressed="activeView === layout"
                @click="selectView(layout)"
                >{{ views[layout]?.label ?? layoutLabels[layout] }}</Button
            >
        </div>
        <div v-if="state.adapter.integrationError" role="alert">
            <slot name="integration-error" :adapter="state.adapter" :view="activeView"
                ><Callout variant="warning">{{
                    state.adapter.integrationError.message
                }}</Callout></slot
            >
        </div>
        <div v-if="state.adapter.error" role="alert">
            <slot name="error" :adapter="state.adapter" :view="activeView">
                <Callout variant="danger"
                    >{{ state.adapter.error.message }}
                    <Button
                        v-if="state.adapter.error.code === 'cursor_expired'"
                        :size="size ?? 'm'"
                        @click="state.adapter.paging.goToFirst()"
                        >Restart from first page</Button
                    >
                </Callout>
            </slot>
        </div>
        <div v-if="state.adapter.status === 'loading'" role="status">
            <slot name="loading" :adapter="state.adapter" :view="activeView"
                ><Spinner />
                {{ state.adapter.data.length ? 'Updating results…' : 'Loading results…' }}</slot
            >
        </div>
        <p v-else-if="state.adapter.status === 'idle'" role="status">Waiting for results.</p>
        <div
            v-else-if="state.adapter.status === 'success' && state.adapter.data.length === 0"
            role="status"
        >
            <slot name="empty" :adapter="state.adapter" :view="activeView">No results.</slot>
        </div>
        <div v-if="activeView === 'table'" class="data-view-scroll">
            <table
                class="data-view-table"
                :class="{
                    'data-view-striped': views.table?.striped,
                    'data-view-hover': views.table?.hover,
                }"
            >
                <caption>
                    {{ caption ?? label ?? 'Results' }}
                </caption>
                <thead>
                    <tr>
                        <th
                            v-for="column in columns"
                            :key="columnId(column)"
                            scope="col"
                            :data-align="column.align ?? 'start'"
                            :aria-sort="acceptedSort(column)"
                        >
                            <slot
                                :name="`header-${columnId(column)}`"
                                :adapter="state.adapter"
                                :view="activeView"
                                :column="column"
                            >
                                <Button
                                    v-if="orderCapability(column)"
                                    appearance="plain"
                                    :size="size ?? 'm'"
                                    :title="
                                        state.adapter.global?.multi_order
                                            ? 'Sort column. Hold Shift to add to the current order.'
                                            : 'Sort column'
                                    "
                                    @click="orderColumn(column, $event)"
                                    >{{ column.label
                                    }}<span v-if="orderCapability(column)?.current">
                                        {{
                                            orderCapability(column)?.current?.direction === 'asc'
                                                ? '↑'
                                                : '↓'
                                        }}
                                        {{
                                            state.adapter.global?.multi_order
                                                ? orderCapability(column)?.current?.priority
                                                : ''
                                        }}</span
                                    ><span
                                        v-if="
                                            orderCapability(column)?.current &&
                                            state.adapter.status === 'loading'
                                        "
                                    >
                                        (pending)</span
                                    ></Button
                                >
                                <template v-else>{{ column.label }}</template>
                            </slot>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in state.adapter.data" :key="identity(row)">
                        <td
                            v-for="column in columns"
                            :key="columnId(column)"
                            :data-align="column.align ?? 'start'"
                        >
                            <slot
                                :name="`cell-${columnId(column)}`"
                                :adapter="state.adapter"
                                :view="activeView"
                                :row="row"
                                :index="index"
                                :column="column"
                                :value="valueOf(column, row)"
                                >{{ displayValue(valueOf(column, row)) }}</slot
                            >
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <ul
            v-else
            :class="activeView === 'grid' ? 'data-view-grid' : 'data-view-list'"
            :aria-label="caption ?? label ?? 'Results'"
        >
            <li
                v-for="(row, index) in state.adapter.data"
                :key="identity(row)"
                class="data-view-item"
            >
                <slot
                    :name="activeView === 'grid' ? 'grid-item' : 'list-item'"
                    :adapter="state.adapter"
                    :view="activeView"
                    :row="row"
                    :index="index"
                />
            </li>
        </ul>
        <slot name="pagination" :adapter="state.adapter" :view="activeView"
            ><DataViewPager :adapter="state.adapter" :size="size ?? 'm'"
        /></slot>
        <slot name="footer" :adapter="state.adapter" :view="activeView" />
    </section>
</template>
<script setup lang="ts" generic="H extends NonNullable<DataAdapterProps['adapter']>">
import { computed, onBeforeUpdate, shallowRef, watchEffect } from 'vue';
import { useDataAdapter, type DataAdapterProps } from '@artisan-toolbox/dapter';
import Button from '../components/WebAwesome/Button.vue';
import Spinner from '../components/WebAwesome/Spinner.vue';
import Callout from '../components/WebAwesome/Callout.vue';
import DataViewToolbar from './DataViewToolbar.vue';
import DataViewPager from './DataViewPager.vue';
import { columnId, columnValue, displayValue, ownerOptions, rowIdentity } from './presentation';
import type {
    DataViewColumn,
    DataViewLayout,
    DataViewRowKey,
    DataViewSize,
    DataViewSlots,
    DataViewViews,
} from './types';
defineOptions({ inheritAttrs: false });
const props = defineProps<{
    adapter: H;
    views: DataViewViews<NoInfer<H>['data'][number]>;
    rowKey: DataViewRowKey<NoInfer<H>['data'][number]>;
    view?: DataViewLayout;
    size?: DataViewSize;
    label?: string;
    caption?: string;
    source?: never;
    id?: never;
    decodeRow?: never;
    decodeDefinition?: never;
    actionDefinitions?: never;
    protocol?: never;
    paging?: never;
    searchDebounce?: never;
    echo?: never;
    polling?: never;
    url?: never;
    scrollContainer?: never;
    infinite?: never;
}>();
const slots = defineSlots<DataViewSlots<H>>();
const emit = defineEmits<{ 'update:view': [value: DataViewLayout] }>();
const state = { adapter: useDataAdapter<H>(props.adapter) };
const layoutLabels = { table: 'Table', grid: 'Grid', list: 'List' };
const availableViews = computed(() => {
    if (!props.views || typeof props.views !== 'object' || Array.isArray(props.views))
        throw new Error('DataView requires a views object.');
    const available: DataViewLayout[] = [];
    for (const key of Object.keys(props.views)) {
        if ((key === 'table' || key === 'grid' || key === 'list') && props.views[key] === undefined)
            continue;
        if (key === 'table' && props.views.table) {
            if (!props.views.table.columns.length)
                throw new Error('DataView table requires at least one column.');
            available.push(key);
        } else if ((key === 'grid' || key === 'list') && props.views[key]) {
            requireItemSlot(key);
            available.push(key);
        } else throw new Error(`Unknown DataView layout: ${key}.`);
    }
    if (!available.length) throw new Error('DataView requires at least one configured layout.');
    return available;
});
function requireItemSlot(layout: 'grid' | 'list') {
    if (!slots[`${layout}-item`])
        throw new Error(`DataView ${layout} requires a #${layout}-item slot.`);
}
onBeforeUpdate(() => {
    for (const layout of availableViews.value) if (layout !== 'table') requireItemSlot(layout);
});
const selectedView = shallowRef<DataViewLayout>();
const activeView = computed(() => {
    const candidate = props.view ?? selectedView.value;
    return candidate && availableViews.value.includes(candidate)
        ? candidate
        : availableViews.value[0];
});
watchEffect(() => {
    if (props.adapter !== state.adapter)
        throw new Error('DataView adapter is fixed. Use a keyed remount to replace it.');
    for (const key of Object.keys(ownerOptions)) {
        if (Reflect.get(props, key) !== undefined)
            throw new Error(
                `DataView borrows an adapter. Configure ${key} in useDataAdapter instead.`,
            );
    }
    if (props.view !== undefined && props.view !== activeView.value)
        emit('update:view', activeView.value);
});
const columns = computed(() => props.views.table?.columns ?? []);
watchEffect(() => {
    const ids = columns.value.map(columnId);
    if (new Set(ids).size !== ids.length) throw new Error('DataView column ids must be unique.');
    const keys = state.adapter.data.map((row) => rowIdentity<H['data'][number]>(row, props.rowKey));
    if (new Set(keys).size !== keys.length) throw new Error('DataView row keys must be unique.');
});
function identity(row: H['data'][number]) {
    return rowIdentity<H['data'][number]>(row, props.rowKey);
}
function valueOf(column: DataViewColumn<H['data'][number]>, row: H['data'][number]) {
    return columnValue<H['data'][number]>(column, row);
}
function selectView(layout: DataViewLayout) {
    selectedView.value = layout;
    emit('update:view', layout);
}
function orderCapability(column: DataViewColumn<H['data'][number]>) {
    return column.orderBy ? state.adapter.fields?.[column.orderBy]?.order : null;
}
function orderColumn(column: DataViewColumn<H['data'][number]>, event: MouseEvent) {
    const capability = orderCapability(column);
    if (!capability) return;
    const directions = capability.available.directions;
    const currentIndex = capability.current ? directions.indexOf(capability.current.direction) : -1;
    const direction = directions[currentIndex + 1];
    const sortType = capability.current?.sortType ?? capability.available.sortTypes[0];
    if (!direction) void capability.clear();
    else if (sortType)
        void capability.call({
            direction,
            sortType,
            multiSort: event.shiftKey && state.adapter.global?.multi_order === true,
        });
}
function acceptedSort(
    column: DataViewColumn<H['data'][number]>,
): 'ascending' | 'descending' | undefined {
    const accepted = state.adapter.accepted;
    if (!column.orderBy || !accepted || !('order' in accepted) || accepted.order.kind !== 'terms')
        return undefined;
    const primary = accepted.order.terms.find((term) => !term.role);
    if (primary?.field !== column.orderBy) return undefined;
    return primary.direction === 'asc' ? 'ascending' : 'descending';
}
</script>
<style scoped>
.data-view {
    display: grid;
    gap: var(--wa-space-m);
    color: var(--wa-color-text-normal);
}
.data-view-layouts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--wa-space-xs);
}
.data-view-scroll {
    overflow-x: auto;
}
.data-view-table {
    width: 100%;
    border-collapse: collapse;
}
.data-view-table caption {
    text-align: start;
    padding-block: var(--wa-space-s);
    font-weight: var(--wa-font-weight-semibold);
}
.data-view-table th,
.data-view-table td {
    padding: var(--wa-space-m);
    border-block-end: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
.data-view [data-align='start'] {
    text-align: start;
}
.data-view [data-align='center'] {
    text-align: center;
}
.data-view [data-align='end'] {
    text-align: end;
}
.data-view[data-size='s'] th,
.data-view[data-size='s'] td {
    padding: var(--wa-space-xs) var(--wa-space-s);
}
.data-view[data-size='l'] th,
.data-view[data-size='l'] td {
    padding: var(--wa-space-l);
}
.data-view-striped tbody tr:nth-child(even) {
    background: var(--wa-color-surface-lowered);
}
.data-view-hover tbody tr:hover {
    background: var(--wa-color-neutral-fill-quiet);
}
.data-view-grid,
.data-view-list {
    display: grid;
    gap: var(--wa-space-m);
    list-style: none;
    padding: 0;
    margin: 0;
}
.data-view-grid {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 28ch), 1fr));
}
.data-view-item {
    min-width: 0;
    padding: var(--wa-space-m);
    border: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    border-radius: var(--wa-border-radius-m);
}
</style>
