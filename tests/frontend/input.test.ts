import { createSSRApp, h, reactive } from 'vue';
import type { Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, test } from 'vite-plus/test';
import { useForm } from '@inertiajs/vue3';
import { useFormBridge } from '@artisan-toolbox/front-awesome';
import { Input } from '@artisan-toolbox/front-awesome/components/WebAwesome';

const listener = () => {};
const uncheckedInput: Component = Input;

function bridge(form: object, fieldName: string) {
    const props = reactive({ form, fieldName });
    return { props, ...useFormBridge(props, { emitValue: listener, binding: () => ({}) }) };
}

test('reads and writes live dotted Inertia data through replacement and reset', () => {
    const form = useForm({ profile: { name: 'Ada' }, users: [{ name: 'Grace' }] });
    const field = bridge(form, 'profile.name');
    expect(field.value.value).toBe('Ada');
    field.value.value = 'Lin';
    expect(form.profile.name).toBe('Lin');
    form.profile = { name: 'Mary' };
    expect(field.value.value).toBe('Mary');
    form.reset();
    expect(field.value.value).toBe('Ada');
    field.props.fieldName = 'users.0.name';
    field.value.value = 'Katherine';
    expect(form.users[0].name).toBe('Katherine');
    field.props.form = useForm({ profile: { name: 'Other' }, users: [{ name: 'New' }] });
    expect(field.value.value).toBe('New');
});

test('reads all flat error messages and leaves their lifecycle to Inertia', () => {
    const form = useForm({ users: [{ name: '' }] });
    const field = bridge(form, 'users.0.name');
    form.setError('users.0.name', ['Required', '<b>Use a name</b>']);
    expect(field.errors.value).toEqual(['Required', '<b>Use a name</b>']);
    expect(field.invalid.value).toBe(true);
    field.value.value = 'Ada';
    expect(field.errors.value).toHaveLength(2);
    form.clearErrors();
    expect(field.invalid.value).toBe(false);
});

test.each([
    '',
    'profile..name',
    '__proto__.name',
    'constructor.name',
    'errors',
    'processing',
    'reset',
    'profile',
    'users.01.name',
    'users.length',
    'profile.missing',
])('rejects missing, unsafe, non-data, or non-text fields (%s)', (path) => {
    const form = useForm({ profile: { name: 'Ada' }, users: [{ name: 'Grace' }] });
    expect(() => bridge(form, path).value.value).toThrow();
});

test('accepts an explicit undefined writable model without inventing another source', () => {
    const props = reactive({ modelValue: undefined as string | null | undefined });
    const updates: unknown[] = [];
    const field = useFormBridge(props, {
        emitValue: (next) => updates.push(next),
        binding: () => ({ modelValue: undefined, 'onUpdate:modelValue': listener }),
    });
    expect(field.value.value).toBeUndefined();
    field.value.value = 'Ada';
    expect(updates).toEqual(['Ada']);
    props.modelValue = null;
    expect(field.value.value).toBeNull();
});

test('rejects ambiguous, absent, incomplete, or read-only bindings during SSR', async () => {
    const form = useForm({ name: 'Ada' });
    for (const props of [
        {},
        { modelValue: 'Ada' },
        { form },
        { fieldName: 'name' },
        { form, fieldName: 'name', modelValue: undefined, 'onUpdate:modelValue': listener },
        { modelValue: 'Ada', value: 'other', 'onUpdate:modelValue': listener },
        { modelValue: 'Ada', modelModifiers: { number: true }, 'onUpdate:modelValue': listener },
    ]) {
        const app = createSSRApp({ render: () => h(uncheckedInput, props) });
        app.config.warnHandler = listener;
        await expect(renderToString(app)).rejects.toThrow(/Front Awesome Input/);
    }
});

test('renders SSR attributes, native form association, named slots, and escaped errors', async () => {
    const form = useForm({ name: 'Ada' });
    form.setError('name', ['<b>Invalid</b>', 'Try again']);
    const html = await renderToString(
        createSSRApp({
            render: () =>
                h(
                    Input<{ name: string }>,
                    {
                        form,
                        fieldName: 'name',
                        required: false,
                        withClear: true,
                        spellcheck: false,
                        autocorrect: false,
                        hint: 'Caller hint',
                    },
                    { start: () => h('span', '+'), hint: () => 'Caller hint slot' },
                ),
        }),
    );
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('&lt;b&gt;Invalid&lt;/b&gt;');
    expect(html).toContain('Try again');
    expect(html).not.toContain('Caller hint');
    expect(html).not.toContain(' required');
    expect(html).toContain(' with-clear');
    expect(html).toContain('spellcheck="false"');
    expect(html).toContain('autocorrect="off"');
    expect(html).toContain('slot="start"');
    expect(html).not.toContain('[object Object]');
    const modelHtml = await renderToString(
        createSSRApp({
            render: () =>
                h(Input, {
                    modelValue: undefined,
                    'onUpdate:modelValue': listener,
                    form: 'profile',
                }),
        }),
    );
    expect(modelHtml).toContain('form="profile"');
});

test('keeps validation hints authoritative when a caller supplies a native hint through another Vue slot', async () => {
    const form = useForm({ name: '' });
    form.setError('name', 'Name is required.');
    const html = await renderToString(
        createSSRApp({
            render: () =>
                h(
                    Input<{ name: string }>,
                    { form, fieldName: 'name' },
                    {
                        start: () =>
                            h('span', { slot: 'hint' }, 'Caller hint must not hide the error.'),
                    },
                ),
        }),
    );
    expect(html).toContain('Name is required.');
    expect(html).not.toContain('Caller hint must not hide the error.');
    expect(html).toContain('role="alert"');
});
