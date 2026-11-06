import { expect, onTestFinished, test } from 'vite-plus/test';
import { createApp, h, nextTick, reactive } from 'vue';
import type WaButton from '@awesome.me/webawesome/dist/components/button/button.js';
import Button from '@artisan-toolbox/front-awesome/components/Button.vue';
import BareBooleanButton from './BareBooleanButton.vue';

test('preserves boolean bindings before and after Web Awesome registers the button', async () => {
    expect(customElements.get('wa-button')).toBeUndefined();
    const flags = reactive({ enabled: false });
    let clicks = 0;
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp({
        render: () => [
            h(
                Button,
                {
                    disabled: flags.enabled,
                    loading: flags.enabled,
                    pill: flags.enabled,
                    'with-caret': flags.enabled,
                    'with-start': flags.enabled,
                    'with-end': flags.enabled,
                    formnovalidate: flags.enabled,
                    variant: 'brand',
                    'aria-label': 'Save changes',
                    onClick: () => clicks++,
                },
                () => [h('span', { slot: 'start' }, '+'), 'Save changes'],
            ),
            h(BareBooleanButton),
        ],
    });
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    const button = container.querySelector<WaButton>('wa-button');
    const busy = container.querySelector<WaButton>('wa-button:last-of-type');
    if (!button || !busy) {
        throw new Error('Expected both public Button components to render.');
    }
    const attributes = [
        'disabled',
        'loading',
        'pill',
        'with-caret',
        'with-start',
        'with-end',
        'formnovalidate',
    ];
    for (const attribute of attributes) {
        expect(button.hasAttribute(attribute)).toBe(false);
    }
    expect(busy.getAttribute('loading')).toBe('');
    expect(busy.getAttribute('disabled')).toBe('');

    await customElements.whenDefined('wa-button');
    await button.updateComplete;
    await busy.updateComplete;
    expect(button.loading).toBe(false);
    expect(button.disabled).toBe(false);
    expect(button.shadowRoot?.querySelector('button')?.disabled).toBe(false);
    expect(button.shadowRoot?.querySelector('[part="spinner"]')).toBeNull();
    expect(button.getAttribute('variant')).toBe('brand');
    expect(button.getAttribute('aria-label')).toBe('Save changes');
    expect(button.querySelector('[slot="start"]')?.textContent).toBe('+');
    button.click();
    expect(clicks).toBe(1);
    expect(busy.loading).toBe(true);
    expect(busy.disabled).toBe(true);
    expect(busy.pill).toBe(true);

    for (const enabled of [true, false]) {
        flags.enabled = enabled;
        await nextTick();
        await button.updateComplete;
        for (const attribute of attributes) {
            expect(button.hasAttribute(attribute)).toBe(enabled);
        }
        expect(button.disabled).toBe(enabled);
        expect(button.loading).toBe(enabled);
        expect(button.pill).toBe(enabled);
        expect(button.withCaret).toBe(enabled);
        expect(button.withStart).toBe(enabled);
        expect(button.withEnd).toBe(enabled);
        expect(button.formNoValidate).toBe(enabled);
        expect(button.shadowRoot?.querySelector('button')?.disabled).toBe(enabled);
    }

    const linkContainer = document.createElement('div');
    document.body.append(linkContainer);
    const linkApp = createApp({
        render: () =>
            h(Button, { href: '/account', loading: false, disabled: false }, () => 'Account'),
    });
    linkApp.mount(linkContainer);
    onTestFinished(() => {
        linkApp.unmount();
        linkContainer.remove();
    });
    const link = linkContainer.querySelector<WaButton>('wa-button');
    if (!link) {
        throw new Error('Expected the public Button component to render a link.');
    }
    await link.updateComplete;
    expect(link.loading).toBe(false);
    expect(link.disabled).toBe(false);
    expect(link.shadowRoot?.querySelector('a')?.getAttribute('href')).toBe('/account');
});
