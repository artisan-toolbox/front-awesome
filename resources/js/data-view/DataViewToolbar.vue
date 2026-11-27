<template>
    <div
        v-if="slots.controls || slots.trailing || slots.layouts || sections.length"
        ref="toolbar"
        tabindex="-1"
        class="data-view-toolbar"
    >
        <slot name="controls">
            <div v-if="sections.length" class="query-stack">
                <div class="query-tools">
                    <CriteriaSearch
                        v-if="adapter.global?.search"
                        :key="`global-search-${editSession}`"
                        class="toolbar-search"
                        :adapter="adapter"
                        :size="size"
                    />
                    <ControlPanel
                        ref="panel"
                        icon="filter"
                        icon-only
                        :label="t('viewOptions')"
                        :size="size"
                    >
                        <div class="options-workspace">
                            <nav class="options-nav" :aria-label="t('viewOptions')">
                                <button
                                    v-for="section in sections"
                                    :key="section.label"
                                    type="button"
                                    :aria-pressed="section.label === active"
                                    @click="selected = section.label"
                                >
                                    <Icon
                                        :name="section.icon"
                                        library="system"
                                        aria-hidden="true"
                                    />{{ t(section.label) }}
                                </button>
                            </nav>
                            <section v-if="active" class="options-content" :aria-label="t(active)">
                                <h3>{{ t(active) }}</h3>
                                <template v-if="active === 'filters'">
                                    <Select
                                        v-if="filters.length > 1"
                                        :label="t('criterion')"
                                        :size="size"
                                        :model-value="filterKey"
                                        :options="filters"
                                        option-value="key"
                                        option-label="label"
                                        @update:model-value="filterKey = $event ?? ''"
                                    />
                                    <CriteriaFilter
                                        v-if="filter?.kind === 'filter'"
                                        :key="JSON.stringify([filter.key, editSession])"
                                        :adapter="adapter"
                                        :size="size"
                                        :field="filter.field"
                                        :filter="filter.filter"
                                        :control-label="controlLabel"
                                    />
                                </template>
                                <template v-else-if="active === 'search'">
                                    <Select
                                        v-if="searches.length > 1"
                                        :label="t('searchScope')"
                                        :size="size"
                                        :model-value="searchKey"
                                        :options="searches"
                                        option-value="key"
                                        option-label="label"
                                        @update:model-value="searchKey = $event ?? ''"
                                    />
                                    <CriteriaSearch
                                        v-if="search"
                                        :key="JSON.stringify([search.key, editSession])"
                                        :adapter="adapter"
                                        :size="size"
                                        :field="search.field ?? undefined"
                                        :label="search.label"
                                    />
                                    <Select
                                        v-if="adapter.setSearchMatch"
                                        :label="t('searchMatch')"
                                        :size="size"
                                        :model-value="adapter.requested?.searchMatch ?? null"
                                        :failed="matchFeedback.message.value || undefined"
                                        :options="matches"
                                        option-value="value"
                                        option-label="label"
                                        @update:model-value="submitMatch"
                                    />
                                </template>
                                <template v-else-if="active === 'sort'">
                                    <section
                                        v-if="accepted"
                                        :aria-label="t('acceptedOrder')"
                                        class="applied-order"
                                    >
                                        <strong>{{ t('acceptedOrder') }}</strong>
                                        <span v-if="accepted.kind === 'source'">{{
                                            t('sourceOrder')
                                        }}</span>
                                        <span v-else-if="accepted.kind === 'preset'">{{
                                            t('presetOrder', { preset: acceptedPreset })
                                        }}</span>
                                        <ol v-else>
                                            <li
                                                v-for="(term, index) in accepted.terms"
                                                :key="index"
                                            >
                                                {{
                                                    controlLabel({
                                                        kind: 'field',
                                                        field: term.field,
                                                    })
                                                }}
                                                · {{ t(term.direction) }} · {{ t(term.sortType) }}
                                                <span v-if="term.role"
                                                    >({{
                                                        t(
                                                            term.role === 'prefix'
                                                                ? 'prefixOrder'
                                                                : 'tieOrder',
                                                        )
                                                    }})</span
                                                >
                                            </li>
                                        </ol>
                                    </section>
                                    <Select
                                        v-if="preset"
                                        :label="t('orderPreset')"
                                        :size="size"
                                        :model-value="preset.current?.id ?? ''"
                                        :failed="presetFeedback.message.value || undefined"
                                        :options="presets"
                                        option-value="id"
                                        option-label="label"
                                        @update:model-value="submitOrder"
                                    />
                                    <Select
                                        v-if="ordered.length > 1"
                                        :label="t('orderField')"
                                        :size="size"
                                        :model-value="orderField"
                                        :options="orderFields"
                                        option-value="value"
                                        option-label="label"
                                        @update:model-value="orderField = $event ?? ''"
                                    />
                                    <OrderField
                                        v-if="orderField"
                                        :key="JSON.stringify([orderField, editSession])"
                                        :adapter="adapter"
                                        :size="size"
                                        :field="orderField"
                                        :label="controlLabel({ kind: 'field', field: orderField })"
                                    />
                                </template>
                                <DataViewPageSettings
                                    v-else-if="active === 'pageSettings'"
                                    :adapter="adapter"
                                    :size="size"
                                />
                                <span v-if="resetFeedback.message.value" role="alert">{{
                                    resetFeedback.message.value
                                }}</span>
                            </section>
                        </div>
                        <template
                            v-if="adapter.requested?.version === 2 || hasResettableState(adapter)"
                            #actions
                        >
                            <Button
                                type="button"
                                appearance="outlined"
                                :size="size"
                                @click="reset"
                                >{{ t('resetDefaults') }}</Button
                            >
                        </template>
                    </ControlPanel>
                </div>
                <AppliedCriteria :adapter="adapter" :size="size" :control-label="controlLabel" />
            </div>
        </slot>
        <slot name="trailing" />
        <slot name="layouts" />
    </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUpdate, onUpdated, ref, useTemplateRef, watch } from 'vue';
import Icon from '../components/WebAwesome/Icon.vue';
import AppliedCriteria from './AppliedCriteria.vue';
import DataViewPageSettings from './DataViewPageSettings.vue';
import Button from '../components/WebAwesome/Button.vue';
import Select from '../components/WebAwesome/Select.vue';
import ControlPanel from './ControlPanel.vue';
import CriteriaSearch from './CriteriaSearch.vue';
import CriteriaFilter from './CriteriaFilter.vue';
import OrderField from './OrderField.vue';
import { criteriaFor, hasResettableState, type Criterion } from './criteria';
import { orderModel, orderMode } from './OrderModel';
import { useControlFeedback, type ControlLabel } from './controlFeedback';
import { useDataViewText } from './messages';
import type { DataViewHandle, DataViewSize } from './types';
const props = defineProps<{
    adapter: DataViewHandle;
    size: DataViewSize;
    includePaging: boolean;
    controlLabel: ControlLabel;
}>();
const slots = defineSlots<{
    controls?: () => unknown;
    trailing?: () => unknown;
    layouts?: () => unknown;
}>();
const t = useDataViewText();
const panel = useTemplateRef('panel');
const toolbar = useTemplateRef('toolbar');
const editSession = ref(0);
watch(
    () => !!props.adapter.definition,
    (available) => {
        if (available) return;
        editSession.value++;
        panel.value?.dismiss();
    },
    { flush: 'sync' },
);
function label(entry: Criterion) {
    if (entry.kind === 'filter') return props.controlLabel(entry);
    return entry.field === null
        ? t('searchResults')
        : t('searchField', { field: props.controlLabel({ kind: 'field', field: entry.field }) });
}
const criteria = computed(() =>
    [
        ...(props.adapter.global?.search ? [{ kind: 'search', field: null } as const] : []),
        ...criteriaFor(props.adapter),
    ].map((entry) => ({
        ...entry,
        key: JSON.stringify(entry),
        label: label(entry),
    })),
);
const filters = computed(() => criteria.value.filter((entry) => entry.kind === 'filter'));
const searches = computed(() => criteria.value.filter((entry) => entry.kind === 'search'));
const matches = computed(() =>
    props.adapter.global?.searchMatch.allowed.map((value) => ({ value, label: t(value) })),
);
const filterKey = ref('');
const searchKey = ref('');
const filter = computed(
    () => filters.value.find((entry) => entry.key === filterKey.value) ?? filters.value[0],
);
const search = computed(
    () => searches.value.find((entry) => entry.key === searchKey.value) ?? searches.value[0],
);
watch(
    filter,
    (next, previous) => {
        if (
            previous &&
            !filters.value.some((entry) => entry.key === previous.key) &&
            active.value === 'filters'
        )
            panel.value?.dismiss();
        filterKey.value = next?.key ?? '';
    },
    { immediate: true },
);
watch(
    search,
    (next, previous) => {
        if (
            previous &&
            !searches.value.some((entry) => entry.key === previous.key) &&
            active.value === 'search'
        )
            panel.value?.dismiss();
        searchKey.value = next?.key ?? '';
    },
    { immediate: true },
);
const ordered = computed(() =>
    Object.keys(props.adapter.fields ?? {}).filter((field) => orderModel(props.adapter, field)),
);
const orderFields = computed(() =>
    ordered.value.map((field) => ({
        value: field,
        label: props.controlLabel({ kind: 'field', field }),
    })),
);
const orderField = ref('');
watch(
    ordered,
    (fields) => {
        if (fields.includes(orderField.value)) return;
        if (orderField.value && active.value === 'sort') panel.value?.dismiss();
        orderField.value = fields[0] ?? '';
    },
    { immediate: true },
);
const preset = computed(() =>
    orderMode(props.adapter) === 'offset' ? props.adapter.global?.order : null,
);
const presets = computed(() => [
    { id: '', label: t('noPreset') },
    ...(preset.value?.available.presets ?? []),
]);
const accepted = computed(() => {
    const state = props.adapter.accepted;
    return state && 'order' in state ? state.order : null;
});
const acceptedPreset = computed(() => {
    const order = accepted.value;
    return order?.kind === 'preset'
        ? (preset.value?.available.presets.find((item) => item.id === order.id)?.label ?? order.id)
        : '';
});
type Section = 'filters' | 'search' | 'sort' | 'pageSettings' | 'resetDefaults';
const selected = ref<Section>();
const sections = computed(() => {
    const items: { label: Section; icon: string }[] = [];
    if (filters.value.length) items.push({ label: 'filters', icon: 'filter' });
    if (searches.value.length || props.adapter.setSearchMatch)
        items.push({ label: 'search', icon: 'magnifying-glass' });
    if (ordered.value.length || preset.value) items.push({ label: 'sort', icon: 'up-down' });
    if (props.includePaging && props.adapter.ready)
        items.push({ label: 'pageSettings', icon: 'forward-step' });
    if (!items.length && hasResettableState(props.adapter))
        items.push({ label: 'resetDefaults', icon: 'gear' });
    return items;
});
const active = computed(
    () =>
        sections.value.find((section) => section.label === selected.value)?.label ??
        sections.value[0]?.label,
);
const presetFeedback = useControlFeedback(
    () => props.adapter,
    () => JSON.stringify([preset.value?.available, preset.value?.current]),
);
const matchFeedback = useControlFeedback(
    () => props.adapter,
    () =>
        JSON.stringify([
            !!props.adapter.setSearchMatch,
            props.adapter.global?.searchMatch,
            props.adapter.requested?.searchMatch,
        ]),
);
const resetFeedback = useControlFeedback(
    () => props.adapter,
    () => JSON.stringify(props.adapter.requested),
);
function submitOrder(value: unknown) {
    const live = preset.value;
    if (!live || typeof value !== 'string') return;
    if (value === '') void presetFeedback.run(() => live.clear());
    else if (live.available.presets.some((item) => item.id === value))
        void presetFeedback.run(() => live.call({ id: value }));
}
function submitMatch(value: unknown) {
    const match = props.adapter.global?.searchMatch.allowed.find((choice) => choice === value);
    const set = props.adapter.setSearchMatch;
    if (set && match) void matchFeedback.run(() => set(match));
}
function reset() {
    editSession.value++;
    matchFeedback.invalidate();
    presetFeedback.invalidate();
    void resetFeedback.run(() => props.adapter.resetState());
}
let focused: Element | null = null;
onBeforeUpdate(() => {
    const element = document.activeElement;
    focused =
        toolbar.value?.contains(element) && !element?.closest('.applied-criteria') ? element : null;
});
onUpdated(() => {
    if (!focused || focused.isConnected || document.activeElement !== document.body) return;
    (toolbar.value?.querySelector<HTMLButtonElement>('.panel-trigger') ?? toolbar.value)?.focus();
});
</script>
<style scoped>
.data-view-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: start;
    gap: var(--wa-space-s);
    min-inline-size: 0;
}
.query-stack {
    display: grid;
    row-gap: calc(var(--wa-focus-ring-width) + var(--wa-focus-ring-offset) + var(--wa-space-xs));
    flex: 1 1 17rem;
    min-inline-size: 0;
}
.query-tools {
    display: flex;
    align-items: start;
    gap: var(--wa-space-xs);
    min-inline-size: 0;
    max-inline-size: 100%;
}
.query-tools:has(.toolbar-search) {
    max-inline-size: min(100%, 30rem);
}
.toolbar-search {
    flex: 1;
    min-inline-size: 0;
}
.toolbar-search :deep(wa-input::part(form-control-label)) {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
}
.options-workspace {
    display: grid;
    min-inline-size: 0;
}
.options-nav {
    display: flex;
    flex-wrap: wrap;
    align-content: start;
    gap: var(--wa-space-2xs);
    padding: var(--wa-space-s);
    background: var(--wa-color-surface-lowered);
    border-block-end: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
.options-nav button {
    display: inline-flex;
    align-items: center;
    justify-content: start;
    gap: var(--wa-space-xs);
    padding: var(--wa-space-xs) var(--wa-space-s);
    min-block-size: 2.25rem;
    border: 1px solid transparent;
    border-radius: var(--wa-border-radius-m);
    background: transparent;
    font: inherit;
    font-size: var(--wa-font-size-s);
    color: var(--wa-color-text-normal);
    text-align: start;
    cursor: pointer;
}
.options-nav button:hover {
    background: var(--wa-color-neutral-fill-quiet);
}
.options-nav button[aria-pressed='true'] {
    background: var(--wa-color-brand-fill-quiet);
    color: var(--wa-color-brand-on-quiet);
    border-color: var(--wa-color-brand-border-quiet);
    font-weight: var(--wa-font-weight-semibold);
}
.options-nav button:focus-visible {
    outline: var(--wa-focus-ring);
    outline-offset: var(--wa-focus-ring-offset);
}
.options-content {
    display: grid;
    align-content: start;
    gap: var(--wa-space-m);
    min-inline-size: 0;
    padding: var(--wa-space-m);
}
.options-content h3 {
    margin: 0;
    font-size: var(--wa-font-size-l);
    font-weight: var(--wa-font-weight-semibold);
    line-height: var(--wa-line-height-condensed);
}
.options-content :deep(.criteria-controls) {
    display: grid;
    gap: var(--wa-space-s);
}
.applied-order {
    display: grid;
    gap: var(--wa-space-xs);
    min-inline-size: 0;
}
.applied-order {
    background: var(--wa-color-surface-lowered);
    border-inline-start: 3px solid var(--wa-color-brand-border-normal);
    padding: var(--wa-space-s);
    border-radius: var(--wa-border-radius-s);
    font-size: var(--wa-font-size-s);
}
.applied-order ol {
    margin: 0;
    padding-inline-start: var(--wa-space-l);
}
@container options-dialog (min-width:36rem) {
    .options-workspace {
        grid-template-columns: 10.5rem minmax(0, 1fr);
        min-block-size: 17rem;
    }
    .options-nav {
        display: grid;
        border-block-end: 0;
        border-inline-end: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    }
    .options-content {
        padding: var(--wa-space-l);
    }
}
@container data-view (max-width: 39.999rem) {
    .query-stack {
        flex-basis: 100%;
    }
    .query-tools:has(.toolbar-search) {
        max-inline-size: 100%;
    }
}
@media (pointer: coarse) {
    .toolbar-search :deep(wa-input::part(base)),
    .options-nav button {
        min-block-size: max(44px, var(--wa-form-control-height));
    }
}
</style>
