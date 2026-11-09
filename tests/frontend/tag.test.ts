import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, test } from 'vite-plus/test';
import Tag from '@artisan-toolbox/front-awesome/components/WebAwesome/Tag.vue';
import LegacyTag from '@artisan-toolbox/front-awesome/components/Tag.vue';
import { Tag as ComponentTag } from '@artisan-toolbox/front-awesome/components';
import { Tag as WebAwesomeTag } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import BareBooleanTag from './BareBooleanTag.vue';

test('exports the same Tag through every supported component path', () => {
    expect(LegacyTag).toBe(Tag);
    expect(ComponentTag).toBe(Tag);
    expect(WebAwesomeTag).toBe(Tag);
});

test('renders one unstyled tag and its default content without browser registration', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(Tag, null, () => 'Ready') }));
    expect(html).toBe('<wa-tag><!--[-->Ready<!--]--></wa-tag>');
});

test('forwards native options, consumer attributes and boolean aliases during SSR', async () => {
    expect(await renderToString(createSSRApp(BareBooleanTag))).toBe(
        '<wa-tag pill with-remove><!--[--><!--]--></wa-tag>',
    );
    for (const props of [
        { pill: true, withRemove: false },
        { pill: true, 'with-remove': false },
    ]) {
        const html = await renderToString(createSSRApp({ render: () => h(Tag, props) }));
        expect(html).toContain(' pill');
        expect(html).not.toContain('with-remove');
    }
    const html = await renderToString(
        createSSRApp({
            render: () =>
                h(Tag, {
                    variant: 'success',
                    appearance: 'outlined',
                    size: 's',
                    pill: false,
                    withRemove: true,
                    slot: 'status',
                    class: 'caller-tag',
                    style: { gap: '2px' },
                    'aria-label': 'Ready',
                    'data-status': 'ready',
                }),
        }),
    );
    for (const attribute of [
        'variant="success"',
        'appearance="outlined"',
        'size="s"',
        'with-remove',
        'slot="status"',
        'class="caller-tag"',
        'gap:2px',
        'aria-label="Ready"',
        'data-status="ready"',
    ])
        expect(html).toContain(attribute);
    expect(html).not.toContain('pill');
});
