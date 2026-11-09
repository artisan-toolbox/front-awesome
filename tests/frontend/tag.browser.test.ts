import { expect, onTestFinished, test } from 'vite-plus/test';
import { createApp, h, nextTick, reactive } from 'vue';
import type { Component } from 'vue';
import type WaTag from '@awesome.me/webawesome/dist/components/tag/tag.js';
import Tag from '@artisan-toolbox/front-awesome/components/WebAwesome/Tag.vue';
import BareBooleanTag from './BareBooleanTag.vue';

function mount(component: Component) {
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp(component);
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    const tag = container.querySelector<WaTag>('wa-tag');
    if (!tag) throw new Error('Expected the public Tag component.');
    return { tag, container };
}

async function ready(tag: WaTag) {
    await customElements.whenDefined('wa-tag');
    await nextTick();
    await tag.updateComplete;
}

test('preserves bare and bound boolean aliases before and after registration and live updates', async () => {
    expect(customElements.get('wa-tag')).toBeUndefined();
    const state = reactive({ enabled: false });
    const { tag } = mount({
        render: () => h(Tag, { pill: state.enabled, withRemove: state.enabled }),
    });
    const bare = mount(BareBooleanTag).tag;
    expect(tag.hasAttribute('pill')).toBe(false);
    expect(tag.hasAttribute('with-remove')).toBe(false);
    expect(bare.hasAttribute('pill')).toBe(true);
    expect(bare.hasAttribute('with-remove')).toBe(true);
    await ready(tag);
    await ready(bare);
    expect(tag.variant).toBe('neutral');
    expect(tag.appearance).toBe('filled-outlined');
    expect(tag.size).toBe('m');
    expect(bare.pill).toBe(true);
    expect(bare.withRemove).toBe(true);
    const after = mount({
        render: () => h(Tag, { pill: state.enabled, 'with-remove': state.enabled }),
    }).tag;
    for (const enabled of [true, false]) {
        state.enabled = enabled;
        await ready(tag);
        await ready(after);
        for (const element of [tag, after]) {
            expect(element.pill).toBe(enabled);
            expect(element.withRemove).toBe(enabled);
            expect(element.hasAttribute('pill')).toBe(enabled);
            expect(element.hasAttribute('with-remove')).toBe(enabled);
        }
    }
});

test('forwards original remove events once and leaves removal to application state', async () => {
    const state = reactive({ visible: true });
    const forwarded: Event[] = [];
    const observed: Event[] = [];
    const { tag, container } = mount({
        render: () =>
            state.visible
                ? h(
                      Tag,
                      {
                          withRemove: true,
                          variant: 'success',
                          size: 's',
                          appearance: 'outlined',
                          onWaRemove: (event: Event) => {
                              forwarded.push(event);
                              event.preventDefault();
                          },
                      },
                      () => [h('strong', 'Ready')],
                  )
                : null,
    });
    tag.addEventListener('wa-remove', (event) => observed.push(event));
    await ready(tag);
    expect(tag.querySelector('strong')?.textContent).toBe('Ready');
    expect(tag.className).toBe('');
    expect(tag.getAttribute('style')).toBeNull();
    expect(tag.variant).toBe('success');
    expect(tag.size).toBe('s');
    expect(tag.appearance).toBe('outlined');
    const remove = tag.shadowRoot?.querySelector<HTMLElement>('[part="remove-button"]');
    if (!remove) throw new Error('Expected the native remove button.');
    remove.click();
    expect(forwarded).toHaveLength(1);
    expect(observed).toHaveLength(1);
    expect(forwarded[0]).toBe(observed[0]);
    expect(forwarded[0]?.target).toBe(tag);
    expect(container.querySelector('wa-tag')).toBe(tag);
    state.visible = false;
    await nextTick();
    expect(container.querySelector('wa-tag')).toBeNull();
});
