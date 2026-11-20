import { expect, onTestFinished, test } from 'vite-plus/test';
import { page, userEvent } from 'vitest/browser';
import { createApp, h, nextTick, reactive } from 'vue';
import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js';
import { useForm } from '@inertiajs/vue3';
import Input from '@artisan-toolbox/front-awesome/components/WebAwesome/Input.vue';
import '@artisan-toolbox/front-awesome/web-awesome.css';
import { webAwesomeFixture, inputReady as ready } from './fixtures/web-awesome';

const mount = webAwesomeFixture('wa-input');

test('keeps nested Inertia fields and server errors reactive and allows the next native submission', async () => {
    const form = useForm({ users: [{ name: 'Ada' }] });
    let submits = 0;
    const { container, element: input } = mount({
        render: () =>
            h(
                'form',
                {
                    onSubmit: (event: Event) => {
                        event.preventDefault();
                        submits++;
                    },
                },
                [
                    h(
                        Input<{ users: { name: string }[] }>,
                        {
                            form,
                            fieldName: 'users.0.name',
                            label: 'Name',
                            name: 'name',
                            hint: 'Caller hint',
                            'data-testid': 'inertia-name',
                        },
                        { hint: () => h('span', 'Caller slot hint') },
                    ),
                    h('button', { type: 'submit' }, 'Save'),
                ],
            ),
    });
    await ready(input);
    form.setError('users.0.name', ['<b>Invalid name</b>', 'Try again']);
    await ready(input);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.querySelector('[role="alert"]')?.textContent).toBe('<b>Invalid name</b>Try again');
    expect(input.querySelector('b')).toBeNull();
    expect(input.textContent).not.toContain('Caller slot hint');
    expect(input.validity.customError).toBe(false);
    await page.getByTestId('inertia-name').getByRole('textbox').fill('Grace');
    expect(form.users[0].name).toBe('Grace');
    expect(form.errors['users.0.name']).toHaveLength(2);
    container.querySelector('form')?.requestSubmit();
    expect(submits).toBe(1);
    form.users = [{ name: 'Katherine' }];
    await ready(input);
    expect(input.value).toBe('Katherine');
    form.reset();
    await ready(input);
    expect(input.value).toBe('Ada');
    form.clearErrors();
    await ready(input);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(input.querySelector('[role="alert"]')).toBeNull();
    expect(input.hint).toBe('Caller hint');
    expect(input.textContent).toContain('Caller slot hint');
});

test('preserves the native reset baseline and propagates native resets to the Vue owner', async () => {
    const state = reactive({ value: 'Live', baseline: 'Original' });
    const { container, element: input } = mount({
        render: () => [
            h('form', { id: 'native-profile' }),
            h(Input, {
                modelValue: state.value,
                'onUpdate:modelValue': (next: string | null | undefined) =>
                    (state.value = next ?? ''),
                form: 'native-profile',
                name: 'name',
                defaultValue: state.baseline,
            }),
        ],
    });
    await ready(input);
    expect(input.form?.id).toBe('native-profile');
    await expect.poll(() => input.value).toBe('Live');
    expect(input.defaultValue).toBe('Original');
    state.value = 'Edited';
    await ready(input);
    expect(input.defaultValue).toBe('Original');
    container.querySelector('form')?.reset();
    await ready(input);
    expect(input.value).toBe('Original');
    expect(state.value).toBe('Original');
    state.baseline = 'New baseline';
    await ready(input);
    expect(input.defaultValue).toBe('New baseline');
    state.value = 'Other edit';
    await ready(input);
    container.querySelector('form')?.reset();
    await ready(input);
    expect(state.value).toBe('New baseline');
    container
        .querySelector('form')
        ?.addEventListener('reset', (event) => event.preventDefault(), { once: true });
    state.value = 'Keep';
    await ready(input);
    container.querySelector('form')?.reset();
    await ready(input);
    expect(state.value).toBe('Keep');
    expect(input.value).toBe('Keep');
});

test.each(['wa-light', 'wa-dark'])(
    'colors the whole input through public parts and restores caller styling in %s',
    async (mode) => {
        const form = useForm({ name: 'Ada' });
        const state = reactive({
            appearance: 'filled' as 'filled' | 'outlined' | 'filled-outlined',
        });
        const { element: input } = mount({
            render: () =>
                h('div', { class: mode }, [
                    h(
                        Input<{ name: string }>,
                        {
                            form,
                            fieldName: 'name',
                            label: 'Name',
                            hint: 'Hint',
                            appearance: state.appearance,
                        },
                        { start: () => h('span', '+') },
                    ),
                ]),
        });
        await ready(input);
        const wrapper = input.shadowRoot?.querySelector<HTMLElement>('[part~="input-wrapper"]');
        const label = input.shadowRoot?.querySelector<HTMLElement>('[part~="form-control-label"]');
        const native = input.shadowRoot?.querySelector<HTMLInputElement>('[part="input"]');
        const hint = input.shadowRoot?.querySelector<HTMLElement>('[part="hint"]');
        if (!wrapper || !label || !native || !hint)
            throw new Error('Expected public Web Awesome parts.');
        const before = getComputedStyle(wrapper).borderColor;
        const expected = document.createElement('span');
        expected.style.color = 'var(--wa-color-danger-on-quiet)';
        expected.style.borderColor = 'var(--wa-color-danger-border-loud)';
        input.parentElement?.append(expected);
        form.setError('name', 'Invalid');
        await ready(input);
        for (const appearance of ['filled', 'outlined', 'filled-outlined'] as const) {
            state.appearance = appearance;
            await ready(input);
            await expect
                .poll(() => getComputedStyle(wrapper).borderColor)
                .toBe(getComputedStyle(expected).borderColor);
            await expect
                .poll(() => getComputedStyle(label).color)
                .toBe(getComputedStyle(expected).color);
            await expect
                .poll(() => getComputedStyle(native).color)
                .toBe(getComputedStyle(expected).color);
            await expect
                .poll(() => getComputedStyle(hint).color)
                .toBe(getComputedStyle(expected).color);
            input.focus();
            await ready(input);
            await expect
                .poll(() => getComputedStyle(wrapper).outlineColor)
                .toBe(getComputedStyle(expected).borderColor);
        }
        state.appearance = 'filled';
        form.clearErrors();
        await ready(input);
        await expect.poll(() => getComputedStyle(wrapper).borderColor).toBe(before);
        expect(input.hasAttribute('data-fa-invalid')).toBe(false);
    },
);

test('preserves bare presence attributes and native required and pattern validity', async () => {
    const { default: BareBooleanInput } = await import('./BareBooleanInput.vue');
    const bare = mount(BareBooleanInput).element;
    await ready(bare);
    for (const name of [
        'disabled',
        'required',
        'readonly',
        'pill',
        'autofocus',
        'with-clear',
        'password-toggle',
        'password-visible',
        'without-spin-buttons',
        'with-label',
        'with-hint',
    ])
        expect(bare.hasAttribute(name), name).toBe(true);
    const state = reactive({
        value: '',
        autocorrect: undefined as boolean | undefined,
        spellcheck: undefined as boolean | undefined,
    });
    let invalidEvents = 0;
    const { element: input } = mount({
        render: () =>
            h(Input, {
                modelValue: state.value,
                'onUpdate:modelValue': (value: string | null | undefined) =>
                    (state.value = value ?? ''),
                label: 'Code',
                required: true,
                pattern: '[A-Z]{3}',
                autocorrect: state.autocorrect,
                spellcheck: state.spellcheck,
                onWaInvalid: () => invalidEvents++,
            }),
    });
    await ready(input);
    expect(input.hasAttribute('autocorrect')).toBe(false);
    expect(input.hasAttribute('spellcheck')).toBe(false);
    expect(input.spellcheck, 'default spellcheck').toBe(true);
    expect(input.checkValidity()).toBe(false);
    await expect.poll(() => input.validity.valueMissing).toBe(true);
    state.value = 'ab';
    await ready(input);
    expect(input.checkValidity()).toBe(false);
    await expect.poll(() => input.validity.patternMismatch).toBe(true);
    state.value = 'ABC';
    await ready(input);
    await expect.poll(() => input.checkValidity()).toBe(true);
    expect(invalidEvents).toBeGreaterThan(0);
});

test('hydrates existing markup and safely handles immediate unmount', async () => {
    const { createSSRApp } = await import('vue');
    const { renderToString } = await import('vue/server-renderer');
    const state = reactive({ value: 'Hydrated' });
    const component = {
        render: () =>
            h(Input, {
                modelValue: state.value,
                'onUpdate:modelValue': (value: string | null | undefined) =>
                    (state.value = value ?? ''),
                label: 'Name',
            }),
    };
    const container = document.createElement('div');
    container.innerHTML = await renderToString(createSSRApp(component));
    document.body.append(container);
    const app = createSSRApp(component);
    const warnings: string[] = [];
    app.config.warnHandler = (message) => warnings.push(message);
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    const input = container.querySelector<WaInput>('wa-input');
    if (!input) throw new Error('Expected the hydrated public input.');
    await ready(input);
    await expect.poll(() => input.value).toBe('Hydrated');
    expect(warnings).toEqual([]);
    state.value = 'After hydration';
    await ready(input);
    await expect.poll(() => input.value).toBe('After hydration');
    const transient = document.createElement('div');
    const transientApp = createApp(component);
    transientApp.mount(transient);
    transientApp.unmount();
    await nextTick();
});

test('preserves nullable owners and explicit custom validity independently from automatic errors', async () => {
    const state = reactive({ value: null as string | null | undefined, customError: '' });
    const { element: input } = mount({
        render: () =>
            h(Input, {
                modelValue: state.value,
                'onUpdate:modelValue': (value: string | null | undefined) => (state.value = value),
                label: 'Optional name',
                defaultValue: 'Independent baseline',
                customError: state.customError,
            }),
    });
    await ready(input);
    await expect.poll(() => input.value).toBeNull();
    expect(state.value).toBeNull();
    expect(input.defaultValue).toBe('Independent baseline');
    expect(input.shadowRoot?.querySelector('input')?.value).toBe('');
    state.value = undefined;
    await ready(input);
    expect(input.value).toBe('');
    expect(state.value).toBeUndefined();
    state.value = 'Ada';
    state.customError = 'Explicit application constraint';
    await ready(input);
    expect(input.value).toBe('Ada');
    expect(input.validity.customError).toBe(true);
    state.customError = '';
    await ready(input);
    expect(input.validity.customError).toBe(false);
    expect(input.checkValidity()).toBe(true);
});

test.each(['email', 'password'] as const)(
    'commits a change-only %s fill to the Inertia payload before caller listeners run',
    async (type) => {
        const form = useForm({ credential: '' });
        const filled = type === 'email' ? 'reader@example.com' : 'example-password';
        const changes: Event[] = [];
        const observed: string[] = [];
        let submitted = '';
        const { container, element: input } = mount({
            render: () =>
                h(
                    'form',
                    {
                        onSubmit: (event: Event) => {
                            event.preventDefault();
                            submitted = form.data().credential;
                        },
                    },
                    [
                        h(Input<{ credential: string }>, {
                            form,
                            field: 'credential',
                            type,
                            name: 'credential',
                            autocomplete: type === 'email' ? 'username' : 'current-password',
                            onChange: (event: Event) => {
                                changes.push(event);
                                observed.push(form.credential);
                            },
                        }),
                    ],
                ),
        });
        await ready(input);
        const native = input.shadowRoot?.querySelector('input');
        if (!native) throw new Error('Expected the native input.');
        native.value = filled;
        native.dispatchEvent(new Event('change', { bubbles: true }));
        expect(input.value).toBe(filled);
        expect(form.credential).toBe(filled);
        expect(observed).toEqual([filled]);
        expect(changes).toHaveLength(1);
        container.querySelector('form')?.requestSubmit();
        expect(submitted).toBe(filled);
        await ready(input);
        form.reset();
        await ready(input);
        expect(input.value).toBe('');
        expect(input.defaultValue).toBe('');
    },
);

test('commits change-only fills to v-model and preserves the original host event', async () => {
    const state = reactive({ value: '', revision: 0 });
    const callerEvents: Event[] = [];
    const hostEvents: Event[] = [];
    const observed: string[] = [];
    const { element: input } = mount({
        render: () =>
            h(
                Input,
                {
                    modelValue: state.value,
                    'onUpdate:modelValue': (next: string | null | undefined) =>
                        (state.value = next ?? ''),
                    'data-revision': state.revision,
                    onChange: (event: Event) => {
                        callerEvents.push(event);
                        observed.push(state.value);
                    },
                },
                { end: () => h('input', { 'aria-label': 'Slotted control' }) },
            ),
    });
    await ready(input);
    input.addEventListener('change', (event) => hostEvents.push(event));
    const native = input.shadowRoot?.querySelector('input');
    if (!native) throw new Error('Expected the native input.');
    native.value = 'Filled name';
    native.dispatchEvent(new Event('change', { bubbles: true }));
    expect(state.value).toBe('Filled name');
    expect(observed).toEqual(['Filled name']);
    expect(callerEvents).toHaveLength(1);
    expect(callerEvents[0]).toBe(hostEvents[0]);
    state.revision++;
    await ready(input);
    expect(input.value).toBe('Filled name');
    state.value = 'External update';
    await ready(input);
    expect(native.value).toBe('External update');
    const slotted = input.querySelector('input');
    if (!slotted) throw new Error('Expected the slotted control.');
    slotted.value = 'Unrelated value';
    slotted.dispatchEvent(new Event('change', { bubbles: true }));
    expect(state.value).toBe('External update');
});

test('does not duplicate model updates on committed typing or clear, and accepts later change-only fills', async () => {
    const state = reactive({ value: 'Original' });
    const updates: (string | null | undefined)[] = [];
    const { element: input } = mount({
        render: () =>
            h(Input, {
                modelValue: state.value,
                'onUpdate:modelValue': (next: string | null | undefined) => {
                    updates.push(next);
                    state.value = next ?? '';
                },
                label: 'Autofill name',
                'data-testid': 'autofill-name',
                withClear: true,
            }),
    });
    await ready(input);
    await page.getByTestId('autofill-name').getByRole('textbox').fill('Typed');
    const native = input.shadowRoot?.querySelector('input');
    if (!native) throw new Error('Expected the native input.');
    native.blur();
    await ready(input);
    expect(updates).toEqual(['Typed']);
    const clear = input.shadowRoot?.querySelector<HTMLButtonElement>('[part="clear-button"]');
    if (!clear) throw new Error('Expected the clear button.');
    clear.click();
    await ready(input);
    expect(updates).toEqual(['Typed', '']);
    state.value = 'External update';
    await ready(input);
    native.value = 'Typed';
    native.dispatchEvent(new Event('change', { bubbles: true }));
    expect(state.value).toBe('Typed');
    expect(updates).toEqual(['Typed', '', 'Typed']);
});

test.each(['noncomposed-input', 'autocomplete', 'restore', 'host-value', 'silent-native'] as const)(
    'includes a %s fill in the submitted Inertia payload',
    async (mode) => {
        const form = useForm({ credential: '' });
        let submitted = '';
        const { container, element: input } = mount({
            render: () =>
                h(
                    'form',
                    {
                        onSubmit: (event: Event) => {
                            event.preventDefault();
                            submitted = form.data().credential;
                        },
                    },
                    [
                        h(Input<{ credential: string }>, {
                            form,
                            field: 'credential',
                            type: 'password',
                            name: 'credential',
                        }),
                        h('button', { type: 'submit' }, 'Submit autofill'),
                    ],
                ),
        });
        await ready(input);
        const native = input.shadowRoot?.querySelector('input');
        if (!native) throw new Error('Expected the native input.');
        if (mode === 'autocomplete' || mode === 'restore') {
            input.formStateRestoreCallback('filled-password', mode);
        } else if (mode === 'host-value') {
            input.value = 'filled-password';
        } else {
            native.value = 'filled-password';
            if (mode === 'noncomposed-input')
                native.dispatchEvent(new Event('input', { bubbles: true }));
        }
        container.querySelector('button')?.click();
        expect(submitted).toBe('filled-password');
    },
);

test.each(['noncomposed-input', 'autocomplete', 'restore', 'host-value', 'silent-native'] as const)(
    'retains a %s fill through an unrelated native render',
    async (mode) => {
        const form = useForm({ credential: '' });
        const state = reactive({ label: 'Password' });
        const { element: input } = mount({
            render: () =>
                h(Input<{ credential: string }>, {
                    form,
                    field: 'credential',
                    type: 'password',
                    label: state.label,
                }),
        });
        await ready(input);
        const native = input.shadowRoot?.querySelector('input');
        if (!native) throw new Error('Expected the native input.');
        if (mode === 'autocomplete' || mode === 'restore') {
            input.formStateRestoreCallback('filled-password', mode);
        } else if (mode === 'host-value') {
            input.value = 'filled-password';
        } else {
            native.value = 'filled-password';
            if (mode === 'noncomposed-input')
                native.dispatchEvent(new Event('input', { bubbles: true }));
        }
        state.label = 'Updated password label';
        await ready(input);
        await expect.poll(() => form.credential).toBe('filled-password');
        expect(native.value).toBe('filled-password');
        form.credential = 'Application update';
        await ready(input);
        expect(input.value).toBe('Application update');
        expect(native.value).toBe('Application update');
    },
);

test('reconciles a silent native fill before required validation and native FormData submission', async () => {
    const form = useForm({ credential: '' });
    const submitted: unknown[] = [];
    const { container, element: input } = mount({
        render: () =>
            h(
                'form',
                {
                    onSubmit: (event: Event) => {
                        event.preventDefault();
                        const nativeForm = container.querySelector('form');
                        if (!nativeForm) throw new Error('Expected the form.');
                        submitted.push([
                            form.data().credential,
                            new FormData(nativeForm).get('credential'),
                        ]);
                    },
                },
                [
                    h(Input<{ credential: string }>, {
                        form,
                        field: 'credential',
                        name: 'credential',
                        required: true,
                    }),
                    h('button', { type: 'submit' }, 'Submit silent fill'),
                ],
            ),
    });
    await ready(input);
    expect(input.checkValidity()).toBe(false);
    const native = input.shadowRoot?.querySelector('input');
    if (!native) throw new Error('Expected the native input.');
    native.value = 'filled-password';
    container.querySelector('button')?.click();
    expect(submitted).toEqual([['filled-password', 'filled-password']]);
});

test('reconciles an externally associated form and preserves the submitter', async () => {
    const state = reactive({ value: '' });
    const submissions: (string | undefined)[][] = [];
    const { container, element: input } = mount({
        render: () => [
            h('form', {
                id: 'autofill-external',
                onSubmit: (event: SubmitEvent) => {
                    event.preventDefault();
                    submissions.push([
                        state.value,
                        event.submitter?.getAttribute('name') ?? undefined,
                    ]);
                },
            }),
            h(Input, {
                modelValue: state.value,
                'onUpdate:modelValue': (next: string | null | undefined) =>
                    (state.value = next ?? ''),
                form: 'autofill-external',
                required: true,
            }),
            h('button', { form: 'autofill-external', type: 'submit', name: 'sign-in' }, 'Sign in'),
        ],
    });
    await ready(input);
    const native = input.shadowRoot?.querySelector('input');
    if (!native) throw new Error('Expected the native input.');
    native.value = 'filled-password';
    container.querySelector('button')?.click();
    expect(submissions).toEqual([['filled-password', 'sign-in']]);
});

test('reconciles silent credentials before native Enter submission', async () => {
    const form = useForm({ credential: '' });
    const submissions: string[] = [];
    const { element: input } = mount({
        render: () =>
            h(
                'form',
                {
                    onSubmit: (event: Event) => {
                        event.preventDefault();
                        submissions.push(form.data().credential);
                    },
                },
                [
                    h(Input<{ credential: string }>, {
                        form,
                        field: 'credential',
                        required: true,
                        label: 'Enter credential',
                        'data-testid': 'enter-credential',
                    }),
                ],
            ),
    });
    await ready(input);
    const native = input.shadowRoot?.querySelector('input');
    if (!native) throw new Error('Expected the native input.');
    native.value = 'filled-password';
    input.focus();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => submissions).toEqual(['filled-password']);
});

test.each(['inertia', 'model'] as const)(
    'keeps a newer %s owner update ahead of queued autofill observation',
    async (owner) => {
        const form = useForm({ credential: 'Initial' });
        const state = reactive({ value: 'Initial' });
        const { element: input } = mount({
            render: () =>
                owner === 'inertia'
                    ? h(Input<{ credential: string }>, { form, field: 'credential' })
                    : h(Input, {
                          modelValue: state.value,
                          'onUpdate:modelValue': (next: string | null | undefined) =>
                              (state.value = next ?? ''),
                      }),
        });
        await ready(input);
        const native = input.shadowRoot?.querySelector('input');
        if (!native) throw new Error('Expected the native input.');
        native.value = 'Autofilled';
        input.label = 'Trigger an unrelated render';
        queueMicrotask(() => {
            form.credential = 'New application value';
            state.value = 'New application value';
        });
        await ready(input);
        expect(owner === 'inertia' ? form.credential : state.value).toBe('New application value');
        expect(input.value).toBe('New application value');
        expect(native.value).toBe('New application value');
    },
);
