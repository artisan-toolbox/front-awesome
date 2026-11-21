<template>
    <div
        v-if="chips.length"
        class="applied-criteria"
        ref="group"
        role="group"
        :aria-label="t('appliedCriteria')"
        :data-size="size"
    >
        <button
            v-for="chip in chips"
            :key="chip.key"
            type="button"
            class="criterion-chip"
            :aria-label="t('removeCriterion', { criterion: chip.text })"
            @click="clearChip(chip)"
        >
            <span>{{ chip.text }}</span><span aria-hidden="true">×</span>
        </button>
        <span v-if="feedback.message.value" role="alert">{{ feedback.message.value }}</span>
    </div>
</template>
<script setup lang="ts">
import { computed, inject, onUpdated, onBeforeUpdate, useTemplateRef } from 'vue';
import type { AsyncOutcome, Scalar } from '@artisan-toolbox/dapter';
import type { DataViewHandle, DataViewSize } from './types';
import { type ControlLabel, useControlFeedback } from './controlFeedback';
import { criteriaFor, useAcceptedCriteria } from './criteria';
import { useDataViewText } from './messages';
import { localizationKey } from '../localization/context';

const props = defineProps<{
    adapter: DataViewHandle;
    size: DataViewSize;
    controlLabel: ControlLabel;
}>();
const t = useDataViewText();
const snapshot = useAcceptedCriteria(() => props.adapter);
const localization = inject(localizationKey, undefined);
const fallback = new Intl.NumberFormat('en');
const number = (value: number) => localization?.n(value) ?? fallback.format(value);
const labeled = (label: string, value: string) => t('criterionValue', { label, value });
type Chip = { key: string; text: string; clear: () => Promise<AsyncOutcome> };
function scalarList(value: Scalar | readonly Scalar[]): readonly Scalar[] {
    return typeof value === 'object' && value !== null ? value : [value];
}

const chips = computed(() => {
    const adapter = props.adapter;
    const state = snapshot.value;
    const accepted = adapter.accepted;
    const items: Chip[] = [];
    if (!accepted || !adapter.ready) return items;
    const options =
        adapter.requested?.paging.mode === 'offset' && !adapter.infinite
            ? { page: 'preserve' as const }
            : undefined;
    if (state) {
        const globalSearch = adapter.global?.search;
        if (globalSearch && state.global.search)
            items.push({
                key: 'global-search',
                text: labeled(t('searchResults'), state.global.search.value),
                clear: () => globalSearch.clear(options),
            });
        for (const entry of criteriaFor(adapter)) {
            const field = entry.field;
            if (entry.kind === 'search') {
                if (field === null) continue;
                const capability = adapter.fields?.[field]?.search;
                const selection = state.fields[field]?.search;
                if (capability && selection)
                    items.push({
                        key: JSON.stringify(['search', field]),
                        text: labeled(
                            t('searchField', {
                                field: props.controlLabel({ kind: 'field', field }),
                            }),
                            Array.isArray(selection.value)
                                ? JSON.stringify(selection.value)
                                : String(selection.value),
                        ),
                        clear: () => capability.clear(options),
                    });
                continue;
            }
            const scope = field === null ? adapter.global : adapter.fields?.[field];
            const capability = scope?.filters?.[entry.filter];
            const selection = (field === null ? state.global : state.fields[field])?.filters?.[
                entry.filter
            ];
            if (!capability || !selection) continue;
            for (const value of scalarList(selection.value)) {
                items.push({
                    key: JSON.stringify(['filter', field, entry.filter, value]),
                    text: labeled(
                        props.controlLabel(entry),
                        props.controlLabel({ ...entry, kind: 'option', value }),
                    ),
                    clear: () => {
                        const current = capability.current;
                        if (capability.available.multiple && current) {
                            const remaining = scalarList(current.value).filter(
                                (item) => item !== value,
                            );
                            if (remaining.length)
                                return capability.call({ value: remaining }, options);
                        }
                        return capability.clear(options);
                    },
                });
            }
        }
        const setMatch = adapter.setSearchMatch;
        const defaultMatch = adapter.global?.searchMatch.default;
        if (setMatch && defaultMatch && state.searchMatch !== defaultMatch)
            items.push({
                key: 'match',
                text: labeled(t('searchMatch'), t(state.searchMatch)),
                clear: () => setMatch(defaultMatch, options),
            });
        const order = accepted.order;
        if (state.order.kind === 'fields' && order.kind === 'terms') {
            const terms = order.terms.filter((term) => !term.role);
            terms.forEach((term, index) => {
                const capability = adapter.fields?.[term.field]?.order;
                if (capability)
                    items.push({
                        key: JSON.stringify(['order', term.field]),
                        text: t('sortCriterion', {
                            field: props.controlLabel({ kind: 'field', field: term.field }),
                            direction: t(term.direction),
                            type: t(term.sortType),
                            priority: t('priority', { priority: number(index + 1) }),
                        }),
                        clear: () => capability.clear(options),
                    });
            });
        } else if (state.order.kind === 'preset' && order.kind === 'preset') {
            const capability = adapter.global?.order;
            const preset = capability?.available.presets.find((item) => item.id === order.id);
            if (capability && preset)
                items.push({
                    key: 'preset',
                    text: t('presetOrder', { preset: preset.label }),
                    clear: () => capability.clear(options),
                });
        }
    }
    const currentSize = accepted.paging.per_page;
    const paging = adapter.paging;
    const defaultSize = adapter.definition?.paging.per_page;
    if (
        defaultSize &&
        currentSize !== defaultSize &&
        paging.per_page.options.some((size) => size === defaultSize)
    ) {
        items.push({
            key: 'size',
            text: labeled(t('perPage'), number(currentSize)),
            clear: () => {
                const current = adapter.requested;
                if (
                    current?.version === 2 &&
                    current.paging.mode === 'offset' &&
                    paging.filtered !== null &&
                    !adapter.infinite
                ) {
                    const last = Math.max(1, Math.ceil(paging.filtered / defaultSize));
                    return adapter.replaceState({
                        ...current,
                        paging: {
                            ...current.paging,
                            current: Math.min(current.paging.current, last),
                            per_page: defaultSize,
                        },
                    });
                }
                return paging.per_page.setValue(defaultSize);
            },
        });
    }
    return items;
});
const feedback = useControlFeedback(
    () => props.adapter,
    () => JSON.stringify(chips.value.map((chip) => chip.text)),
);
function clearChip(chip: Chip) {
    void feedback.run(async () => {
        const previousError = props.adapter.error;
        const outcome = await chip.clear();
        // Dapter can coalesce an identical command after its previous read failed.
        if (previousError && outcome.status === 'success' && props.adapter.error === previousError)
            return props.adapter.paging.reload();
        return outcome;
    });
}
const group = useTemplateRef('group');
let restoreFocus: (() => void) | undefined;
onBeforeUpdate(() => {
    restoreFocus = undefined;
    const active = document.activeElement;
    if (!(active instanceof HTMLButtonElement) || !group.value?.contains(active)) return;
    const region = active.closest('.data-view');
    const index = Array.from(group.value.querySelectorAll('button')).indexOf(active);
    restoreFocus = () => {
        if (active.isConnected || document.activeElement !== document.body) return;
        const remaining = group.value?.querySelectorAll('button');
        const sibling = remaining?.[Math.min(index, remaining.length - 1)];
        (
            sibling ?? region?.querySelector<HTMLButtonElement>('[data-view-options-trigger]')
        )?.focus();
    };
});
onUpdated(() => restoreFocus?.());
</script>
<style scoped>
.applied-criteria {
    display: flex;
    flex-basis: 100%;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--wa-space-2xs);
    min-inline-size: 0;
}
.criterion-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--wa-space-2xs);
    max-inline-size: 100%;
    min-block-size: 1.5rem;
    background: var(--wa-color-brand-fill-quiet);
    color: var(--wa-color-brand-on-quiet);
    border: var(--wa-border-width-s) solid var(--wa-color-brand-border-quiet);
    border-radius: var(--wa-border-radius-pill);
    padding: 0 var(--wa-space-xs);
    font: inherit;
    font-size: var(--wa-font-size-xs);
    line-height: var(--wa-line-height-condensed);
    cursor: pointer;
    overflow-wrap: anywhere;
}
.applied-criteria[data-size='l'] .criterion-chip {
    font-size: var(--wa-font-size-s);
}
@media (pointer: coarse) {
    .criterion-chip {
        min-block-size: 2rem;
    }
}
.criterion-chip:focus-visible {
    outline: var(--wa-focus-ring);
    outline-offset: var(--wa-focus-ring-offset);
}
</style>
