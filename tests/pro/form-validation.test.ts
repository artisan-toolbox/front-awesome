import { createSSRApp, h } from 'vue';
import type { Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, test } from 'vite-plus/test';
import {
    Combobox,
    DateInput,
    DatePicker,
    FileInput,
} from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';

const manualControls: { name: string; component: Component; hint: boolean }[] = [
    { name: 'Combobox', component: Combobox, hint: true },
    { name: 'DateInput', component: DateInput, hint: true },
    { name: 'DatePicker', component: DatePicker, hint: false },
    { name: 'FileInput', component: FileInput, hint: true },
];

test.each(manualControls)(
    'renders escaped manual errors on the public Pro $name wrapper',
    async ({ component, hint }) => {
        const html = await renderToString(
            createSSRApp({
                render: () => h(component, { failed: ['<b>Invalid.</b>', 'Try again.'] }),
            }),
        );
        expect(html).toContain('fa-form-invalid');
        expect(html).toContain('aria-invalid="true"');
        expect(html).toContain('aria-errormessage=');
        expect(html).toContain('&lt;b&gt;Invalid.&lt;/b&gt;');
        expect(html).toContain('Try again.');
        expect(html).not.toContain(' failed');
        expect(html.includes('slot="hint"')).toBe(hint);
        expect(html).not.toContain('slot="error"');
        expect(html.match(/role="alert"/g)).toHaveLength(1);
    },
);
