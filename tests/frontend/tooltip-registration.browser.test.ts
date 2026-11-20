import { expect, test } from 'vite-plus/test';
import { h, reactive } from 'vue';
import Tooltip from '@artisan-toolbox/front-awesome/components/WebAwesome/Tooltip.vue';
import BareBooleanTooltip from './BareBooleanTooltip.vue';
import { webAwesomeFixture, ready } from './fixtures/web-awesome';

const mount = webAwesomeFixture('wa-tooltip');

test('preserves booleans and numeric aliases before registration, after registration and through updates', async () => {
    expect(customElements.get('wa-tooltip')).toBeUndefined();
    const state = reactive({ enabled: false, delay: 25, offset: 12 });
    const { element: tooltip } = mount({
        render: () =>
            h(Tooltip, {
                disabled: state.enabled,
                open: state.enabled,
                withoutArrow: state.enabled,
                showDelay: state.delay,
                hideDelay: state.delay,
                distance: state.offset,
                skidding: state.offset,
            }),
    });
    const bare = mount(BareBooleanTooltip).element;
    const kebab = mount({
        render: () =>
            h(Tooltip, {
                'without-arrow': state.enabled,
                'show-delay': state.delay,
                'hide-delay': state.delay,
            }),
    }).element;
    const initiallyOpen = mount({
        render: () => h(Tooltip, { open: true, trigger: 'manual' }, () => 'Open help'),
    }).element;
    expect(initiallyOpen.hasAttribute('open')).toBe(true);
    expect(kebab.getAttribute('show-delay')).toBe('25');
    expect(kebab.getAttribute('hide-delay')).toBe('25');
    const defaults = mount({ render: () => h(Tooltip) }).element;
    expect(tooltip.hasAttribute('disabled')).toBe(false);
    expect(tooltip.hasAttribute('open')).toBe(false);
    expect(tooltip.hasAttribute('without-arrow')).toBe(false);
    expect(tooltip.getAttribute('show-delay')).toBe('25');
    expect(tooltip.getAttribute('hide-delay')).toBe('25');
    expect(tooltip.hasAttribute('showdelay')).toBe(false);
    expect(defaults.hasAttribute('show-delay')).toBe(false);
    expect(defaults.hasAttribute('hide-delay')).toBe(false);
    for (const name of ['disabled', 'open', 'without-arrow'])
        expect(bare.hasAttribute(name)).toBe(true);
    await ready(tooltip);
    await ready(bare);
    await ready(defaults);
    await ready(kebab);
    await ready(initiallyOpen);
    await expect.poll(() => initiallyOpen.body.hidden).toBe(false);
    expect(initiallyOpen.open).toBe(true);
    await initiallyOpen.hide();
    expect(defaults.showDelay).toBe(150);
    expect(defaults.hideDelay).toBe(0);
    expect(bare.disabled).toBe(true);
    expect(bare.withoutArrow).toBe(true);
    const after = mount({
        render: () =>
            h(Tooltip, {
                disabled: state.enabled,
                open: state.enabled,
                'without-arrow': state.enabled,
                'show-delay': state.delay,
                'hide-delay': state.delay,
                distance: state.offset,
                skidding: state.offset,
            }),
    }).element;
    for (const enabled of [true, false]) {
        state.enabled = enabled;
        state.delay = enabled ? 0 : 30;
        state.offset = enabled ? 0 : -3;
        await ready(tooltip);
        await ready(after);
        for (const element of [tooltip, after]) {
            expect(element.disabled).toBe(enabled);
            expect(element.withoutArrow).toBe(enabled);
            expect(element.hasAttribute('disabled')).toBe(enabled);
            expect(element.hasAttribute('without-arrow')).toBe(enabled);
            expect(element.showDelay).toBe(state.delay);
            expect(element.hideDelay).toBe(state.delay);
            expect(element.distance).toBe(state.offset);
            expect(element.skidding).toBe(state.offset);
            expect(element.getAttribute('show-delay')).toBe(String(state.delay));
        }
    }
});
