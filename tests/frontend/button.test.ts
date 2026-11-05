import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, test } from 'vite-plus/test';
import Button from '@artisan-toolbox/front-awesome/components/Button.vue';
import { ButtonGroup } from '@artisan-toolbox/front-awesome/components';

test('renders a Web Awesome button with the app slot and attributes during SSR', async () => {
    const app = createSSRApp({
        render: () => h(Button, { variant: 'brand' }, () => 'Save changes'),
    });

    const html = await renderToString(app);

    expect(html).toContain('<wa-button class="inline-flex" variant="brand">');
    expect(html).toContain('Save changes');
});

test('renders the group and its slotted button with their bound attributes', async () => {
    const app = createSSRApp({
        render: () =>
            h(ButtonGroup, { label: 'Actions', orientation: 'vertical' }, () =>
                h(
                    Button,
                    { 'aria-label': 'Save', 'with-caret': true, type: 'button' },
                    () => 'Save changes',
                ),
            ),
    });

    const html = await renderToString(app);

    expect(html).toContain('<wa-button-group label="Actions" orientation="vertical">');
    expect(html).toContain('aria-label="Save" with-caret="true" type="button"');
    expect(html).toContain('Save changes');
});

test('resolves the Mosaicast client supplied by Composer', async () => {
    const { mosaicast } = await import('@artisan-toolbox/mosaicast');

    expect(mosaicast).toBeTypeOf('function');
});
