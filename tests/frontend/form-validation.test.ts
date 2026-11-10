import { createSSRApp, h } from 'vue';
import type { Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, test } from 'vite-plus/test';
import { useForm } from '@inertiajs/vue3';
import {
    Checkbox,
    ColorPicker,
    Input,
    KnownDate,
    NumberInput,
    OtpInput,
    RadioGroup,
    Rating,
    Select,
    Slider,
    Switch,
    TagInput,
    Textarea,
    TimeInput,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
import FormFieldFrame from '../../resources/js/WebAwesome/FormFieldFrame.vue';
import BareFailureInput from './BareFailureInput.vue';

const manualControls: { name: string; component: Component; hint: boolean }[] = [
    { name: 'Checkbox', component: Checkbox, hint: true },
    { name: 'ColorPicker', component: ColorPicker, hint: true },
    { name: 'KnownDate', component: KnownDate, hint: true },
    { name: 'NumberInput', component: NumberInput, hint: true },
    { name: 'OtpInput', component: OtpInput, hint: true },
    { name: 'RadioGroup', component: RadioGroup, hint: true },
    { name: 'Rating', component: Rating, hint: false },
    { name: 'Select', component: Select, hint: true },
    { name: 'Slider', component: Slider, hint: true },
    { name: 'Switch', component: Switch, hint: true },
    { name: 'TagInput', component: TagInput, hint: true },
    { name: 'Textarea', component: Textarea, hint: true },
    { name: 'TimeInput', component: TimeInput, hint: true },
];

test.each(manualControls)(
    'renders escaped manual errors on the public $name wrapper',
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
        expect(html.match(/role="alert"/g)).toHaveLength(1);
    },
);

test('casts a bare failed attribute as boolean failure without replacing the hint', async () => {
    const html = await renderToString(createSSRApp(BareFailureInput));
    expect(html).toContain('fa-input-invalid');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('Caller hint');
    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain(' failed');
});

test('keeps a stable inert contents frame when presentation is inactive', async () => {
    const html = await renderToString(
        createSSRApp({
            render: () =>
                h(
                    FormFieldFrame,
                    {
                        active: false,
                        invalid: false,
                        errors: [],
                        messageId: 'rating-error',
                        layout: 'intrinsic',
                    },
                    () => h('wa-rating', { label: 'Rating' }),
                ),
        }),
    );
    expect(html).toContain('<wa-rating label="Rating">');
    expect(html).toContain('class="fa-form-field-frame-inactive"');
    expect(html).not.toContain('<div');
    expect(html).not.toContain('role="group"');
});

test('groups fallback errors outside the native control and escapes message content', async () => {
    const html = await renderToString(
        createSSRApp({
            render: () =>
                h(
                    FormFieldFrame,
                    {
                        active: true,
                        invalid: true,
                        errors: ['<b>Choose a rating.</b>', 'Try again.'],
                        messageId: 'rating-error',
                        layout: 'intrinsic',
                        label: 'Product rating',
                    },
                    () => h('wa-rating', { label: 'Rating' }),
                ),
        }),
    );
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Product rating"');
    expect(html).toContain('aria-describedby="rating-error"');
    expect(html).toContain('id="rating-error"');
    expect(html).toContain('&lt;b&gt;Choose a rating.&lt;/b&gt;');
    expect(html).not.toContain('<b>');
    expect(html.indexOf('</wa-rating>')).toBeLessThan(html.indexOf('role="alert"'));
    expect(html.match(/role="alert"/g)).toHaveLength(1);
});

test('keeps caller Input hints for boolean failures and renders message failures instead', async () => {
    for (const failed of [true, false, 'Choose a name.', ['Choose a name.', 'Try again.']]) {
        const html = await renderToString(
            createSSRApp({
                render: () =>
                    h(
                        Input,
                        {
                            modelValue: '',
                            'onUpdate:modelValue': () => {},
                            failed,
                            hint: 'Your public name.',
                        },
                        { hint: () => h('span', 'A useful hint.') },
                    ),
            }),
        );
        expect(html.includes('fa-input-invalid')).toBe(failed !== false);
        expect(html.includes('A useful hint.')).toBe(typeof failed === 'boolean');
        expect(html.includes('Your public name.')).toBe(typeof failed === 'boolean');
        expect(html.includes('role="alert"')).toBe(typeof failed !== 'boolean');
        expect(html).not.toContain(' failed');
    }
});

test('merges manual and server Input errors through the public field alias', async () => {
    const form = useForm({ name: '' });
    form.setError('name', ['Required.', '<b>Use a name.</b>']);
    const html = await renderToString(
        createSSRApp({
            render: () =>
                h(Input<{ name: string }>, {
                    form,
                    field: 'name',
                    failed: ['Required.', 'Try again.'],
                    'aria-errormessage': 'caller-error',
                }),
        }),
    );
    expect(html.match(/Required\./g)).toHaveLength(1);
    expect(html).toContain('&lt;b&gt;Use a name.&lt;/b&gt;');
    expect(html).toContain('Try again.');
    expect(html).toMatch(/aria-errormessage="caller-error fa-input-error-[^"]+"/);
    expect(html).not.toContain('field="name"');
    expect(form.errors.name).toEqual(['Required.', '<b>Use a name.</b>']);
});

test('does not let false manual failure hide a server Input error', async () => {
    const form = useForm({ name: '' });
    form.setError('name', 'Required.');
    const html = await renderToString(
        createSSRApp({
            render: () => h(Input<{ name: string }>, { form, field: 'name', failed: false }),
        }),
    );
    expect(html).toContain('fa-input-invalid');
    expect(html).toContain('Required.');
});
