import type {
    AdapterDefinition,
    PagingPosition,
    SourceRequestedStateV2,
} from '@artisan-toolbox/dapter';
export function decodeRow(value: unknown) {
    if (
        !value ||
        typeof value !== 'object' ||
        !('id' in value) ||
        typeof value.id !== 'number' ||
        !('name' in value) ||
        typeof value.name !== 'string'
    )
        throw new Error('Invalid product');
    return { id: value.id, name: value.name };
}
export const definition = {
    fields: {
        title: {
            search: { valueType: 'string', matchTypes: ['contains'] },
            order: { directions: ['asc', 'desc'], sortTypes: ['natural'] },
            filters: null,
        },
        status: {
            search: null,
            order: null,
            filters: { selected: { values: ['active', 'archived'], multiple: false } },
        },
    },
    global: {
        search: {
            valueType: 'string',
            targets: { title: { valueType: 'string', matchType: 'contains' } },
        },
        order: { presets: [{ id: 'featured', label: 'Featured' }], pagingModes: ['offset'] },
        filters: null,
        multi_order: true,
        multi_order_limit: 2,
        searchMatch: { default: 'all', allowed: ['all', 'any'] },
    },
    paging: { mode: 'offset', per_page: 2, per_page_options: [2, 3] },
} satisfies AdapterDefinition;
export function intent(
    paging: PagingPosition = { mode: 'offset', current: 1, per_page: 2 },
): SourceRequestedStateV2 {
    return {
        version: 2,
        fields: {},
        global: {},
        order: { kind: 'default' },
        searchMatch: 'all',
        paging,
    };
}
export function response(
    state = intent(),
    options: { rows?: ReturnType<typeof decodeRow>[]; next?: boolean } = {},
) {
    const paging = state.paging;
    const capabilities: AdapterDefinition = {
        ...definition,
        paging:
            paging.mode === 'offset'
                ? definition.paging
                : paging.mode === 'simple'
                  ? { mode: 'simple', per_page: 2, per_page_options: [2, 3], counts: 'unknown' }
                  : {
                        mode: 'cursor',
                        per_page: 2,
                        per_page_options: [2, 3],
                        counts: 'unknown',
                        expires_after: 900,
                    },
    };
    const current = paging.mode === 'cursor' ? null : paging.current;
    return {
        version: 2,
        data: options.rows ?? [
            { id: 1, name: 'Alpha' },
            { id: 2, name: 'Beta' },
        ],
        requested: state,
        state: {
            order:
                state.order.kind === 'default'
                    ? { kind: 'source' }
                    : state.order.kind === 'fields'
                      ? { kind: 'terms', terms: state.order.terms }
                      : {
                            kind: 'preset',
                            id: state.order.id,
                            identity: `preset:${state.order.id}`,
                            opaque: true,
                        },
            paging,
        },
        paging:
            paging.mode === 'offset'
                ? {
                      ...paging,
                      pages: Math.ceil(6 / paging.per_page),
                      total: 6,
                      filtered: 6,
                      has_previous: paging.current > 1,
                      has_next: paging.current < Math.ceil(6 / paging.per_page),
                  }
                : {
                      ...paging,
                      current,
                      pages: null,
                      total: null,
                      filtered: null,
                      has_previous:
                          paging.mode === 'simple' ? paging.current > 1 : paging.cursor !== null,
                      has_next: options.next ?? true,
                      previous_cursor:
                          paging.mode === 'cursor' && paging.cursor ? 'previous-token' : null,
                      next_cursor:
                          paging.mode === 'cursor' && options.next !== false ? 'next-token' : null,
                  },
        capabilities,
        metadata: { records: { mode: 'unidentified' }, channel: null },
    };
}
