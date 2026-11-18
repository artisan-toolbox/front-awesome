import { computed, nextTick, onBeforeUnmount, shallowRef, watch, type ComputedRef } from 'vue';
import type { Occurrence } from './presentation';
import type { DataViewHandle, DataViewSelection, OccurrenceKey } from './types';

const synchronous = { immediate: true, flush: 'sync' } as const;

function sameKeys<Key>(left: readonly Key[], right: readonly Key[]) {
    return left.length === right.length && left.every((key, index) => key === right[index]);
}

export function useRowSelection<Row, Key extends OccurrenceKey>(
    adapter: DataViewHandle,
    items: ComputedRef<readonly Occurrence<Row, Key>[]>,
    options: { readonly selection?: 'single' | 'multiple'; readonly selectedKeys?: readonly Key[] },
    emit: (keys: Key[]) => void,
) {
    const authority = shallowRef(0);
    const selected = shallowRef<readonly Key[]>([]);
    const refused = new Set<Key>();
    let selectionGeneration = 0;
    watch(
        () => options.selection,
        () => {
            selectionGeneration++;
        },
        { flush: 'sync' },
    );
    let initialPrefill = true;
    let disposed = false;
    let pendingRequest: readonly Key[] | undefined;
    let lastCorrection: string | undefined;

    watch(
        () => [adapter.ready, adapter.status, adapter.error?.kind] as const,
        ([ready, status, error], previous) => {
            if (ready) initialPrefill = false;
            if (
                !ready &&
                (previous?.[0] ||
                    (status === 'idle' && previous && previous[1] !== 'idle') ||
                    (status === 'error' &&
                        (error === 'access' || error === 'protocol') &&
                        previous?.[1] !== 'error'))
            ) {
                initialPrefill = false;
                for (const key of options.selectedKeys ?? []) refused.add(key);
                authority.value++;
            }
        },
        synchronous,
    );

    const membership = computed(() => new Set(items.value.map((item) => item.key)));
    function inResultOrder(keys: Iterable<Key>) {
        const wanted = new Set(keys);
        return items.value.filter((item) => wanted.has(item.key)).map((item) => item.key);
    }

    function permittedKeys(source: readonly Key[]) {
        if (!adapter.ready) return [];
        const allowed = source.filter((key) => membership.value.has(key) && !refused.has(key));
        return inResultOrder(options.selection === 'single' ? allowed.slice(0, 1) : allowed);
    }

    watch(
        () =>
            [
                authority.value,
                adapter.ready,
                membership.value,
                options.selection,
                options.selectedKeys?.slice(),
            ] as const,
        ([, ready, live, mode, model]) => {
            pendingRequest = undefined;
            const supplied = new Set(model);
            for (const key of refused) if (!supplied.has(key)) refused.delete(key);
            if (ready || !initialPrefill) {
                for (const key of supplied) if (!live.has(key) || !ready) refused.add(key);
            }
            if (!mode || (!ready && initialPrefill)) {
                selected.value = [];
                lastCorrection = undefined;
                return;
            }
            const next = permittedKeys(model ?? selected.value);
            const changed = !sameKeys(selected.value, next);
            if (changed) selected.value = next;
            if (!model) {
                if (changed) emit([...next]);
                return;
            }
            if (sameKeys(model, next)) {
                lastCorrection = undefined;
                return;
            }
            const signature = JSON.stringify([model, next]);
            if (changed || lastCorrection !== signature) {
                lastCorrection = signature;
                emit([...next]);
            }
        },
        synchronous,
    );
    onBeforeUnmount(() => {
        disposed = true;
    });
    const selectedSet = computed(() => new Set(selected.value));
    const selection = computed<DataViewSelection<Row, Key> | null>(() => {
        const mode = options.selection;
        if (!mode) return null;
        const generation = authority.value;
        const selectionVersion = selectionGeneration;
        const keys = Object.freeze([...selected.value]);
        const snapshot = new Set(keys);
        const rows = Object.freeze(
            items.value.filter((item) => snapshot.has(item.key)).map((item) => item.row),
        );
        const current = () =>
            !disposed &&
            adapter.ready &&
            authority.value === generation &&
            selectionGeneration === selectionVersion &&
            options.selection === mode;
        function update(next: Key[]) {
            if (sameKeys(next, selected.value)) return;
            if (options.selectedKeys === undefined) {
                selected.value = next;
                emit([...next]);
                return;
            }
            const effective = permittedKeys(options.selectedKeys);
            if (!sameKeys(selected.value, effective)) selected.value = effective;
            if (pendingRequest && sameKeys(pendingRequest, next)) return;
            pendingRequest = next;
            emit([...next]);
            void nextTick(() => {
                if (pendingRequest === next) pendingRequest = undefined;
            });
        }
        const common = {
            keys,
            rows,
            has: (key: Key) => current() && selectedSet.value.has(key),
            set(key: Key, checked: boolean) {
                if (
                    !current() ||
                    !membership.value.has(key) ||
                    selectedSet.value.has(key) === checked
                )
                    return;
                if (checked) refused.delete(key);
                const next = new Set(mode === 'single' && checked ? [] : selected.value);
                if (checked) next.add(key);
                else next.delete(key);
                update(inResultOrder(next));
            },
            clear() {
                if (current()) update([]);
            },
        };
        if (mode === 'single') return { ...common, mode };
        const count = items.value.length;
        return {
            ...common,
            mode,
            allLoaded: count > 0 && keys.length === count,
            someLoaded: keys.length > 0 && keys.length < count,
            setAllLoaded(checked: boolean) {
                if (!current()) return;
                if (checked) for (const key of membership.value) refused.delete(key);
                update(checked ? items.value.map((item) => item.key) : []);
            },
        };
    });
    return { authority, selection };
}
