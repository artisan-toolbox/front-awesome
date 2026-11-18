<template>
    <div ref="toolbar" tabindex="-1" class="data-view-toolbar" @keydown.esc="closeDisclosure">
        <CriteriaSearch
            v-if="adapter.global?.search"
            :key="editSession"
            :adapter="adapter"
            :size="size"
            :label="t('searchResults')"
        />
        <Select
            v-if="preset"
            :label="t('orderPreset')"
            :size="size"
            :model-value="preset.current?.id ?? ''"
            :failed="presetFeedback.message.value || undefined"
            @update:model-value="submitOrder"
        >
            <Option value="">{{ t('noPreset') }}</Option>
            <Option v-for="item in preset.available.presets" :key="item.id" :value="item.id">{{
                item.label
            }}</Option>
        </Select>
        <div v-if="hasCriteria" class="disclosure" :class="{ expanded: criteriaOpen }">
            <button
                type="button"
                class="disclosure-toggle"
                :aria-expanded="criteriaOpen"
                :aria-controls="criteriaId"
                @click="criteriaOpen = !criteriaOpen"
            >
                {{ t('criteria') }}
            </button>
            <div v-show="criteriaOpen" :id="criteriaId" class="editors">
                <Select
                    v-if="adapter.setSearchMatch"
                    :label="t('searchMatch')"
                    :size="size"
                    :model-value="adapter.requested?.searchMatch ?? ''"
                    :failed="matchFeedback.message.value || undefined"
                    @update:model-value="submitMatch"
                >
                    <Option
                        v-for="match in adapter.global?.searchMatch.allowed"
                        :key="match"
                        :value="match"
                        >{{ t(match) }}</Option
                    >
                </Select>
                <template
                    v-for="[field, item] in fields"
                    :key="JSON.stringify([field, editSession])"
                >
                    <CriteriaSearch
                        v-if="item?.search"
                        :adapter="adapter"
                        :size="size"
                        :field="field"
                        :label="t('searchField', { field: controlLabel({ kind: 'field', field }) })"
                    />
                </template>
                <CriteriaFilter
                    v-for="entry in filters"
                    :key="JSON.stringify([entry, editSession])"
                    :adapter="adapter"
                    :size="size"
                    v-bind="entry"
                    :control-label="controlLabel"
                />
            </div>
        </div>
        <div v-if="ordered.length || preset" class="disclosure" :class="{ expanded: orderingOpen }">
            <button
                type="button"
                class="disclosure-toggle"
                :aria-expanded="orderingOpen"
                :aria-controls="orderingId"
                @click="orderingOpen = !orderingOpen"
            >
                {{ t('ordering') }}
            </button>
            <div v-show="orderingOpen" :id="orderingId" class="editors">
                <section v-if="accepted" :aria-label="t('acceptedOrder')" class="applied-order">
                    <strong>{{ t('acceptedOrder') }}</strong>
                    <span v-if="accepted.kind === 'source'">{{ t('sourceOrder') }}</span>
                    <span v-else-if="accepted.kind === 'preset'">{{
                        t('presetOrder', { preset: acceptedPreset })
                    }}</span>
                    <ol v-else>
                        <li v-for="(term, index) in accepted.terms" :key="index">
                            {{ controlLabel({ kind: 'field', field: term.field }) }} ·
                            {{ t(term.direction) }} · {{ t(term.sortType) }}
                            <span v-if="term.role"
                                >({{
                                    t(term.role === 'prefix' ? 'prefixOrder' : 'tieOrder')
                                }})</span
                            >
                        </li>
                    </ol>
                </section>
                <OrderField
                    v-for="field in ordered"
                    :key="JSON.stringify([field, editSession])"
                    :adapter="adapter"
                    :size="size"
                    :field="field"
                    :label="controlLabel({ kind: 'field', field })"
                />
            </div>
        </div>
        <Button
            v-if="adapter.requested?.version === 2 || adapter.error?.code === 'invalid_state'"
            :size="size"
            @click="reset"
            >{{ t('resetDefaults') }}</Button
        >
        <span v-if="resetFeedback.message.value" role="alert">{{
            resetFeedback.message.value
        }}</span>
    </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUpdate, onUpdated, ref, useId, watch, useTemplateRef } from 'vue';
import Button from '../components/WebAwesome/Button.vue';
import Select from '../components/WebAwesome/Select.vue';
import Option from '../components/WebAwesome/Option.vue';
import CriteriaSearch from './CriteriaSearch.vue';
import CriteriaFilter from './CriteriaFilter.vue';
import OrderField from './OrderField.vue';
import { orderModel, orderMode } from './OrderModel';
import { useControlFeedback, type ControlLabel } from './controlFeedback';
import { useDataViewText } from './messages';
import { useDocumentId } from './documentId';
import type { DataViewHandle, DataViewSize } from './types';
const props = defineProps<{
    adapter: DataViewHandle;
    size: DataViewSize;
    controlLabel: ControlLabel;
}>();
const t = useDataViewText();
const criteriaOpen = ref(false),
    orderingOpen = ref(false);
const criteriaId = useDocumentId(useId()),
    orderingId = useDocumentId(useId());
const editSession = ref(0);
const fields = computed(() => Object.entries(props.adapter.fields ?? {}));
const filters = computed(() => [
    ...Object.keys(props.adapter.global?.filters ?? {}).map((filter) => ({ field: null, filter })),
    ...fields.value.flatMap(([field, item]) =>
        Object.keys(item?.filters ?? {}).map((filter) => ({ field, filter })),
    ),
]);
const ordered = computed(() =>
    fields.value.filter(([field]) => orderModel(props.adapter, field)).map(([field]) => field),
);
const hasCriteria = computed(
    () =>
        !!props.adapter.setSearchMatch ||
        fields.value.some(([, item]) => item?.search) ||
        filters.value.length > 0,
);
watch(
    hasCriteria,
    (available) => {
        if (!available) criteriaOpen.value = false;
    },
    { flush: 'sync' },
);
watch(
    () => ordered.value.length,
    (count) => {
        if (!count) orderingOpen.value = false;
    },
    { flush: 'sync' },
);
const preset = computed(() =>
    orderMode(props.adapter) === 'offset' ? props.adapter.global?.order : null,
);
const accepted = computed(() => {
    const state = props.adapter.accepted;
    return props.adapter.requested?.version === 2 && state && 'order' in state ? state.order : null;
});
const acceptedPreset = computed(() => {
    const order = accepted.value;
    return order?.kind === 'preset'
        ? (preset.value?.available.presets.find((item) => item.id === order.id)?.label ?? order.id)
        : '';
});
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
    const live = props.adapter.setSearchMatch;
    const match = props.adapter.global?.searchMatch.allowed.find((choice) => choice === value);
    if (live && match) void matchFeedback.run(() => live(match));
}
function reset() {
    editSession.value++;
    matchFeedback.invalidate();
    presetFeedback.invalidate();
    void resetFeedback.run(() => props.adapter.resetState());
}
const toolbar = useTemplateRef('toolbar');
function closeDisclosure(event: KeyboardEvent) {
    const section = event.target instanceof Element ? event.target.closest('.disclosure') : null;
    const toggle = section?.querySelector<HTMLButtonElement>('.disclosure-toggle');
    if (!toggle || toggle.getAttribute('aria-expanded') !== 'true') return;
    if (toggle.getAttribute('aria-controls') === criteriaId.value) criteriaOpen.value = false;
    else orderingOpen.value = false;
    toggle.focus();
}
let focused: Element | null = null;
let disclosure: Element | null = null;
onBeforeUpdate(() => {
    focused = toolbar.value?.contains(document.activeElement) ? document.activeElement : null;
    disclosure = focused?.closest('.disclosure') ?? null;
});
onUpdated(() => {
    if (!focused || focused.isConnected || document.activeElement !== document.body) return;
    const region = disclosure?.isConnected ? disclosure : toolbar.value;
    const next = region?.querySelector<HTMLButtonElement>('.disclosure-toggle') ?? toolbar.value;
    next?.focus();
});
</script>
<style scoped>
.data-view-toolbar,
.editors,
.data-view-toolbar :deep(.criteria-controls) {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: var(--wa-space-s);
    min-inline-size: 0;
}
.data-view-toolbar > *,
.editors > *,
.data-view-toolbar :deep(.criteria-controls > *) {
    min-inline-size: 0;
    max-inline-size: 100%;
    box-sizing: border-box;
}
.applied-order {
    display: grid;
    gap: var(--wa-space-xs);
    overflow-wrap: anywhere;
}
.applied-order ol {
    margin-block: 0;
    padding-inline-start: var(--wa-space-l);
}
.disclosure.expanded {
    flex-basis: 100%;
}
.disclosure-toggle {
    max-inline-size: 100%;
    background: var(--wa-color-neutral-fill-quiet);
    color: inherit;
    font: inherit;
    border: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    border-radius: var(--wa-border-radius-m);
    padding: var(--wa-space-xs) var(--wa-space-s);
    cursor: pointer;
    overflow-wrap: anywhere;
}
.disclosure-toggle:focus-visible {
    outline: var(--wa-focus-ring);
    outline-offset: var(--wa-focus-ring-offset);
}
.editors {
    align-items: stretch;
    flex-direction: column;
    margin-block-start: var(--wa-space-s);
}
</style>
