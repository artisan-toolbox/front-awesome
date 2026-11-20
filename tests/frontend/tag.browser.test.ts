import { expect, test } from 'vite-plus/test';
import { h, nextTick, reactive } from 'vue';
import Tag from '@artisan-toolbox/front-awesome/components/WebAwesome/Tag.vue';
import { webAwesomeFixture, ready } from './fixtures/web-awesome';

const mount = webAwesomeFixture('wa-tag');

test('forwards original remove events once and leaves removal to application state', async () => {
    const state = reactive({ visible: true });
    const forwarded: Event[] = [];
    const observed: Event[] = [];
    const { element: tag, container } = mount({
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
