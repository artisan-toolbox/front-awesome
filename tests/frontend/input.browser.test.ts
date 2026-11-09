import { expect, onTestFinished, test } from 'vite-plus/test';
import { page } from 'vitest/browser';
import { createApp, h, nextTick, reactive } from 'vue';
import type { Component } from 'vue';
import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js';
import { useForm } from '@inertiajs/vue3';
import Input from '@artisan-toolbox/front-awesome/components/WebAwesome/Input.vue';
import '@artisan-toolbox/front-awesome/web-awesome.css';

function mount(component: Component) {
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp(component);
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    const input = container.querySelector<WaInput>('wa-input');
    if (!input) throw new Error('Expected the public Input component.');
    return { container, input };
}

async function ready(input: WaInput) {
    await customElements.whenDefined('wa-input');
    await nextTick();
    await input.updateComplete;
    await nextTick();
    await input.updateComplete;
}

test('preserves false booleans before registration and live bindings, attrs, slots, and native events after upgrade', async () => {
    expect(customElements.get('wa-input')).toBeUndefined();
    const state = reactive({ value: 'Ada', enabled: false });
    const events: Event[] = [];
    const observedValues: string[] = [];
    const { input } = mount({
        render: () =>
            h(
                Input,
                {
                    modelValue: state.value,
                    'onUpdate:modelValue': (value: string | null | undefined) =>
                        (state.value = value ?? ''),
                    disabled: state.enabled,
                    required: state.enabled,
                    readonly: state.enabled,
                    pill: state.enabled,
                    autofocus: state.enabled,
                    withClear: true,
                    passwordToggle: state.enabled,
                    passwordVisible: state.enabled,
                    withoutSpinButtons: state.enabled,
                    withLabel: state.enabled,
                    withHint: state.enabled,
                    spellcheck: state.enabled,
                    autocorrect: state.enabled,
                    label: 'Name',
                    'data-testid': 'name',
                    'data-purpose': 'profile',
                    class: 'caller-class',
                    style: { marginTop: '3px' },
                    onInput: (event: Event) => {
                        events.push(event);
                        observedValues.push(state.value);
                    },
                    onChange: (event: Event) => events.push(event),
                    onWaClear: (event: Event) => events.push(event),
                },
                {
                    start: () => h('span', '+'),
                    default: () => h('span', { slot: 'end' }, 'end'),
                    'clear-icon': () => h('span', 'clear'),
                },
            ),
    });
    for (const key of [
        'disabled',
        'required',
        'readonly',
        'pill',
        'autofocus',
        'password-toggle',
        'password-visible',
        'without-spin-buttons',
        'with-label',
        'with-hint',
    ])
        expect(input.hasAttribute(key)).toBe(false);
    state.value = 'Latest before import';
    await ready(input);
    await expect.poll(() => input.value).toBe('Latest before import');
    expect(Object.hasOwn(input, 'value')).toBe(false);
    expect(input.disabled).toBe(false);
    expect(input.spellcheck).toBe(false);
    expect(input.autocorrect).toBe(false);
    expect(input.withClear).toBe(true);
    expect(input.classList.contains('caller-class')).toBe(true);
    expect(input.style.marginTop).toBe('3px');
    expect(input.dataset.purpose).toBe('profile');
    for (const slot of ['start', 'end', 'clear-icon'])
        expect(
            input.shadowRoot
                ?.querySelector<HTMLSlotElement>(`slot[name="${slot}"]`)
                ?.assignedElements(),
        ).toHaveLength(1);
    await page.getByTestId('name').getByRole('textbox').fill('Grace');
    await nextTick();
    expect(state.value).toBe('Grace');
    expect(events[0]).toBeInstanceOf(InputEvent);
    expect(observedValues.at(-1)).toBe('Grace');
    expect(events.filter((event) => event.type === 'input')).toHaveLength(1);
    const clear = input.shadowRoot?.querySelector<HTMLButtonElement>('[part="clear-button"]');
    clear?.click();
    await ready(input);
    expect(state.value).toBe('');
    expect(events.filter((event) => event.type === 'wa-clear')).toHaveLength(1);
    expect(events.filter((event) => event.type === 'input')).toHaveLength(2);
    expect(events.filter((event) => event.type === 'change')).toHaveLength(1);
    for (const enabled of [true, false]) {
        state.enabled = enabled;
        await ready(input);
        expect(input.disabled).toBe(enabled);
        expect(input.required).toBe(enabled);
        expect(input.passwordToggle).toBe(enabled);
        expect(input.spellcheck).toBe(enabled);
        expect(input.autocorrect).toBe(enabled);
    }
});

test('keeps nested Inertia fields and server errors reactive and allows the next native submission', async () => {
    const form = useForm({ users: [{ name: 'Ada' }] });
    let submits = 0;
    const { container, input } = mount({
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
    const { container, input } = mount({
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
        const { input } = mount({
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
    const bare = mount(BareBooleanInput).input;
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
    const { input } = mount({
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
    const { input } = mount({
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
