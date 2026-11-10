import { expect, onTestFinished, test } from 'vite-plus/test';
import { computed, createApp, h, nextTick, shallowReactive } from 'vue';
import {
    Card,
    Checkbox,
    Input,
    Popover,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';

test('refreshes projected parent slots without remounting native child controls', async () => {
    const state = shallowReactive({ prefix: '/docs' });
    const items = computed(() => [{ id: 'forms', href: `${state.prefix}/forms` }]);
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp({
        render: () =>
            h(
                'div',
                items.value.map((item) =>
                    h(Card, { key: item.id }, () =>
                        h(Popover, { id: 'slot-update-popover' }, () => [
                            h('a', { href: item.href }, 'Forms'),
                            h(Checkbox, { checked: false }, () => 'Keep native state'),
                        ]),
                    ),
                ),
            ),
    });
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    await Promise.all(
        ['wa-card', 'wa-popover', 'wa-checkbox'].map((tag) => customElements.whenDefined(tag)),
    );
    await nextTick();
    await new Promise(requestAnimationFrame);
    const checkbox = container.querySelector<HTMLElement>('wa-checkbox');
    const link = container.querySelector('a');
    if (!checkbox || !link) throw new Error('Expected projected native controls.');
    checkbox.click();
    await nextTick();
    expect(Reflect.get(checkbox, 'checked')).toBe(true);
    state.prefix = '/reference';
    await nextTick();
    await expect
        .poll(() => container.querySelector('a')?.getAttribute('href'))
        .toBe('/reference/forms');
    expect(container.querySelector('wa-checkbox')).toBe(checkbox);
    expect(container.querySelector('a')).toBe(link);
    expect(Reflect.get(checkbox, 'checked')).toBe(true);
});

test('Input refreshes projected parent slot closures while preserving the native host and edited model', async () => {
    const state = shallowReactive({ prefix: '/docs', value: 'Initial' });
    const items = computed(() => [{ href: `${state.prefix}/input-help` }]);
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp({
        render: () =>
            h(
                'div',
                items.value.map((item) =>
                    h(
                        Input,
                        {
                            modelValue: state.value,
                            'onUpdate:modelValue': (value: string | null | undefined) => {
                                state.value = value ?? '';
                            },
                        },
                        { hint: () => h('a', { href: item.href }, 'Help') },
                    ),
                ),
            ),
    });
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    await customElements.whenDefined('wa-input');
    await nextTick();
    await new Promise(requestAnimationFrame);
    const input = container.querySelector<HTMLElement>('wa-input');
    const link = container.querySelector('a');
    if (!input || !link) throw new Error('Expected native input with projected hint.');
    Reflect.set(input, 'value', 'Edited');
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await nextTick();
    expect(state.value).toBe('Edited');
    state.prefix = '/reference';
    await nextTick();
    await expect
        .poll(() => container.querySelector('a')?.getAttribute('href'))
        .toBe('/reference/input-help');
    expect(container.querySelector('wa-input')).toBe(input);
    expect(container.querySelector('a')).toBe(link);
    expect(Reflect.get(input, 'value')).toBe('Edited');
    expect(state.value).toBe('Edited');
});
