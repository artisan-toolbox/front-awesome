import type { DataAdapterProps, Scalar } from '@artisan-toolbox/dapter';

export type DataViewHandle = NonNullable<DataAdapterProps['adapter']>;
export type DataViewLayout = 'table' | 'grid' | 'list';
export type DataViewSize = 's' | 'm' | 'l';
type ColumnPresentation = {
    readonly label: string;
    readonly align?: 'start' | 'center' | 'end';
};
export type DataViewColumn<Row> = ColumnPresentation &
    (
        | {
              readonly field: Extract<keyof Row, string>;
              readonly id?: string;
              readonly accessor?: never;
              readonly kind?: 'data';
              readonly orderBy?: string;
              readonly groupBy?: true | ((row: Row) => Scalar);
          }
        | {
              readonly id: string;
              readonly accessor: (row: Row) => unknown;
              readonly field?: never;
              readonly kind?: 'data';
              readonly orderBy?: string;
              readonly groupBy?: true | ((row: Row) => Scalar);
          }
        | {
              readonly kind: 'display';
              readonly id: string;
              readonly field?: never;
              readonly accessor?: never;
              readonly orderBy?: never;
              readonly groupBy?: never;
          }
    );
type LayoutOptions<Row> = {
    readonly table: {
        readonly columns: readonly DataViewColumn<Row>[];
        readonly label?: string;
        readonly striped?: boolean;
        readonly hover?: boolean;
    };
    readonly grid: { readonly label?: string };
    readonly list: { readonly label?: string };
};
export type DataViewViews<Row> = {
    [Layout in DataViewLayout]: Pick<LayoutOptions<Row>, Layout> & Partial<LayoutOptions<Row>>;
}[DataViewLayout];
export type OccurrenceKey = string | number;
export type DataViewRowKey<Row, Indexed extends boolean = false> =
    | { [Key in keyof Row]-?: Row[Key] extends OccurrenceKey ? Key : never }[keyof Row]
    | ((row: Row, ...index: Indexed extends true ? [index: number] : []) => OccurrenceKey);
export type ResultKey<Row, K> = K extends (...args: never[]) => infer Value
    ? Extract<Value, OccurrenceKey>
    : K extends keyof Row
      ? Extract<Row[K], OccurrenceKey>
      : never;

export type DataViewLabelSubject<Row, Key extends OccurrenceKey = OccurrenceKey> =
    | { kind: 'field'; field: string }
    | { kind: 'filter'; field: string | null; filter: string }
    | { kind: 'option'; field: string | null; filter: string; value: Scalar }
    | { kind: 'row'; row: Row; key: Key; index: number };
export type DataViewSelection<Row, Key extends OccurrenceKey = OccurrenceKey> = {
    readonly keys: readonly Key[];
    readonly rows: readonly Row[];
    has(key: Key): boolean;
    set(key: Key, selected: boolean): void;
    clear(): void;
} & (
    | { readonly mode: 'single' }
    | {
          readonly mode: 'multiple';
          readonly allLoaded: boolean;
          readonly someLoaded: boolean;
          setAllLoaded(selected: boolean): void;
      }
);

type SlotScope<H extends DataViewHandle> = { adapter: H; view: DataViewLayout };
type Item<H extends DataViewHandle> = { row: H['data'][number]; index: number };
type Cell<H extends DataViewHandle> = { column: DataViewColumn<H['data'][number]>; value: unknown };
type SelectionScope<H extends DataViewHandle, K extends OccurrenceKey> = {
    selection: DataViewSelection<H['data'][number], K> | null;
};
type SelectedItem<K> = { rowKey: K; selected: boolean };
export type DataViewScope<
    H extends DataViewHandle,
    K extends OccurrenceKey = never,
> = SlotScope<H> & ([K] extends [never] ? unknown : SelectionScope<H, K>);
export type DataViewItemScope<
    H extends DataViewHandle,
    K extends OccurrenceKey = never,
> = DataViewScope<H, K> & Item<H> & ([K] extends [never] ? unknown : SelectedItem<K>);
export type DataViewCellScope<
    H extends DataViewHandle,
    K extends OccurrenceKey = never,
> = DataViewItemScope<H, K> & Cell<H>;

export type DataViewSortDirection = null | 0 | 1 | -1;
type Head<H extends DataViewHandle> = Pick<Cell<H>, 'column'> & {
    name: string;
    sortDirection: DataViewSortDirection;
};
export type DataViewHeadScope<
    H extends DataViewHandle,
    K extends OccurrenceKey = never,
> = DataViewScope<H, K> & Head<H>;

type Slots<H extends DataViewHandle, Scope, ItemScope> = {
    [
        Name in
            | 'toolbar'
            | 'filters'
            | 'actions'
            | 'footer'
            | 'pagination'
            | 'loading'
            | 'empty'
            | 'error'
            | 'integration-error'
    ]?: (scope: Scope) => unknown;
} & {
    skeleton?: (
        scope: Scope & { index: number; columns: readonly DataViewColumn<H['data'][number]>[] },
    ) => unknown;
} & {
    [Name in 'grid-item' | 'list-item']?: (scope: ItemScope) => unknown;
} & {
    [Name in `cell-${string}`]?: (scope: ItemScope & Cell<H>) => unknown;
} & {
    [Name in `head-${string}`]?: (scope: Scope & Head<H>) => unknown;
} & {
    [Name in `header-${string}`]?: (scope: Scope & Pick<Cell<H>, 'column'>) => unknown;
};
export type DataViewSlots<H extends DataViewHandle, K extends OccurrenceKey = never> = Slots<
    H,
    DataViewScope<H, K>,
    DataViewItemScope<H, K>
>;
type CurrentScope<H extends DataViewHandle, K extends OccurrenceKey> = SlotScope<H> &
    SelectionScope<H, K>;
export type CurrentSlots<H extends DataViewHandle, K extends OccurrenceKey> = Slots<
    H,
    CurrentScope<H, K>,
    CurrentScope<H, K> & Item<H> & SelectedItem<K>
>;
