import type { DataAdapterProps } from '@artisan-toolbox/dapter';
import type { DataViewColumn, DataViewRowKey } from './types';

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
export function rowIdentity<Row>(row: Row, rowKey: DataViewRowKey<Row>): string | number {
    const key = typeof rowKey === 'function' ? rowKey(row) : row[rowKey];
    if (typeof key !== 'string' && typeof key !== 'number')
        throw new Error('DataView row keys must be strings or numbers.');
    if (typeof key === 'number' && !Number.isFinite(key))
        throw new Error('DataView numeric row keys must be finite.');
    return key;
}
export function displayValue(value: unknown): string {
    if (value == null) return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
        return String(value);
    return '';
}
