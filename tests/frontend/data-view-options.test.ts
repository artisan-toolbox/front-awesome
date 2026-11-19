import { expect, expectTypeOf, test } from 'vite-plus/test';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import {
    createFrontAwesome,
    useDataViewOptions,
    type DataViewOptions,
    type DataViewMultiSortKey,
    type DataViewSortIcon,
    type FrontAwesomeOptions,
    type FrontAwesomeServices,
    type ToastService,
    type ResolvedDataViewOptions,
} from '@artisan-toolbox/front-awesome';
import { useSortModifier } from '../../resources/js/data-view/sortModifier';

async function render(options?: DataViewOptions, install = true) {
    let captured: ResolvedDataViewOptions | undefined;
    const app = createSSRApp({
        setup() {
            captured = useDataViewOptions();
            const modifier = useSortModifier(captured.multiSortKey);
            return () => h('span', modifier.value);
        },
    });
    if (install) app.use(createFrontAwesome({ dataView: options }));
    return {
        html: await renderToString(app),
        options: captured,
        globals: app.config.globalProperties.$frontAwesome,
    };
}
test('provides SSR-safe defaults with or without installing the plugin', async () => {
    const installed = await render();
    const standalone = await render(undefined, false);
    expect(installed.html).toBe('<span>ctrl</span>');
    expect(standalone.html).toBe(installed.html);
    expect(installed.options).toEqual(standalone.options);
    expect(installed.globals.dataView).toBe(installed.options);
    expect(installed.options).toEqual({
        multiSortKey: 'auto',
        sortIcons: {
            ascending: { name: 'sort-up', family: 'classic', variant: 'solid' },
            descending: { name: 'sort-down', family: 'classic', variant: 'solid' },
            unsorted: { name: 'sort', family: 'classic', variant: 'solid' },
        },
    });
});
test('resolves icon inheritance once and isolates independent applications', async () => {
    const input = {
        multiSortKey: 'shift',
        sortIcons: {
            family: 'duotone',
            variant: 'regular',
            ascending: { name: 'arrow-up', variant: 'light' },
            descending: '↓',
            unsorted: '',
        },
    } satisfies DataViewOptions;
    const first = await render(input);
    input.sortIcons.ascending.name = 'changed';
    const second = await render({ multiSortKey: 'alt' });
    expect(first.html).toBe('<span>shift</span>');
    expect(second.html).toBe('<span>alt</span>');
    expect(first.options?.sortIcons).toEqual({
        ascending: { name: 'arrow-up', family: 'duotone', variant: 'light' },
        descending: '↓',
        unsorted: '',
    });
    expect(second.options?.sortIcons.ascending).toEqual({
        name: 'sort-up',
        family: 'classic',
        variant: 'solid',
    });
    expect(Object.isFrozen(first.options)).toBe(true);
    expect(Object.isFrozen(first.options?.sortIcons)).toBe(true);
    expect(Object.isFrozen(first.options?.sortIcons.ascending)).toBe(true);
});
test('rejects invalid runtime modifier and icon options at the plugin boundary', () => {
    const invalidModifier: DataViewOptions = {};
    Reflect.set(invalidModifier, 'multiSortKey', 'control');
    expect(() => createFrontAwesome({ dataView: invalidModifier })).toThrow('multiSortKey');
    const invalidIcons: NonNullable<DataViewOptions['sortIcons']> = {};
    Reflect.set(invalidIcons, 'ascending', 1);
    expect(() => createFrontAwesome({ dataView: { sortIcons: invalidIcons } })).toThrow(
        'sort icons',
    );
    expect(() =>
        createFrontAwesome({ dataView: { sortIcons: { ascending: { name: '' } } } }),
    ).toThrow('name');
    expect(() => createFrontAwesome({ dataView: { sortIcons: { family: '' } } })).toThrow('family');
});
test('exports typed modifier, character, and Font Awesome configuration contracts', () => {
    expectTypeOf<{ toast: ToastService }>().toMatchTypeOf<FrontAwesomeServices>();
    expectTypeOf<FrontAwesomeOptions['dataView']>().toEqualTypeOf<DataViewOptions | undefined>();
    expectTypeOf<DataViewMultiSortKey>().toEqualTypeOf<
        'auto' | 'meta' | 'ctrl' | 'shift' | 'alt'
    >();
    expectTypeOf(useDataViewOptions).returns.toEqualTypeOf<ResolvedDataViewOptions>();
    const character: DataViewSortIcon = '<b>↑</b>';
    const icon: DataViewSortIcon = { name: 'arrow-up', family: 'classic', variant: 'solid' };
    expectTypeOf<{ multiSortKey: 'control' }>().not.toMatchTypeOf<DataViewOptions>();
    expectTypeOf<{ family: 'classic' }>().not.toMatchTypeOf<DataViewSortIcon>();
    expectTypeOf<{ html: string }>().not.toMatchTypeOf<DataViewSortIcon>();
    void [character, icon];
});
