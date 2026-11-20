import { expect, test } from 'vite-plus/test';
import { h, reactive } from 'vue';
import Tag from '@artisan-toolbox/front-awesome/components/WebAwesome/Tag.vue';
import BareBooleanTag from './BareBooleanTag.vue';
import { webAwesomeFixture, ready } from './fixtures/web-awesome';

const mount = webAwesomeFixture('wa-tag');

test('preserves bare and bound boolean aliases before and after registration and live updates', async () => {
    expect(customElements.get('wa-tag')).toBeUndefined();
    const state = reactive({ enabled: false });
    const { element: tag } = mount({
        render: () => h(Tag, { pill: state.enabled, withRemove: state.enabled }),
    });
    const bare = mount(BareBooleanTag).element;
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
    }).element;
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
