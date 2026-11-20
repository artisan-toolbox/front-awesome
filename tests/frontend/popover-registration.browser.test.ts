import { expect, test } from 'vite-plus/test';
import { h, reactive } from 'vue';
import Popover from '@artisan-toolbox/front-awesome/components/WebAwesome/Popover.vue';
import BareBooleanPopover from './BareBooleanPopover.vue';
import { webAwesomeFixture, ready, expectPopoverOpen as shown } from './fixtures/web-awesome';

const mount = webAwesomeFixture('wa-popover');

test('preserves presence booleans and numeric offsets before registration, after registration and during updates', async () => {
    expect(customElements.get('wa-popover')).toBeUndefined();
    const state = reactive({ enabled: false, offset: 12 });
    const { element: popover } = mount({
        render: () =>
            h(Popover, {
                open: state.enabled,
                withoutArrow: state.enabled,
                distance: state.offset,
                skidding: state.offset,
            }),
    });
    const bare = mount(BareBooleanPopover).element;
    const kebab = mount({ render: () => h(Popover, { 'without-arrow': state.enabled }) }).element;
    const defaults = mount({ render: () => h(Popover) }).element;
    expect(popover.hasAttribute('open')).toBe(false);
    expect(popover.hasAttribute('without-arrow')).toBe(false);
    expect(bare.hasAttribute('open')).toBe(true);
    expect(bare.hasAttribute('without-arrow')).toBe(true);
    expect(defaults.hasAttribute('distance')).toBe(false);
    await ready(popover);
    await ready(bare);
    await ready(kebab);
    await ready(defaults);
    expect(bare.open).toBe(true);
    expect(bare.withoutArrow).toBe(true);
    expect(defaults.distance).toBe(8);
    expect(defaults.skidding).toBe(0);
    const after = mount({
        render: () =>
            h(Popover, {
                'without-arrow': state.enabled,
                distance: state.offset,
                skidding: state.offset,
            }),
    }).element;
    for (const enabled of [true, false]) {
        state.enabled = enabled;
        state.offset = enabled ? 0 : -3;
        await ready(popover);
        await ready(after);
        await ready(kebab);
        for (const element of [popover, after]) {
            if (element === popover) await shown(element, enabled);
            expect(element.withoutArrow).toBe(enabled);
            expect(element.hasAttribute('without-arrow')).toBe(enabled);
            expect(element.distance).toBe(state.offset);
            expect(element.skidding).toBe(state.offset);
            expect(element.hasAttribute('withoutarrow')).toBe(false);
        }
        expect(kebab.withoutArrow).toBe(enabled);
    }
});
