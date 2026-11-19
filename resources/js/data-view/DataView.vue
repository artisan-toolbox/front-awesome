<template>
    <section
        v-bind="$attrs"
        class="data-view min-w-0"
        :data-size="size ?? 'm'"
        :aria-label="label ?? t('results')"
    >
        <slot name="toolbar" v-bind="scope">
            <DataViewToolbar
                :key="editorGeneration"
                :adapter="state.adapter"
                :size="size ?? 'm'"
                :control-label="controlText"
            />
        </slot>
        <slot name="filters" v-bind="scope" />
        <slot name="actions" v-bind="scope" />
        <div
            v-if="availableViews.length > 1"
            class="data-view-layouts"
            role="group"
            :aria-label="t('layout')"
        >
            <button
                v-for="layout in availableViews"
                :key="layout"
                type="button"
                :aria-pressed="activeView === layout"
                @click="selectView(layout)"
            >
                {{ views[layout]?.label ?? t(layout) }}
            </button>
        </div>
        <div v-if="state.adapter.integrationError" role="alert">
            <slot name="integration-error" v-bind="scope"
                ><Callout variant="warning">{{
                    state.adapter.integrationError.message
                }}</Callout></slot
            >
        </div>
        <div v-if="state.adapter.error" role="alert">
            <slot name="error" v-bind="scope">
                <Callout variant="danger">
                    {{ state.adapter.error.message }}
                    <Button
                        v-if="
                            !state.adapter.infinite &&
                            ['invalid_cursor', 'cursor_expired'].includes(state.adapter.error.code)
                        "
                        :size="size ?? 'm'"
                        :disabled="state.adapter.paging.loading"
                        @click="state.adapter.paging.goToFirst()"
                        >{{ t('restart') }}</Button
                    >
                </Callout>
            </slot>
        </div>
        <div v-if="state.adapter.status === 'loading'" class="data-view-status" role="status">
            <slot name="loading" v-bind="scope"
                ><Spinner />{{ t(state.adapter.ready ? 'updating' : 'loading') }}</slot
            >
        </div>
        <p v-else-if="state.adapter.status === 'idle'" class="data-view-status" role="status">
            {{ t('idle') }}
        </p>
        <div
            v-else-if="state.adapter.status === 'success' && !items.length"
            class="data-view-status"
            role="status"
        >
            <slot name="empty" v-bind="scope">{{ t('empty') }}</slot>
        </div>

        <div
            v-if="selectionState"
            class="data-view-selection"
            role="group"
            :aria-label="t('selection')"
        >
            <label v-if="selectionState.mode === 'multiple'">
                <input
                    type="checkbox"
                    form=""
                    :checked="selectionState.allLoaded"
                    :indeterminate.prop="selectionState.someLoaded"
                    :disabled="!items.length"
                    @change="changeAll($event)"
                />
                {{ t('selectAll') }}
            </label>
            <span>{{ t('selected', {}, selectionState.keys.length) }}</span>
            <Button
                :size="size ?? 'm'"
                appearance="plain"
                :disabled="!selectionState.keys.length"
                @click="selectionState.clear()"
                >{{ t('clearSelection') }}</Button
            >
        </div>
        <div class="data-view-results min-w-0" :aria-busy="state.adapter.paging.loading">
            <div v-if="activeView === 'table'" v-scrollbar class="data-view-scroll overflow-x-auto">
                <table
                    class="data-view-table"
                    :class="{
                        'data-view-striped': views.table?.striped,
                        'data-view-hover': views.table?.hover,
                    }"
                >
                    <caption>
                        {{ caption ?? label ?? t('results') }}
                    </caption>
                    <thead>
                        <tr>
                            <th v-if="selectionState" scope="col">{{ t('selection') }}</th>
                            <th
                                v-for="head in headers"
                                :key="head.id"
                                scope="col"
                                :data-align="head.column.align ?? 'start'"
                                :aria-sort="head.ariaSort"
                            >
                                <slot
                                    :name="`header-${head.id}`"
                                    v-bind="scope"
                                    :column="head.column"
                                >
                                    <Button
                                        v-if="head.order"
                                        appearance="plain"
                                        :size="size ?? 'm'"
                                        :title="
                                            head.order.canAdd
                                                ? t('sortModifier', {
                                                      key: t(modifierLabels[sortModifier]),
                                                  })
                                                : t('sortHeader')
                                        "
                                        @click="clickHeader(head.column, $event)"
                                    >
                                        <slot
                                            :name="`head-${head.id}`"
                                            v-bind="{ ...scope, name: head.column.label }"
                                            :column="head.column"
                                            :sort-direction="head.sortDirection"
                                        >
                                            {{ head.column.label }}
                                            <span aria-hidden="true">
                                                <template v-if="typeof head.icon === 'string'">{{
                                                    head.icon
                                                }}</template>
                                                <Icon
                                                    v-else-if="head.icon"
                                                    v-bind="head.icon"
                                                    library="default"
                                                />
                                                {{
                                                    state.adapter.global?.multi_order
                                                        ? head.order.current?.priority
                                                        : ''
                                                }}
                                            </span>
                                        </slot>
                                        <span v-if="head.order.pending"> ({{ t('pending') }})</span>
                                    </Button>
                                    <slot
                                        v-else
                                        :name="`head-${head.id}`"
                                        v-bind="{ ...scope, name: head.column.label }"
                                        :column="head.column"
                                        :sort-direction="head.sortDirection"
                                        >{{ head.column.label }}</slot
                                    >
                                </slot>
                            </th>
                        </tr>
                    </thead>
                    <tbody v-for="run in groups" :key="run.key">
                        <tr
                            v-for="(item, position) in run.rows"
                            :key="item.key"
                            :data-even="item.index % 2 === 1 || undefined"
                            :data-selected="selectionState?.has(item.key) || undefined"
                        >
                            <td v-if="selectionState">
                                <input
                                    :type="selectionState.mode === 'single' ? 'radio' : 'checkbox'"
                                    form=""
                                    :name="selectionState.mode === 'single' ? radioName : undefined"
                                    :aria-label="rowLabel(item)"
                                    :checked="selectionState.has(item.key)"
                                    @change="changeRow(item.key, $event)"
                                />
                            </td>
                            <template v-for="column in columns" :key="columnId(column)">
                                <component
                                    :is="column === grouped ? 'th' : 'td'"
                                    v-if="column !== grouped || position === 0"
                                    :scope="column === grouped ? 'rowgroup' : undefined"
                                    :rowspan="column === grouped ? run.rows.length : undefined"
                                    :data-align="column.align ?? 'start'"
                                >
                                    <slot
                                        :name="`cell-${columnId(column)}`"
                                        v-bind="itemScope(item)"
                                        :column="column"
                                        :value="valueOf(column, item.row)"
                                        >{{ displayValue(valueOf(column, item.row)) }}</slot
                                    >
                                </component>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>
            <ul
                v-else
                :class="activeView === 'grid' ? 'data-view-grid' : 'data-view-list'"
                :aria-label="caption ?? label ?? t('results')"
            >
                <li
                    v-for="item in items"
                    :key="item.key"
                    class="data-view-item"
                    :data-selected="selectionState?.has(item.key) || undefined"
                >
                    <input
                        v-if="selectionState"
                        :type="selectionState.mode === 'single' ? 'radio' : 'checkbox'"
                        form=""
                        :name="selectionState.mode === 'single' ? radioName : undefined"
                        :aria-label="rowLabel(item)"
                        :checked="selectionState.has(item.key)"
                        @change="changeRow(item.key, $event)"
                    />
                    <slot
                        :name="activeView === 'grid' ? 'grid-item' : 'list-item'"
                        v-bind="itemScope(item)"
                    />
                </li>
            </ul>
        </div>
        <p v-if="sortFeedback.message.value" role="alert">{{ sortFeedback.message.value }}</p>
        <slot name="pagination" v-bind="scope"
            ><DataViewPager :key="authority" :adapter="state.adapter" :size="size ?? 'm'"
        /></slot>
        <slot name="footer" v-bind="scope" />
    </section>
</template>
<script
    setup
    lang="ts"
    generic="
        H extends NonNullable<DataAdapterProps['adapter']>,
        K extends DataViewRowKey<NoInfer<H>['data'][number], true> = DataViewRowKey<
            NoInfer<H>['data'][number],
            true
        >
    "
>
import { computed, onBeforeUpdate, shallowRef, watch, watchEffect } from 'vue';
import { useDataAdapter, type DataAdapterProps } from '@artisan-toolbox/dapter';
import Button from '../components/WebAwesome/Button.vue';
import Icon from '../components/WebAwesome/Icon.vue';
import { useDataViewOptions } from '../dataViewOptions';
import { useScrollbarDirective } from '../scrollbar';
import { useSortModifier, sortModifierPressed } from './sortModifier';
import Spinner from '../components/WebAwesome/Spinner.vue';
import Callout from '../components/WebAwesome/Callout.vue';
import DataViewToolbar from './DataViewToolbar.vue';
import DataViewPager from './DataViewPager.vue';
import {
    columnId,
    columnValue,
    displayValue,
    ownerOptions,
    occurrences,
    groupingColumn,
    groupRows,
    type Occurrence,
} from './presentation';
import type {
    DataViewColumn,
    DataViewLayout,
    DataViewRowKey,
    DataViewSize,
    CurrentSlots,
    ResultKey,
    DataViewLabelSubject,
    DataViewViews,
    DataViewSortDirection,
} from './types';
import { orderModel } from './OrderModel';
import { useControlFeedback, type ControlLabel } from './controlFeedback';
import { useDataViewText } from './messages';
import { useRowSelection } from './selection';
import { useDocumentId } from './documentId';

type Row = H['data'][number];
type Key = ResultKey<Row, K>;
defineOptions({ inheritAttrs: false });
const vScrollbar = useScrollbarDirective();
const props = defineProps<{
    adapter: H;
    views: DataViewViews<NoInfer<H>['data'][number]>;
    rowKey: K;
    selection?: 'single' | 'multiple';
    selectedKeys?: ReadonlyArray<NoInfer<Key>>;
    controlLabel?: (
        subject: DataViewLabelSubject<NoInfer<H>['data'][number], NoInfer<Key>>,
    ) => string | undefined;
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
const slots = defineSlots<CurrentSlots<H, Key>>();
const emit = defineEmits<{
    'update:view': [value: DataViewLayout];
    'update:selectedKeys': [value: Key[]];
}>();
const state = { adapter: useDataAdapter<H>(props.adapter) };
const t = useDataViewText();
const options = useDataViewOptions();
const sortModifier = useSortModifier(options.multiSortKey);
const modifierLabels = {
    meta: 'sortKeyMeta',
    ctrl: 'sortKeyCtrl',
    shift: 'sortKeyShift',
    alt: 'sortKeyAlt',
} as const;
const editorGeneration = shallowRef(0);
watch(
    () => !!state.adapter.definition,
    (available) => {
        if (!available) editorGeneration.value++;
    },
    { flush: 'sync' },
);
const radioName = useDocumentId();
const table = computed(() => {
    const columns = props.views?.table?.columns ?? [];
    return { columns, grouped: groupingColumn(columns) };
});
const availableViews = computed(() => {
    if (!props.views || typeof props.views !== 'object' || Array.isArray(props.views))
        throw new Error('DataView requires a views object.');
    const available: DataViewLayout[] = [];
    for (const key of Object.keys(props.views)) {
        if ((key === 'table' || key === 'grid' || key === 'list') && props.views[key] === undefined)
            continue;
        if (key === 'table' && props.views.table) {
            if (!table.value.columns.length)
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
const columns = computed(() => table.value.columns);
const grouped = computed(() => table.value.grouped);
const data = computed<readonly Row[]>(() => state.adapter.data);
const items = computed(() => occurrences<Row, K>(data.value, props.rowKey));
const groups = computed(() => groupRows(items.value, grouped.value));
const { authority, selection: selectionState } = useRowSelection<Row, Key>(
    state.adapter,
    items,
    props,
    (keys) => emit('update:selectedKeys', keys),
);
const scope = computed(() => ({
    adapter: state.adapter,
    view: activeView.value,
    selection: selectionState.value,
}));
function itemScope(item: Occurrence<Row, Key>) {
    return {
        ...scope.value,
        row: item.row,
        index: item.index,
        rowKey: item.key,
        selected: selectionState.value?.has(item.key) ?? false,
    };
}
function changeAll(event: Event) {
    const input = event.currentTarget;
    const selection = selectionState.value;
    if (!(input instanceof HTMLInputElement) || selection?.mode !== 'multiple') return;
    selection.setAllLoaded(input.checked);
    const current = selectionState.value;
    if (current?.mode === 'multiple') {
        input.checked = current.allLoaded;
        input.indeterminate = current.someLoaded;
    }
}
function changeRow(key: Key, event: Event) {
    const input = event.currentTarget;
    const selection = selectionState.value;
    if (!(input instanceof HTMLInputElement) || !selection) return;
    selection.set(key, input.checked);
    input.checked = selection.has(key);
    if (input.type === 'radio' && !input.checked) {
        // Activating a native radio also unchecks its sibling before change fires.
        const retained = input
            .closest('.data-view-results')
            ?.querySelector<HTMLInputElement>(`[data-selected] input[name="${radioName.value}"]`);
        if (retained) retained.checked = true;
    }
}
function valueOf(column: DataViewColumn<Row>, row: Row) {
    return columnValue<Row>(column, row);
}
const controlText: ControlLabel = (subject) => {
    const formatted = props.controlLabel?.(subject);
    if (formatted !== undefined) return formatted;
    if (subject.kind === 'field') return subject.field;
    if (subject.kind === 'filter')
        return subject.field === null
            ? subject.filter
            : `${controlText({ kind: 'field', field: subject.field })} · ${subject.filter}`;
    return typeof subject.value === 'string'
        ? JSON.stringify(subject.value)
        : String(subject.value);
};
function rowLabel(item: Occurrence<Row, Key>) {
    const row =
        props.controlLabel?.({ kind: 'row', row: item.row, key: item.key, index: item.index }) ??
        t('row', { key: typeof item.key === 'string' ? JSON.stringify(item.key) : item.key });
    return t('selectRow', { row });
}
function selectView(layout: DataViewLayout) {
    selectedView.value = layout;
    emit('update:view', layout);
}
const headers = computed(() => {
    let hasPrimary = false;
    return columns.value.map((column) => {
        const order = orderModel(state.adapter, column.orderBy);
        let ariaSort: 'ascending' | 'descending' | undefined;
        if (!hasPrimary && order?.acceptedPriority === 1 && order.accepted) {
            hasPrimary = true;
            ariaSort = order.accepted.direction === 'asc' ? 'ascending' : 'descending';
        }
        const sortDirection: DataViewSortDirection = !order
            ? null
            : !order.current
              ? 0
              : order.current.direction === 'asc'
                ? 1
                : -1;
        const icon = !order
            ? null
            : options.sortIcons[
                  sortDirection === 1
                      ? 'ascending'
                      : sortDirection === -1
                        ? 'descending'
                        : 'unsorted'
              ];
        return { column, id: columnId(column), order, ariaSort, sortDirection, icon };
    });
});
const sortFeedback = useControlFeedback(
    () => state.adapter,
    () =>
        JSON.stringify([
            authority.value,
            activeView.value,
            headers.value.map((h) => [
                h.id,
                h.order?.sortTypes,
                h.order?.directions,
                h.order?.current,
            ]),
        ]),
);
function clickHeader(column: DataViewColumn<Row>, event: MouseEvent) {
    const order = orderModel(state.adapter, column.orderBy);
    if (order)
        void sortFeedback.run(
            () =>
                order.cycle(sortModifierPressed(sortModifier.value, event)) ??
                Promise.resolve({ status: 'superseded' }),
        );
}
</script>
<style scoped>
.data-view {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    gap: var(--wa-space-m);
    color: var(--wa-color-text-normal);
}
.data-view-layouts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--wa-space-xs);
}
.data-view-selection,
.data-view-selection label,
.data-view-status {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--wa-space-s);
    margin: 0;
}
.data-view-layouts button {
    cursor: pointer;
    max-inline-size: 100%;
    min-inline-size: 0;
    white-space: normal;
    font: inherit;
    color: inherit;
    padding: var(--wa-space-xs) var(--wa-space-m);
    background: var(--wa-color-surface-default);
    border: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    border-radius: var(--wa-border-radius-pill);
    overflow-wrap: anywhere;
}
.data-view-layouts button[aria-pressed='true'] {
    color: var(--wa-color-brand-on-normal);
    background: var(--wa-color-brand-fill-normal);
    border-color: var(--wa-color-brand-border-normal);
}
.data-view-layouts button:focus-visible {
    outline: var(--wa-focus-ring);
    outline-offset: var(--wa-focus-ring-offset);
}
.data-view [type='checkbox'],
.data-view [type='radio'] {
    accent-color: var(--wa-color-brand-fill-loud);
    inline-size: 1.1em;
    block-size: 1.1em;
}
.data-view-item {
    overflow-wrap: anywhere;
}
.data-view [data-selected] {
    box-shadow: inset 0 0 0 var(--wa-border-width-s) var(--wa-color-brand-border-normal);
}
.data-view-scroll {
    min-width: 0;
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
.data-view-striped tbody tr[data-even] {
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
