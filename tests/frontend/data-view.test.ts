import { readFile } from 'node:fs/promises';
import { compileScript, parse } from '@vue/compiler-sfc';
import { expect, test } from 'vite-plus/test';
import {
    columnId,
    columnValue,
    displayValue,
    rowIdentity,
    ownerOptions,
} from '../../resources/js/data-view/presentation';
import type {
    DataViewColumn,
    DataViewRowKey,
    DataViewViews,
} from '@artisan-toolbox/front-awesome/data-view';

test('distinguishes decoded properties, computed values, and presentation-only cells', () => {
    const row = { id: 3, name: 'Alpha' };
    const field = { field: 'name', label: 'Name', orderBy: 'title' } satisfies DataViewColumn<
        typeof row
    >;
    expect(columnId(field)).toBe('name');
    expect(columnValue(field, row)).toBe('Alpha');
    expect(
        columnValue(
            { id: 'summary', label: 'Summary', accessor: (value) => `${value.name} ${value.id}` },
            row,
        ),
    ).toBe('Alpha 3');
    expect(columnValue({ kind: 'display', id: 'actions', label: 'Actions' }, row)).toBeUndefined();
    expect(rowIdentity(row, 'id')).toBe(3);
    expect(rowIdentity(row, (value) => value.name)).toBe('Alpha');
    expect(() => rowIdentity(row, () => Number.NaN)).toThrow('finite');
    expect(displayValue({ hidden: true })).toBe('');
    expect(displayValue(false)).toBe('false');
    expect(displayValue(0)).toBe('0');
});
test('keeps Dapter optional in the root and generated component barrels and compiles SFC macros', async () => {
    for (const file of [
        'resources/js/index.ts',
        'resources/js/components/index.ts',
        'resources/js/components/WebAwesome/index.ts',
    ]) {
        const source = await readFile(file, 'utf8');
        expect(source).not.toContain('dapter');
        expect(source).not.toContain('data-view');
    }
    for (const name of ['DataView', 'DataViewToolbar', 'DataViewPager']) {
        const filename = `resources/js/data-view/${name}.vue`;
        const { descriptor } = parse(await readFile(filename, 'utf8'), { filename });
        const compiled = compileScript(descriptor, { id: name });
        if (name === 'DataView') {
            for (const key of Object.keys(ownerOptions))
                expect(compiled.bindings?.[key]).toBe('props');
        }
    }
});
test('rejects ambiguous presentation and nonexistent row keys in TypeScript', () => {
    type Row = { id: number; name: string; details: object };
    // @ts-expect-error Display cells cannot authorize server order.
    const display: DataViewColumn<Row> = {
        kind: 'display',
        id: 'actions',
        label: 'Actions',
        orderBy: 'id',
    };
    // @ts-expect-error Data fields must exist on the decoded row.
    const field: DataViewColumn<Row> = { field: 'missing', label: 'Missing' };
    // @ts-expect-error At least one layout is required.
    const views: DataViewViews<Row> = {};
    // @ts-expect-error Row identity must be scalar.
    const rowKey: DataViewRowKey<Row> = 'details';
    void [display, field, views, rowKey];
});

test('reports invalid JavaScript layout and ownership inputs at the presentation boundary', async () => {
    const { createSSRApp, h } = await import('vue');
    const { renderToString } = await import('vue/server-renderer');
    const { useDataAdapter } = await import('@artisan-toolbox/dapter');
    const { DataView } = await import('@artisan-toolbox/front-awesome/data-view');
    function render(overrides: object) {
        const app = createSSRApp({
            setup() {
                const adapter = useDataAdapter('Catalog', {
                    decodeRow: (value: unknown) => ({ id: String(value) }),
                });
                return () =>
                    h(DataView<typeof adapter>, {
                        adapter,
                        rowKey: 'id',
                        views: { table: { columns: [{ field: 'id', label: 'ID' }] } },
                        ...overrides,
                    });
            },
        });
        app.config.warnHandler = () => {};
        return renderToString(app);
    }
    await expect(render({ source: 'Other' })).rejects.toThrow('Configure source in useDataAdapter');
    await expect(render({ views: {} })).rejects.toThrow('at least one configured layout');
    await expect(render({ views: { table: { columns: [] } } })).rejects.toThrow(
        'at least one column',
    );
    await expect(render({ views: { grid: {} } })).rejects.toThrow('#grid-item');
    await expect(
        render({
            views: {
                table: {
                    columns: [
                        { field: 'id', label: 'One' },
                        { field: 'id', label: 'Two' },
                    ],
                },
            },
        }),
    ).rejects.toThrow('column ids must be unique');
});
