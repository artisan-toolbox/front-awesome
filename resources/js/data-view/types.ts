import type { DataAdapterProps } from '@artisan-toolbox/dapter';

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
          }
        | {
              readonly id: string;
              readonly accessor: (row: Row) => unknown;
              readonly field?: never;
              readonly kind?: 'data';
              readonly orderBy?: string;
          }
        | {
              readonly kind: 'display';
              readonly id: string;
              readonly field?: never;
              readonly accessor?: never;
              readonly orderBy?: never;
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
export type DataViewRowKey<Row> =
    | {
          [Key in keyof Row]-?: Row[Key] extends string | number ? Key : never;
      }[keyof Row]
    | ((row: Row) => string | number);
export type DataViewScope<H extends DataViewHandle> = { adapter: H; view: DataViewLayout };
export type DataViewItemScope<H extends DataViewHandle> = DataViewScope<H> & {
    row: H['data'][number];
    index: number;
};
export type DataViewCellScope<H extends DataViewHandle> = DataViewItemScope<H> & {
    column: DataViewColumn<H['data'][number]>;
    value: unknown;
};
export type DataViewSlots<H extends DataViewHandle> = {
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
    ]?: (scope: DataViewScope<H>) => unknown;
} & {
    [Name in 'grid-item' | 'list-item']?: (scope: DataViewItemScope<H>) => unknown;
} & {
    [Name in `cell-${string}`]?: (scope: DataViewCellScope<H>) => unknown;
} & {
    [Name in `header-${string}`]?: (
        scope: DataViewScope<H> & { column: DataViewColumn<H['data'][number]> },
    ) => unknown;
};
