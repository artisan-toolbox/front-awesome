import type { DataViewHandle } from './types';

export function orderMode(adapter: DataViewHandle) {
    return adapter.paging.mode ?? adapter.requested?.paging.mode;
}

export function orderModel(adapter: DataViewHandle, field: string | undefined) {
    const capability = field === undefined ? null : adapter.fields?.[field]?.order;
    if (!capability) return null;
    const sortTypes = capability.available.sortTypes.filter(
        (type) => orderMode(adapter) !== 'cursor' || type === 'native',
    );
    if (!sortTypes.length) return null;
    const { directions } = capability.available;
    const { current } = capability;
    const requested = adapter.requested?.order;
    const acceptedOrder =
        adapter.accepted && 'order' in adapter.accepted ? adapter.accepted.order : null;
    const acceptedTerms =
        acceptedOrder?.kind === 'terms' ? acceptedOrder.terms.filter((term) => !term.role) : [];
    const index = acceptedTerms.findIndex((term) => term.field === field);
    const accepted = acceptedTerms[index] ?? null;
    const acceptedPriority = accepted ? index + 1 : null;
    const pending =
        adapter.status === 'loading' &&
        (acceptedPriority !== (current?.priority ?? null) ||
            accepted?.direction !== current?.direction ||
            accepted?.sortType !== current?.sortType);
    const canAdd =
        adapter.global?.multi_order === true &&
        requested?.kind !== 'preset' &&
        (current !== null ||
            (requested?.kind === 'fields' ? requested.terms.length : 0) <
                adapter.global.multi_order_limit);
    function cycle(add: boolean) {
        const nextDirection = current
            ? directions[directions.indexOf(current.direction) + 1]
            : directions[0];
        const replacingMultiple =
            !add && requested?.kind === 'fields' && requested.terms.length > 1;
        const next = nextDirection ?? (replacingMultiple ? directions[0] : undefined);
        const sortType = current?.sortType ?? sortTypes[0];
        if (!next) return capability?.clear();
        if (sortType && (!add || canAdd))
            return capability?.call({ direction: next, sortType, multiSort: add });
    }
    return {
        capability,
        sortTypes,
        directions,
        current,
        accepted,
        acceptedPriority,
        pending,
        canAdd,
        cycle,
    };
}
