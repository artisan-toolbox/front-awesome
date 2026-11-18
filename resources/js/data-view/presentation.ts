import type { DataAdapterProps, Scalar } from '@artisan-toolbox/dapter';
import type { DataViewColumn, DataViewRowKey, ResultKey, OccurrenceKey } from './types';

export const ownerOptions = {
    source: true,
    id: true,
    decodeRow: true,
    decodeDefinition: true,
    actionDefinitions: true,
    protocol: true,
    paging: true,
    searchDebounce: true,
    echo: true,
    polling: true,
    url: true,
    scrollContainer: true,
    infinite: true,
} satisfies Record<Exclude<keyof DataAdapterProps, 'adapter'>, true>;

export function columnId<Row>(column: DataViewColumn<Row>): string {
    const id = column.id ?? column.field;
    if (!id?.trim()) throw new Error('DataView columns require a nonempty id or field.');
    return id;
}
export function columnValue<Row>(column: DataViewColumn<Row>, row: Row): unknown {
    if (column.kind === 'display') return undefined;
    if (column.accessor) return column.accessor(row);
    return row[column.field];
}
export function rowIdentity<Row, K extends DataViewRowKey<Row, true>>(
    row: Row,
    rowKey: K,
    index = 0,
): ResultKey<Row, K> {
    const key = typeof rowKey === 'function' ? rowKey(row, index) : row[rowKey as keyof Row];
    if (typeof key !== 'string' && typeof key !== 'number')
        throw new Error('DataView row keys must be strings or numbers.');
    if (typeof key === 'number' && !Number.isFinite(key))
        throw new Error('DataView numeric row keys must be finite.');
    return key as ResultKey<Row, K>;
}
export function displayValue(value: unknown): string {
    if (value == null) return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
        return String(value);
    return '';
}

export type Occurrence<Row, Key extends OccurrenceKey> = { row: Row; index: number; key: Key };
export function occurrences<Row, K extends DataViewRowKey<Row, true>>(
    rows: readonly Row[],
    rowKey: K,
) {
    const keys = new Set<OccurrenceKey>();
    return rows.map((row, index) => {
        const key = rowIdentity<Row, K>(row, rowKey, index);
        if (keys.has(key)) throw new Error('DataView row keys must be unique.');
        keys.add(key);
        return { row, index, key };
    });
}

export function groupingColumn<Row>(columns: readonly DataViewColumn<Row>[]) {
    const ids = columns.map(columnId);
    if (new Set(ids).size !== ids.length) throw new Error('DataView column ids must be unique.');
    const grouped = columns.filter((column) => column.groupBy !== undefined);
    if (grouped.length > 1) throw new Error('DataView supports one grouped data column.');
    const column = grouped[0];
    if (
        column &&
        (column.kind === 'display' ||
            (column.groupBy !== true && typeof column.groupBy !== 'function'))
    )
        throw new Error('DataView groupBy requires a data column and a scalar accessor or true.');
    return column;
}

export function groupRows<Row, Key extends OccurrenceKey>(
    items: readonly Occurrence<Row, Key>[],
    column?: DataViewColumn<Row>,
) {
    const groups: { rows: Occurrence<Row, Key>[]; key: Key; group: Scalar }[] = [];
    for (const item of items) {
        const group =
            typeof column?.groupBy === 'function'
                ? column.groupBy(item.row)
                : column
                  ? columnValue(column, item.row)
                  : null;
        if (
            group !== null &&
            typeof group !== 'string' &&
            typeof group !== 'boolean' &&
            !(typeof group === 'number' && Number.isFinite(group))
        )
            throw new Error('DataView group keys must be finite scalar values or null.');
        const last = groups.at(-1);
        if (last && last.group === group) last.rows.push(item);
        else groups.push({ rows: [item], key: item.key, group });
    }
    return groups;
}
