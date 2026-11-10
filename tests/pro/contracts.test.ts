import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, expectTypeOf, test } from 'vite-plus/test';
import * as pro from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
import * as core from '@artisan-toolbox/front-awesome/components/WebAwesome';
import type {
    DatePickerProps,
    DateInputProps,
    DataGridProps,
    ChartProps,
} from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
import definitions from '../../resources/js/WebAwesome/proComponents.json';
import coreDefinitions from '../../resources/js/WebAwesome/components.json';

const root = resolve(import.meta.dirname, '../..');

test('publishes every licensed-only component without introducing licensed dependencies into Core imports', () => {
    const manifest = JSON.parse(
        readFileSync(
            resolve(root, 'node_modules/@web.awesome.me/webawesome-pro/dist/custom-elements.json'),
            'utf8',
        ),
    );
    const coreTags = new Set(coreDefinitions.map((definition) => definition.tag));
    const tags = manifest.modules
        .flatMap((module: { declarations?: { tagName?: string }[] }) => module.declarations ?? [])
        .flatMap((declaration: { tagName?: string }) =>
            declaration.tagName && !coreTags.has(declaration.tagName) ? [declaration.tagName] : [],
        );
    expect(definitions.map((definition) => definition.tag).sort()).toEqual(tags.sort());
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
    for (const definition of definitions) {
        expect(pro).toHaveProperty(definition.name);
        expect(core).not.toHaveProperty(definition.name);
        for (const prefix of ['components', 'components/WebAwesome'])
            expect(pkg.exports[`./${prefix}/${definition.name}.vue`]).toBe(
                `./resources/js/components/WebAwesomePro/${definition.name}.vue`,
            );
    }
});

test('keeps licensed inputs optional and separates writable setters from native observations', () => {
    expectTypeOf<{}>().toExtend<DatePickerProps>();
    expectTypeOf<Partial<DataGridProps>>().toEqualTypeOf<DataGridProps>();
    expectTypeOf<Partial<ChartProps>>().toEqualTypeOf<ChartProps>();
    const date = { value: new Date(2026, 10, 9) } satisfies DateInputProps;
    const range = { value: { from: new Date(2026, 10, 9), to: null } } satisfies DateInputProps;
    const grid = {
        data: [{ id: 1, name: 'Ada' }],
        columns: [{ field: 'name', label: 'Name' }],
    } satisfies DataGridProps;
    // @ts-expect-error Date observations are read-only native element getters.
    const observation: DatePickerProps = { valueAsDate: new Date() };
    // @ts-expect-error A data-source callback must return the upstream response shape.
    const invalidSource: DataGridProps = { dataSource: async () => 'rows' };
    void [date, range, grid, observation, invalidSource];
});
