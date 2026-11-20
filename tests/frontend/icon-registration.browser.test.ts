import { expect, test } from 'vite-plus/test';
import { h, reactive } from 'vue';
import Icon from '@artisan-toolbox/front-awesome/components/WebAwesome/Icon.vue';
import BareBooleanIcon from './BareBooleanIcon.vue';
import { webAwesomeFixture, ready } from './fixtures/web-awesome';

const mount = webAwesomeFixture('wa-icon');

test('preserves boolean presence and numeric rotation before registration and through live updates', async () => {
    expect(customElements.get('wa-icon')).toBeUndefined();
    const state = reactive({ enabled: false, rotate: 45 });
    const { element: icon } = mount({
        render: () =>
            h(Icon, {
                autoWidth: state.enabled,
                swapOpacity: state.enabled,
                rotate: state.rotate,
            }),
    });
    const bare = mount(BareBooleanIcon).element;
    expect(icon.hasAttribute('auto-width')).toBe(false);
    expect(icon.hasAttribute('swap-opacity')).toBe(false);
    expect(icon.getAttribute('rotate')).toBe('45');
    expect(bare.hasAttribute('auto-width')).toBe(true);
    expect(bare.hasAttribute('swap-opacity')).toBe(true);
    await ready(icon);
    await ready(bare);
    expect(icon.autoWidth).toBe(false);
    expect(icon.swapOpacity).toBe(false);
    expect(icon.rotate).toBe(45);
    expect(bare.autoWidth).toBe(true);
    expect(bare.swapOpacity).toBe(true);

    const after = mount({
        render: () => h(Icon, { 'auto-width': state.enabled, 'swap-opacity': state.enabled }),
    }).element;
    await ready(after);
    for (const enabled of [true, false]) {
        state.enabled = enabled;
        state.rotate = enabled ? 90 : 0;
        await ready(icon);
        await ready(after);
        for (const element of [icon, after]) {
            expect(element.autoWidth).toBe(enabled);
            expect(element.swapOpacity).toBe(enabled);
            expect(element.hasAttribute('auto-width')).toBe(enabled);
            expect(element.hasAttribute('swap-opacity')).toBe(enabled);
        }
        expect(icon.rotate).toBe(state.rotate);
        expect(icon.getAttribute('rotate')).toBe(String(state.rotate));
    }
});
