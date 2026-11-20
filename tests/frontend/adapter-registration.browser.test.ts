import { expect, test } from 'vite-plus/test';
import { h, reactive } from 'vue';
import type WaCheckbox from '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';
import Checkbox from '@artisan-toolbox/front-awesome/components/WebAwesome/Checkbox.vue';
import { mountVue as mount, readyAfterFrame as ready } from './fixtures/web-awesome';

test('initializes native checkbox defaults before registration and respects optional presence booleans', async () => {
    expect(customElements.get('wa-checkbox')).toBeUndefined();
    const state = reactive({ enabled: false });
    const bareAttributes: Record<string, unknown> = { checked: '' };
    const { container } = mount({
        render: () =>
            h('div', [
                h(Checkbox, { ...bareAttributes, disabled: state.enabled, 'data-kind': 'bare' }),
                h(Checkbox, { checked: false, required: state.enabled, 'data-kind': 'false' }),
                h(Checkbox, { 'data-kind': 'absent' }),
            ]),
    });
    const [bare, bound, absent] = [...container.querySelectorAll<WaCheckbox>('wa-checkbox')];
    if (!bare || !bound || !absent) throw new Error('Expected three checkboxes.');
    expect(bare.hasAttribute('checked')).toBe(true);
    expect(bound.hasAttribute('checked')).toBe(false);
    expect(absent.hasAttribute('checked')).toBe(false);
    expect(Object.hasOwn(bare, 'checked')).toBe(false);
    await Promise.all([ready(bare), ready(bound), ready(absent)]);
    expect(bare.checked).toBe(true);
    expect(bare.defaultChecked).toBe(true);
    expect(bound.checked).toBe(false);
    expect(absent.checked).toBe(false);
    expect(absent.size).toBe('m');
    for (const enabled of [true, false]) {
        state.enabled = enabled;
        await ready(bare);
        await ready(bound);
        expect(bare.disabled).toBe(enabled);
        expect(bound.required).toBe(enabled);
    }
});
