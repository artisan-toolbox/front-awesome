import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, expectTypeOf, test } from 'vite-plus/test';
import Popover from '@artisan-toolbox/front-awesome/components/WebAwesome/Popover.vue';
import LegacyPopover from '@artisan-toolbox/front-awesome/components/Popover.vue';
import { Popover as ComponentPopover } from '@artisan-toolbox/front-awesome/components';
import { Popover as WebAwesomePopover } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import type { PopoverProps } from '@artisan-toolbox/front-awesome';
import type { WaPopoverProps } from '@awesome.me/webawesome/dist/custom-elements-jsx.d.ts';
import BareBooleanPopover from './BareBooleanPopover.vue';

test('exports the same Popover through every supported component path', () => {
    expect(LegacyPopover).toBe(Popover);
    expect(ComponentPopover).toBe(Popover);
    expect(WebAwesomePopover).toBe(Popover);
});

test('renders an unstyled host and interactive default-slot content during SSR', async () => {
    const html = await renderToString(
        createSSRApp({ render: () => h(Popover, null, () => h('a', { href: '#guide' }, 'Guide')) }),
    );
    expect(html).toBe('<wa-popover><!--[--><a href="#guide">Guide</a><!--]--></wa-popover>');
});

test('preserves bare and bound booleans and forwards public native attributes during SSR', async () => {
    expect(await renderToString(createSSRApp(BareBooleanPopover))).toBe(
        '<wa-popover open without-arrow><!--[--><!--]--></wa-popover>',
    );
    for (const aliases of [{ withoutArrow: true }, { 'without-arrow': true }]) {
        const html = await renderToString(
            createSSRApp({ render: () => h(Popover, { open: false, ...aliases }) }),
        );
        expect(html).toContain('without-arrow');
        expect(html).not.toContain(' open');
    }
    const html = await renderToString(
        createSSRApp({
            render: () =>
                h(Popover, {
                    id: 'help',
                    for: 'help-button',
                    placement: 'bottom-start',
                    distance: 0,
                    skidding: -3,
                    open: false,
                    withoutArrow: false,
                    slot: 'help',
                    class: 'caller-panel',
                    style: { '--max-width': '15rem' },
                    'aria-label': 'Help',
                }),
        }),
    );
    for (const attribute of [
        'id="help"',
        'for="help-button"',
        'placement="bottom-start"',
        'distance="0"',
        'skidding="-3"',
        'slot="help"',
        'class="caller-panel"',
        '--max-width:15rem',
        'aria-label="Help"',
    ])
        expect(html).toContain(attribute);
    expect(html).not.toContain(' open');
    expect(html).not.toContain('without-arrow');
});

test('derives public props and event types while excluding upstream implementation fields', () => {
    type Instance = InstanceType<typeof Popover>;
    type Attributes = Instance['$props'];
    expectTypeOf<
        import('@artisan-toolbox/front-awesome/components').PopoverProps
    >().toEqualTypeOf<PopoverProps>();
    expectTypeOf<
        import('@artisan-toolbox/front-awesome/components/WebAwesome').PopoverProps
    >().toEqualTypeOf<PopoverProps>();
    expectTypeOf<Attributes['placement']>().toEqualTypeOf<WaPopoverProps['placement']>();
    expectTypeOf<Attributes['for']>().toEqualTypeOf<WaPopoverProps['for']>();
    expectTypeOf<Attributes['distance']>().toEqualTypeOf<WaPopoverProps['distance']>();
    expectTypeOf<Attributes['skidding']>().toEqualTypeOf<WaPopoverProps['skidding']>();
    expectTypeOf<Attributes['without-arrow']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<Attributes['onWaShow']>().toEqualTypeOf<WaPopoverProps['onwa-show']>();
    expectTypeOf<Attributes['onWaAfterShow']>().toEqualTypeOf<WaPopoverProps['onwa-after-show']>();
    expectTypeOf<Attributes['onWaHide']>().toEqualTypeOf<WaPopoverProps['onwa-hide']>();
    expectTypeOf<Attributes['onWaAfterHide']>().toEqualTypeOf<WaPopoverProps['onwa-after-hide']>();
    expectTypeOf<
        Extract<
            keyof Attributes,
            | 'did-ssr'
            | 'didSSR'
            | 'internals'
            | 'initialReflectedProperties'
            | 'dialog'
            | 'body'
            | 'popup'
            | 'anchor'
            | 'onwa-show'
            | 'onwa-after-show'
            | 'onwa-hide'
            | 'onwa-after-hide'
        >
    >().toBeNever();
    expectTypeOf<Extract<keyof Instance, 'show' | 'hide'>>().toBeNever();
    const props = {
        for: 'help',
        placement: 'bottom-start',
        distance: 0,
        skidding: -3,
        onWaHide: (event: Event) => event.preventDefault(),
    } satisfies PopoverProps;
    // @ts-expect-error Placement retains the upstream union.
    const placement: PopoverProps = { placement: 'center' };
    // @ts-expect-error Offsets are numeric.
    const distance: PopoverProps = { distance: '8' };
    // @ts-expect-error Native events do not promise detail payloads.
    const event: PopoverProps = { onWaHide: (_event: CustomEvent<string>) => {} };
    void [props, placement, distance, event];
});
