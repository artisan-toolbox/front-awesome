<template>
    <section
        ref="root"
        v-bind="$attrs"
        class="data-view min-w-0"
        :data-size="size ?? 'm'"
        :aria-label="label ?? t('results')"
    >
        <header
            v-if="
                !hideHeader &&
                (slots.toolbar ||
                    slots.filters ||
                    slots.actions ||
                    availableViews.length > 1 ||
                    (!slots.pagination && state.adapter.ready) ||
                    hasToolbarControls(state.adapter))
            "
            tabindex="-1"
            class="data-view-header"
        >
            <DataViewToolbar
                :adapter="state.adapter"
                :size="size ?? 'm'"
                :control-label="controlText"
                :include-paging="!slots.pagination"
            >
                <template v-if="slots.toolbar" #controls>
                    <slot name="toolbar" v-bind="scope" />
                </template>
                <template v-if="slots.filters || slots.actions" #trailing>
                    <slot name="filters" v-bind="scope" />
                    <slot name="actions" v-bind="scope" />
                </template>
                <template v-if="availableViews.length > 1" #layouts>
                    <div
                        class="data-view-layouts"
                        :class="'wa-size-' + (size ?? 'm')"
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
                </template>
            </DataViewToolbar>
        </header>
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
        <p class="data-view-sr-only" role="status">
            {{ tablePresentation() === 'skeleton' || appending ? loadingAnnouncement : '' }}
        </p>
        <p v-if="state.adapter.status === 'idle'" class="data-view-feedback" role="status">
            {{ t('idle') }}
        </p>
        <DefineFeedback>
            <div class="data-view-feedback" role="status">
                <slot v-if="feedback === 'loading'" name="loading" v-bind="scope">
                    <Spinner aria-hidden="true" />
                    <span>{{ loadingAnnouncement }}</span>
                </slot>
                <slot v-else name="empty" v-bind="scope">
                    <span class="data-view-feedback-symbol" aria-hidden="true">
                        <Icon
                            :name="
                                emptyMessage === 'emptyMatches'
                                    ? 'magnifying-glass'
                                    : 'table-columns'
                            "
                            library="system"
                        />
                    </span>
                    <span>{{ t(emptyMessage) }}</span>
                    <span v-if="emptyMessage === 'emptyMatches'" class="data-view-feedback-hint">{{
                        t('adjustCriteria')
                    }}</span>
                </slot>
            </div>
        </DefineFeedback>

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
                    :disabled="(activeView === 'table' && !!feedback) || !items.length"
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
        <RenderFeedback v-if="feedback && tablePresentation() === 'hidden'" />
        <!-- Keep the live status row outside the busy headers while the table refreshes. -->
        <div
            class="data-view-results min-w-0"
            :aria-busy="state.adapter.paging.loading && tablePresentation() !== 'row'"
        >
            <div
                v-if="tablePresentation() !== 'hidden'"
                v-scrollbar="{ shadows: true }"
                class="data-view-scroll overflow-x-auto"
                tabindex="0"
                role="region"
                :aria-label="caption ?? label ?? t('results')"
            >
                <table
                    class="data-view-table"
                    :class="{
                        'data-view-striped': views.table?.striped,
                        'data-view-hover': views.table?.hover,
                    }"
                >
                    <caption :class="{ 'data-view-sr-only': !caption }">
                        {{ caption ?? label ?? t('results') }}
                    </caption>
                    <thead
                        tabindex="-1"
                        :aria-busy="feedback === 'loading' && tablePresentation() === 'row'"
                    >
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
                                    <button
                                        v-if="head.order"
                                        type="button"
                                        class="data-view-sort"
                                        :data-sort-column="head.id"
                                        :aria-description="
                                            head.order.accepted && head.order.acceptedPriority
                                                ? t(head.order.accepted.direction) +
                                                  ', ' +
                                                  t('priority', {
                                                      priority: head.order.acceptedPriority,
                                                  })
                                                : undefined
                                        "
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
                                            <span
                                                class="data-view-sort-indicator"
                                                aria-hidden="true"
                                            >
                                                <template v-if="typeof head.icon === 'string'">{{
                                                    head.icon
                                                }}</template>
                                                <Icon
                                                    v-else-if="head.icon"
                                                    v-bind="head.icon"
                                                    library="default"
                                                />
                                                <SortPriority
                                                    v-if="head.order.multiPriority"
                                                    :key="head.order.multiPriority"
                                                    :priority="head.order.multiPriority"
                                                />
                                            </span>
                                        </slot>
                                        <span v-if="head.order.pending"> ({{ t('pending') }})</span>
                                    </button>
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
                    <tbody v-if="tablePresentation() === 'skeleton'" aria-hidden="true" inert>
                        <tr v-for="row in skeletonCount" :key="row">
                            <td v-if="selectionState" />
                            <slot
                                name="skeleton"
                                v-bind="scope"
                                :index="row - 1"
                                :columns="columns"
                            />
                        </tr>
                    </tbody>
                    <tbody v-else-if="feedback">
                        <tr>
                            <td
                                class="data-view-feedback-cell"
                                :colspan="columns.length + (selectionState ? 1 : 0)"
                            >
                                <RenderFeedback />
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-for="run in groups" :key="run.key" class="data-view-data-rows">
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
                v-if="activeView !== 'table'"
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
        <footer v-if="!hideFooter" class="data-view-footer" tabindex="-1">
            <slot name="pagination" v-bind="scope">
                <DataViewStatus
                    v-if="state.adapter.ready && (items.length || !feedback)"
                    :adapter="state.adapter"
                />
                <DataViewNavigation
                    :with-settings="
                        !!hideHeader ||
                        !!slots.toolbar ||
                        (!state.adapter.ready && state.adapter.status === 'error')
                    "
                    :key="authority"
                    :adapter="state.adapter"
                    :size="size ?? 'm'"
                />
            </slot>
            <div v-if="slots.footer" class="data-view-footer-extra">
                <slot name="footer" v-bind="scope" />
            </div>
        </footer>
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
import { computed, nextTick, onBeforeUpdate, shallowRef, useTemplateRef, watchEffect } from 'vue';
import { createReusableTemplate } from '@vueuse/core';
import { useDataAdapter, type DataAdapterProps } from '@artisan-toolbox/dapter';
import Button from '../components/WebAwesome/Button.vue';
import Icon from '../components/WebAwesome/Icon.vue';
import { useDataViewOptions } from '../dataViewOptions';
import { useScrollbarDirective } from '../scrollbar';
import { useSortModifier, sortModifierPressed } from './sortModifier';
import Spinner from '../components/WebAwesome/Spinner.vue';
import Callout from '../components/WebAwesome/Callout.vue';
import SortPriority from './SortPriority.vue';
import DataViewToolbar from './DataViewToolbar.vue';
import DataViewNavigation from './DataViewNavigation.vue';
import DataViewStatus from './DataViewStatus.vue';
import { hasToolbarControls, useAcceptedCriteria } from './criteria';
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
import { resolveControlLabel, useControlFeedback, type ControlLabel } from './controlFeedback';
import { useDataViewText } from './messages';
import { useRowSelection } from './selection';
import { useDataViewScrollAnchor } from './scrollAnchor';
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
    stateLayout?: 'row' | 'replace';
    skeletonRows?: number;
    preserveSkeletonRows?: boolean;
    hideHeader?: boolean;
    hideFooter?: boolean;
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
const [DefineFeedback, RenderFeedback] = createReusableTemplate();
const slots = defineSlots<CurrentSlots<H, Key>>();
const emit = defineEmits<{
    'update:view': [value: DataViewLayout];
    'update:selectedKeys': [value: Key[]];
}>();
const state = { adapter: useDataAdapter<H>(props.adapter) };
const root = useTemplateRef<HTMLElement>('root');
useDataViewScrollAnchor(root, state.adapter);
const t = useDataViewText();
const options = useDataViewOptions();
const sortModifier = useSortModifier(options.multiSortKey);
const modifierLabels = {
    meta: 'sortKeyMeta',
    ctrl: 'sortKeyCtrl',
    shift: 'sortKeyShift',
    alt: 'sortKeyAlt',
} as const;
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
const appending = computed(
    () =>
        state.adapter.status === 'loading' &&
        state.adapter.infinite?.status === 'loading' &&
        data.value.length > 0,
);
const feedback = computed(() => {
    const { status } = state.adapter;
    if (status === 'loading' && !appending.value) return 'loading';
    if (status === 'success' && !data.value.length) return 'empty';
    return null;
});
const loadingAnnouncement = computed(() =>
    state.adapter.status === 'loading' ? t(state.adapter.ready ? 'updating' : 'loading') : '',
);
const acceptedCriteria = useAcceptedCriteria(() => state.adapter);
const emptyMessage = computed(() => {
    const { paging } = state.adapter;
    if (paging.total === 0) return 'emptySource';
    if (paging.filtered === 0) return 'emptyMatches';
    const accepted = state.adapter.accepted?.paging;
    const first = accepted?.mode === 'cursor' ? accepted.cursor === null : accepted?.current === 1;
    if (!first || paging.has_previous || paging.has_next || paging.filtered !== null)
        return 'emptyPage';
    const criteria = acceptedCriteria.value;
    if (
        criteria &&
        (criteria.global.search ||
            Object.keys(criteria.global.filters ?? {}).length ||
            Object.values(criteria.fields).some(
                (field) => field.search || Object.keys(field.filters ?? {}).length,
            ))
    )
        return 'emptyMatches';
    return 'empty';
});
function tablePresentation() {
    if (activeView.value !== 'table') return 'hidden';
    if (!feedback.value) return 'items';
    if (feedback.value === 'loading' && slots.skeleton) return 'skeleton';
    return props.stateLayout === 'replace' ? 'hidden' : 'row';
}
const previousCount = shallowRef(0);
watchEffect(
    () => {
        const { ready, status } = state.adapter;
        if (ready && status === 'success') previousCount.value = data.value.length;
        if (!ready && (status === 'idle' || status === 'error')) previousCount.value = 0;
    },
    { flush: 'sync' },
);
const skeletonCount = computed(() => {
    if (props.preserveSkeletonRows && previousCount.value) return previousCount.value;
    const count = props.skeletonRows ?? 5;
    return Number.isSafeInteger(count) && count > 0 ? count : 5;
});
const groups = computed(() => (feedback.value ? [] : groupRows(items.value, grouped.value)));
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
const controlText: ControlLabel = (subject) => resolveControlLabel(subject, props.controlLabel);
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
                  order.accepted?.direction === 'asc'
                      ? 'ascending'
                      : order.accepted?.direction === 'desc'
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
async function clickHeader(column: DataViewColumn<Row>, event: MouseEvent) {
    const order = orderModel(state.adapter, column.orderBy);
    if (!order) return;
    const button = event.currentTarget;
    const restoreFocus = props.stateLayout === 'replace' && document.activeElement === button;
    await sortFeedback.run(
        () =>
            order.cycle(sortModifierPressed(sortModifier.value, event)) ??
            Promise.resolve({ status: 'superseded' }),
    );
    if (!restoreFocus || !(button instanceof HTMLElement) || button.isConnected) return;
    await nextTick();
    if (document.activeElement === document.body)
        root.value
            ?.querySelector<HTMLElement>(`[data-sort-column="${CSS.escape(columnId(column))}"]`)
            ?.focus({ preventScroll: true });
}
</script>
<style scoped>
.data-view {
    container: data-view / inline-size;
    --dv-tool-font: var(--wa-font-size-m);
    --dv-inline: var(--wa-space-m);
    --dv-block: var(--wa-space-s);
    min-inline-size: 0;
    border: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    border-radius: var(--wa-border-radius-l);
    background: var(--wa-color-surface-default);
    color: var(--wa-color-text-normal);
    line-height: var(--wa-line-height-normal);
}
.data-view[data-size='s'] {
    --dv-tool-font: var(--wa-font-size-s);
    --dv-inline: var(--wa-space-s);
    --dv-block: var(--wa-space-xs);
}
.data-view[data-size='l'] {
    --dv-tool-font: var(--wa-font-size-l);
    --dv-inline: var(--wa-space-l);
    --dv-block: var(--wa-space-m);
}
.data-view-header,
.data-view-footer,
.data-view-selection {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--wa-space-s);
    padding: var(--dv-block) var(--dv-inline);
    min-inline-size: 0;
}
.data-view-header,
.data-view-selection {
    border-block-end: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
.data-view-header > *,
.data-view-footer > * {
    min-inline-size: 0;
    max-inline-size: 100%;
}
.data-view-header > :deep(.data-view-toolbar) {
    flex: 1 1 100%;
}
.data-view-layouts {
    display: inline-flex;
    box-sizing: border-box;
    max-inline-size: 100%;
    min-block-size: var(--wa-form-control-height);
    align-items: stretch;
    font-size: var(--dv-tool-font);
    gap: var(--wa-space-3xs);
    padding: var(--wa-space-3xs);
    border: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    border-radius: var(--wa-border-radius-m);
    background: var(--wa-color-surface-lowered);
}
.data-view-layouts button,
.data-view-sort {
    appearance: none;
    border: 0;
    font: inherit;
    cursor: pointer;
    color: inherit;
    background: transparent;
}
.data-view-layouts button {
    min-inline-size: 0;
    max-inline-size: 100%;
    white-space: normal;
    flex: 1 1 auto;
    block-size: auto;
    min-block-size: 24px;
    padding-block: 0;
    padding-inline: var(--wa-space-s);
    border-radius: var(--wa-border-radius-s);
    overflow-wrap: anywhere;
    font-size: var(--wa-font-size-s);
    font-weight: var(--wa-font-weight-semibold);
}
.data-view-layouts button:hover,
.data-view-sort:hover {
    background: var(--wa-color-neutral-fill-quiet);
}
.data-view-layouts button[aria-pressed='true'] {
    background: var(--wa-color-brand-fill-normal);
    color: var(--wa-color-brand-on-normal);
}
.data-view-layouts button:focus-visible,
.data-view-sort:focus-visible,
.data-view-scroll:focus-visible {
    outline: var(--wa-focus-ring);
    outline-offset: calc(-1 * var(--wa-focus-ring-width));
}
.data-view-feedback {
    box-sizing: border-box;
    display: grid;
    justify-items: center;
    align-content: center;
    gap: var(--wa-space-s);
    padding: clamp(2.5rem, 9cqi, 5rem) var(--wa-space-s);
    margin: 0;
    text-align: center;
    overflow-wrap: anywhere;
    color: var(--wa-color-text-normal);
    font-size: var(--wa-font-size-l);
    font-weight: var(--wa-font-weight-semibold);
    line-height: var(--wa-line-height-condensed);
}
.data-view-feedback-symbol {
    display: grid;
    place-items: center;
    width: 2.5em;
    height: 2.5em;
    border-radius: var(--wa-border-radius-circle);
    background: var(--wa-color-surface-lowered);
    color: var(--wa-color-text-quiet);
}
.data-view-feedback-hint {
    max-inline-size: 40ch;
    color: var(--wa-color-text-quiet);
    font-size: var(--wa-font-size-s);
    font-weight: var(--wa-font-weight-normal);
    line-height: var(--wa-line-height-normal);
}
.data-view-feedback wa-spinner {
    font-size: var(--wa-font-size-2xl);
    --indicator-color: var(--wa-color-brand-fill-loud);
}
.data-view-table td.data-view-feedback-cell {
    padding: 0;
}
.data-view-feedback-cell > .data-view-feedback {
    position: sticky;
    inset-inline-start: 0;
    inline-size: min(100%, 100cqi);
}
.data-view-selection label {
    display: inline-flex;
    align-items: center;
    gap: var(--wa-space-xs);
}
.data-view [type='checkbox'],
.data-view [type='radio'] {
    accent-color: var(--wa-color-brand-fill-loud);
    inline-size: 1.1em;
    block-size: 1.1em;
}
.data-view [data-selected] {
    background: var(--wa-color-brand-fill-quiet);
    box-shadow: inset 0 0 0 var(--wa-border-width-s) var(--wa-color-brand-border-normal);
}
.data-view-results,
.data-view-scroll {
    min-inline-size: 0;
}
.data-view-scroll {
    overflow-x: auto;
    border-radius: inherit;
}
.data-view-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--wa-font-size-m);
}
.data-view-table caption {
    text-align: start;
    padding: var(--dv-block) var(--dv-inline);
    font-weight: var(--wa-font-weight-semibold);
}
.data-view-table caption.data-view-sr-only,
.data-view-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    padding: 0;
    white-space: nowrap;
}
.data-view-table th,
.data-view-table td,
.data-view-table :slotted(td) {
    padding: var(--dv-block) var(--dv-inline);
    border-block-end: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    text-align: start;
    overflow-wrap: break-word;
}
.data-view-table tbody:last-child tr:last-child > *,
.data-view-table tbody:last-child tr:last-child > :slotted(td) {
    border-block-end: 0;
}
.data-view-table thead th {
    font-size: var(--wa-font-size-s);
    line-height: var(--wa-line-height-condensed);
    font-weight: var(--wa-font-weight-semibold);
    color: var(--wa-color-text-quiet);
    background: var(--wa-color-surface-lowered);
}
.data-view-table thead th:has(> .data-view-sort) {
    padding: 0;
}
.data-view-sort {
    display: flex;
    align-items: center;
    gap: var(--wa-space-xs);
    inline-size: 100%;
    min-block-size: max(2.5em, 24px);
    padding: var(--dv-block) var(--dv-inline);
    text-align: inherit;
}
.data-view-sort-indicator {
    display: inline-flex;
    align-items: center;
    gap: var(--wa-space-3xs);
    font-size: 0.9em;
    font-variant-numeric: tabular-nums;
}
.data-view-table thead [aria-sort] {
    color: var(--wa-color-text-normal);
}
.data-view [data-align='center'] {
    text-align: center;
}
.data-view [data-align='center'] > .data-view-sort {
    justify-content: center;
}
.data-view [data-align='end'] {
    text-align: end;
    font-variant-numeric: tabular-nums;
}
.data-view [data-align='end'] > .data-view-sort {
    justify-content: flex-end;
}
.data-view-striped tbody tr[data-even]:not([data-selected]) {
    background: var(--wa-color-surface-lowered);
}
@media (hover: hover) {
    .data-view-hover .data-view-data-rows tr:not([data-selected]):hover {
        background: var(--wa-color-neutral-fill-quiet);
    }
}
.data-view-grid,
.data-view-list {
    display: grid;
    list-style: none;
    margin: 0;
    padding: 0;
}
.data-view-grid {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 28ch), 1fr));
    gap: var(--dv-inline);
    padding: var(--dv-inline);
}
.data-view-item {
    min-inline-size: 0;
    overflow-wrap: anywhere;
    padding: var(--dv-block) var(--dv-inline);
}
.data-view-list > li + li {
    border-block-start: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
.data-view-grid > li {
    border-radius: var(--wa-border-radius-m);
    border: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
.data-view-grid > li:has(> wa-card:only-child),
.data-view-grid > li:has(> input:first-child + wa-card:last-child) {
    border: 0;
    padding: 0;
}
.data-view-footer {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    border-block-start: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
.data-view-footer-extra {
    grid-column: 1 / -1;
    flex-basis: 100%;
}
.data-view-header:empty,
.data-view-footer:empty,
.data-view-footer-extra:empty {
    display: none;
}
@container data-view (max-width: 48rem) {
    .data-view-table th,
    .data-view-table td,
    .data-view-table :slotted(td),
    .data-view-sort {
        padding-inline: var(--wa-space-s);
    }
    .data-view-table thead th:has(> .data-view-sort) {
        padding: 0;
    }
}
@container data-view (max-width: 22rem) {
    .data-view-sort {
        flex-wrap: wrap;
        block-size: auto;
        row-gap: var(--wa-space-3xs);
    }
}
@container data-view (max-width: 39.999rem) {
    .data-view-layouts {
        flex: 1 0 100%;
    }
}
@container data-view (min-width: 40rem) {
    .data-view-layouts {
        margin-inline-start: auto;
    }
    .data-view-footer {
        display: flex;
        justify-content: space-between;
    }
}
@media (pointer: coarse) {
    .data-view-layouts,
    .data-view-sort {
        min-block-size: max(44px, var(--wa-form-control-height));
    }
}
@media (forced-colors: active) {
    .data-view-layouts button[aria-pressed='true'],
    .data-view [data-selected] {
        outline: 2px solid Highlight;
        outline-offset: -2px;
    }
}
</style>
