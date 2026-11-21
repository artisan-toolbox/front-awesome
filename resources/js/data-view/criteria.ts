import { shallowRef, watchEffect } from 'vue';
import type { SourceRequestedStateV2 } from '@artisan-toolbox/dapter';
import { orderModel, orderMode } from './OrderModel';
import type { DataViewHandle } from './types';

export type Criterion =
    | { kind: 'search'; field: string | null }
    | { kind: 'filter'; field: string | null; filter: string };

export function criteriaFor(adapter: DataViewHandle): Criterion[] {
    const criteria: Criterion[] = [];
    for (const [field, controls] of Object.entries(adapter.fields ?? {})) {
        if (controls?.search) criteria.push({ kind: 'search', field });
        for (const filter of Object.keys(controls?.filters ?? {}))
            criteria.push({ kind: 'filter', field, filter });
    }
    for (const filter of Object.keys(adapter.global?.filters ?? {}))
        criteria.push({ kind: 'filter', field: null, filter });
    return criteria;
}

export function hasResettableState(adapter: DataViewHandle) {
    if (adapter.error?.code === 'invalid_state') return true;
    const state = adapter.requested;
    if (state?.version !== 2 || !adapter.definition) return false;
    return (
        Object.keys(state.fields).length > 0 ||
        Object.keys(state.global).length > 0 ||
        state.order.kind !== 'default' ||
        state.searchMatch !== adapter.global?.searchMatch.default ||
        (state.paging.mode === 'cursor'
            ? state.paging.cursor !== null
            : state.paging.current > 1) ||
        state.paging.per_page !== adapter.definition.paging.per_page
    );
}

export function hasToolbarControls(adapter: DataViewHandle) {
    return !!(
        adapter.global?.search ||
        adapter.setSearchMatch ||
        criteriaFor(adapter).length ||
        (orderMode(adapter) === 'offset' && adapter.global?.order) ||
        Object.keys(adapter.fields ?? {}).some((field) => orderModel(adapter, field)) ||
        hasResettableState(adapter)
    );
}

// Protocol 2 publishes criteria in requested state when a read succeeds. During a
// pending or rejected read the same property describes intent, not the visible rows.
const acceptedSnapshots = new WeakMap<object, SourceRequestedStateV2>();

export function useAcceptedCriteria(adapter: () => DataViewHandle) {
    const snapshot = shallowRef<SourceRequestedStateV2>();
    watchEffect(
        () => {
            const { accepted, status, requested } = adapter();
            if (accepted && status === 'success' && requested?.version === 2)
                acceptedSnapshots.set(accepted, requested);
            snapshot.value = accepted ? acceptedSnapshots.get(accepted) : undefined;
        },
        { flush: 'sync' },
    );
    return snapshot;
}
