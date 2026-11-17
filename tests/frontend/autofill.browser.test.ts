import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { userEvent } from 'vitest/browser';
import { createApp, h, nextTick, reactive } from 'vue';
import type { Component } from 'vue';
import { useForm } from '@inertiajs/vue3';
import Input from '@artisan-toolbox/front-awesome/components/WebAwesome/Input.vue';
import OtpInput from '@artisan-toolbox/front-awesome/components/WebAwesome/OtpInput.vue';
import Textarea from '@artisan-toolbox/front-awesome/components/WebAwesome/Textarea.vue';
import NumberInput from '@artisan-toolbox/front-awesome/components/WebAwesome/NumberInput.vue';
import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js';
import type WaOtpInput from '@awesome.me/webawesome/dist/components/otp-input/otp-input.js';
import type WaTextarea from '@awesome.me/webawesome/dist/components/textarea/textarea.js';
import type WaNumberInput from '@awesome.me/webawesome/dist/components/number-input/number-input.js';
import '@artisan-toolbox/front-awesome/web-awesome.css';

type ScalarHost = WaInput | WaOtpInput | WaTextarea | WaNumberInput;
interface ScalarSpec {
    name: string;
    tag: string;
    component: Component;
    filled: string;
    initial: string;
    external: string;
}

const controls = [
    {
        name: 'OtpInput',
        tag: 'wa-otp-input',
        component: OtpInput,
        filled: '001234',
        initial: '112233',
        external: '998877',
    },
    {
        name: 'Textarea',
        tag: 'wa-textarea',
        component: Textarea,
        filled: 'Filled street\nSecond address line',
        initial: 'Initial address',
        external: 'Application address',
    },
    {
        name: 'NumberInput',
        tag: 'wa-number-input',
        component: NumberInput,
        filled: '42',
        initial: '7',
        external: '19',
    },
] satisfies readonly ScalarSpec[];

const modes = [
    'composed-input',
    'noncomposed-input',
    'change-only',
    'host-value',
    'autocomplete',
    'restore',
    'silent-native',
] as const;

async function ready(input: ScalarHost) {
    await vi.dynamicImportSettled();
    await customElements.whenDefined(input.localName);
    await nextTick();
    await input.updateComplete;
    await nextTick();
    await input.updateComplete;
}

function mountControl(spec: ScalarSpec, options: { initial?: string; props?: object } = {}) {
    const form = useForm({ value: options.initial ?? '' });
    const submissions: {
        owner: string;
        native: FormDataEntryValue | null;
        submitter: string | null;
    }[] = [];
    const container = document.createElement('div');
    document.body.append(container);
    const component: Component = spec.component;
    const app = createApp({
        render: () =>
            h(
                'form',
                {
                    onSubmit: (event: SubmitEvent) => {
                        event.preventDefault();
                        const nativeForm = container.querySelector('form');
                        if (!nativeForm) throw new Error('Expected the native form.');
                        submissions.push({
                            owner: form.data().value,
                            native: new FormData(nativeForm).get('value'),
                            submitter: event.submitter?.getAttribute('name') ?? null,
                        });
                    },
                },
                [
                    h(component, {
                        form,
                        field: 'value',
                        name: 'value',
                        label: `${spec.name} autofill`,
                        ...options.props,
                    }),
                    h('button', { type: 'submit', name: 'continue' }, 'Continue'),
                ],
            ),
    });
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    const input = container.querySelector<ScalarHost>(spec.tag);
    const nativeForm = container.querySelector('form');
    const button = container.querySelector('button');
    if (!input || !nativeForm || !button) throw new Error('Expected the bound scalar control.');
    return { container, input, nativeForm, button, form, submissions };
}

for (const spec of controls) {
    test.each(modes)(
        `${spec.name} includes a %s fill in the immediate submitted payload`,
        async (mode) => {
            const { input, button, submissions } = mountControl(spec);
            await ready(input);
            if (mode === 'autocomplete' || mode === 'restore') {
                input.formStateRestoreCallback(spec.filled, mode);
            } else if (mode === 'host-value') {
                input.value = spec.filled;
            } else {
                input.input.value = spec.filled;
                if (mode === 'composed-input' || mode === 'noncomposed-input')
                    input.input.dispatchEvent(
                        new InputEvent('input', {
                            bubbles: true,
                            composed: mode === 'composed-input',
                            inputType: 'insertReplacementText',
                        }),
                    );
                if (mode === 'change-only')
                    input.input.dispatchEvent(new Event('change', { bubbles: true }));
            }
            button.click();
            expect(submissions).toEqual([
                { owner: spec.filled, native: spec.filled, submitter: 'continue' },
            ]);
        },
    );

    test(`${spec.name} retains a silent fill across an unrelated render and accepts a newer owner`, async () => {
        const { input, form } = mountControl(spec);
        await ready(input);
        input.input.value = spec.filled;
        input.label = 'Updated autofill label';
        await ready(input);
        await expect.poll(() => form.value).toBe(spec.filled);
        expect(input.input.value).toBe(spec.filled);
        form.value = spec.external;
        await ready(input);
        expect(input.value).toBe(spec.external);
        expect(input.input.value).toBe(spec.external);
    });

    test(`${spec.name} preserves a newer queued application owner after native reconciliation`, async () => {
        const { input, form } = mountControl(spec, { initial: spec.initial });
        await ready(input);
        input.input.value = spec.filled;
        input.label = 'Queue a native render';
        queueMicrotask(() => {
            form.value = spec.external;
        });
        await ready(input);
        await expect.poll(() => form.value).toBe(spec.external);
        expect(input.value).toBe(spec.external);
        expect(input.input.value).toBe(spec.external);
    });

    test(`${spec.name} keeps native reset defaults and respects a prevented reset`, async () => {
        const { input, nativeForm, form } = mountControl(spec, {
            initial: spec.initial,
            props: { defaultValue: spec.initial },
        });
        await ready(input);
        form.value = spec.filled;
        await ready(input);
        const preventReset = (event: Event) => event.preventDefault();
        nativeForm.addEventListener('reset', preventReset, { once: true });
        nativeForm.reset();
        await ready(input);
        expect(form.value).toBe(spec.filled);
        expect(input.value).toBe(spec.filled);
        nativeForm.reset();
        await ready(input);
        expect(form.value).toBe(spec.initial);
        expect(input.input.value).toBe(spec.initial);
        expect(input.defaultValue).toBe(spec.initial);
    });
}

test('OtpInput exposes native one-time-code hints and keeps numeric leading zeroes as text', async () => {
    const spec = controls[0];
    const { input, button, submissions } = mountControl(spec, {
        props: { id: 'verification-code', name: 'value' },
    });
    await ready(input);
    expect(input.id).toBe('verification-code');
    expect(input.name).toBe('value');
    expect(input.input).toBeInstanceOf(HTMLInputElement);
    expect(input.input.type).toBe('text');
    expect(input.input.autocomplete).toBe('one-time-code');
    expect(input.input.inputMode).toBe('numeric');
    input.input.value = '001234';
    input.input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    button.click();
    expect(submissions).toEqual([{ owner: '001234', native: '001234', submitter: 'continue' }]);
    await ready(input);
    expect(input.id).toBe('verification-code');
    expect(input.name).toBe('value');
});

test('OtpInput uses a text keyboard for an alphanumeric code and applies its public filtering rules', async () => {
    const { input, form, button, submissions } = mountControl(controls[0], {
        props: { type: 'alphanumeric', case: 'upper', length: 6 },
    });
    await ready(input);
    expect(input.input.type).toBe('text');
    expect(input.input.inputMode).toBe('text');
    input.value = 'ab-01cd-extra';
    await ready(input);
    expect(input.value).toBe('AB01CD');
    expect(form.value).toBe('AB01CD');
    button.click();
    expect(submissions).toEqual([{ owner: 'AB01CD', native: 'AB01CD', submitter: 'continue' }]);
});

test('OtpInput commits the complete code before the caller handles wa-complete', async () => {
    const observed: string[] = [];
    const completions: Event[] = [];
    const form = useForm({ code: '' });
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp({
        render: () =>
            h(OtpInput<{ code: string }>, {
                form,
                field: 'code',
                onWaComplete: (event: Event) => {
                    observed.push(form.code);
                    completions.push(event);
                },
            }),
    });
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    const input = container.querySelector<WaOtpInput>('wa-otp-input');
    if (!input) throw new Error('Expected the OTP input.');
    await ready(input);
    const emitted: Event[] = [];
    input.addEventListener('wa-complete', (event) => emitted.push(event));
    input.input.value = '001234';
    input.input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    expect(observed).toEqual(['001234']);
    expect(completions).toHaveLength(1);
    expect(completions[0]).toBe(emitted[0]);
});

test.each([false, true])(
    'OtpInput preserves autosubmit and complete-event cancellation with canceled=%s',
    async (canceled) => {
        const observed: string[] = [];
        const { input, form, submissions } = mountControl(controls[0], {
            props: {
                autosubmit: true,
                onWaComplete: (event: Event) => {
                    observed.push(form.value);
                    if (canceled) event.preventDefault();
                },
            },
        });
        await ready(input);
        input.input.value = '001234';
        input.input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
        await ready(input);
        if (canceled) {
            await new Promise((resolve) => setTimeout(resolve, 0));
            expect(submissions).toEqual([]);
        } else {
            await expect
                .poll(() => submissions)
                .toEqual([{ owner: '001234', native: '001234', submitter: null }]);
        }
        expect(observed).toEqual(['001234']);
    },
);

test('OtpInput reconciles a silent native code on Enter without changing submission behavior', async () => {
    const { input, submissions } = mountControl(controls[0], {
        props: { 'data-testid': 'silent-otp-enter', required: true },
    });
    await ready(input);
    input.focus();
    await ready(input);
    input.input.value = '001234';
    await userEvent.keyboard('{Enter}');
    await expect
        .poll(() => submissions)
        .toEqual([{ owner: '001234', native: '001234', submitter: null }]);
});

for (const spec of controls) {
    test(`${spec.name} commits a Vue model once for input followed by change`, async () => {
        const state = reactive<{ value: string | null }>({ value: '' });
        const updates: (string | null)[] = [];
        const container = document.createElement('div');
        document.body.append(container);
        const component: Component = spec.component;
        const app = createApp({
            render: () =>
                h(component, {
                    modelValue: state.value,
                    'onUpdate:modelValue': (next: string | null) => {
                        updates.push(next);
                        state.value = next;
                    },
                }),
        });
        app.mount(container);
        onTestFinished(() => {
            app.unmount();
            container.remove();
        });
        const input = container.querySelector<ScalarHost>(spec.tag);
        if (!input) throw new Error('Expected the Vue-bound scalar control.');
        await ready(input);
        input.input.value = spec.filled;
        input.input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
        input.input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        await ready(input);
        expect(state.value).toBe(spec.filled);
        expect(updates).toEqual([spec.filled]);
        state.value = spec.external;
        await ready(input);
        expect(input.value).toBe(spec.external);
        expect(input.input.value).toBe(spec.external);
        expect(updates).toEqual([spec.filled]);
    });

    test(`${spec.name} preserves native unbound value and reset behavior`, async () => {
        const container = document.createElement('div');
        document.body.append(container);
        const component: Component = spec.component;
        const app = createApp({
            render: () =>
                h('form', [h(component, { name: 'unbound', defaultValue: spec.initial })]),
        });
        app.mount(container);
        onTestFinished(() => {
            app.unmount();
            container.remove();
        });
        const input = container.querySelector<ScalarHost>(spec.tag);
        const nativeForm = container.querySelector('form');
        if (!input || !nativeForm) throw new Error('Expected the native unbound scalar control.');
        await ready(input);
        const rawForm = document.createElement('form');
        rawForm.innerHTML = `<${spec.tag} name="unbound"></${spec.tag}>`;
        const raw = rawForm.querySelector<ScalarHost>(spec.tag);
        if (!raw) throw new Error('Expected the native baseline control.');
        raw.defaultValue = spec.initial;
        container.append(rawForm);
        await ready(raw);
        expect(input.value).toBe(spec.initial);
        input.input.value = spec.filled;
        raw.input.value = spec.filled;
        raw.input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
        input.input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
        await ready(input);
        expect(new FormData(nativeForm).get('unbound')).toBe(spec.filled);
        nativeForm.reset();
        rawForm.reset();
        await ready(input);
        await ready(raw);
        expect(input.value).toBe(raw.value);
        expect(input.input.value).toBe(raw.input.value);
        expect(new FormData(nativeForm).get('unbound')).toBe(new FormData(rawForm).get('unbound'));
    });
}

test('OtpInput filters and truncates silent numeric codes through the public value contract', async () => {
    const { input, form, button, submissions } = mountControl(controls[0]);
    await ready(input);
    input.input.value = '00 12-34 99';
    button.click();
    expect(input.value).toBe('001234');
    expect(form.value).toBe('001234');
    expect(input.input.value).toBe('001234');
    expect(submissions).toEqual([{ owner: '001234', native: '001234', submitter: 'continue' }]);
});

test('OtpInput preserves the upstream absence of completion and autosubmit for a silent setter', async () => {
    const completions: Event[] = [];
    const { input, form, submissions } = mountControl(controls[0], {
        props: { autosubmit: true, onWaComplete: (event: Event) => completions.push(event) },
    });
    await ready(input);
    input.value = '001234';
    await ready(input);
    expect(form.value).toBe('001234');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(completions).toEqual([]);
    expect(submissions).toEqual([]);
});

test('OtpInput validates an incomplete typed code before allowing a complete silent code submission', async () => {
    const { input, form, button, submissions } = mountControl(controls[0], {
        props: { required: true },
    });
    await ready(input);
    input.focus();
    await ready(input);
    await userEvent.keyboard('001');
    button.click();
    expect(form.value).toBe('001');
    expect(input.validity.valid).toBe(false);
    expect(submissions).toEqual([]);
    input.input.value = '001234';
    button.click();
    expect(submissions).toEqual([{ owner: '001234', native: '001234', submitter: 'continue' }]);
});

test('NumberInput reconciles a silent native number before Enter submission', async () => {
    const { input, submissions } = mountControl(controls[2], { props: { required: true } });
    await ready(input);
    input.focus();
    await ready(input);
    input.input.value = '42';
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => submissions).toEqual([{ owner: '42', native: '42', submitter: null }]);
});

test('Textarea preserves Enter as text entry while reconciling an address fill', async () => {
    const { input, form, submissions } = mountControl(controls[1]);
    await ready(input);
    input.focus();
    await ready(input);
    input.input.value = 'Filled address';
    input.input.setSelectionRange('Filled address'.length, 'Filled address'.length);
    await userEvent.keyboard('{Enter}');
    await ready(input);
    expect(form.value).toBe('Filled address\n');
    expect(submissions).toEqual([]);
});

for (const spec of [
    {
        name: 'Input',
        tag: 'wa-input',
        component: Input,
        initial: 'Original credential',
        filled: 'Filled credential',
        external: 'Application credential',
    },
    ...controls,
] satisfies readonly ScalarSpec[]) {
    test(`${spec.name} preserves a synchronous application owner before an already queued native render`, async () => {
        const { input, form } = mountControl(spec, { initial: spec.initial });
        await ready(input);
        input.input.value = spec.filled;
        input.label = 'Queue native observation';
        form.value = spec.external;
        await ready(input);
        expect(form.value).toBe(spec.external);
        expect(input.value).toBe(spec.external);
        expect(input.input.value).toBe(spec.external);
    });
}

test('Input preserves a synchronous Vue parent update before an already queued native render', async () => {
    const state = reactive({ value: 'Original credential' });
    const updates: (string | null | undefined)[] = [];
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp({
        render: () =>
            h(Input, {
                modelValue: state.value,
                'onUpdate:modelValue': (value: string | null | undefined) => {
                    updates.push(value);
                    state.value = value ?? '';
                },
                label: 'Credential',
            }),
    });
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    const input = container.querySelector<ScalarHost>('wa-input');
    if (!input) throw new Error('Expected the Vue-owned input.');
    await ready(input);
    input.input.value = 'Filled credential';
    input.label = 'Queue native observation';
    state.value = 'Application credential';
    await ready(input);
    expect(state.value).toBe('Application credential');
    expect(input.value).toBe('Application credential');
    expect(input.input.value).toBe('Application credential');
    expect(updates).toEqual([]);
});

for (const spec of [
    {
        name: 'Input',
        tag: 'wa-input',
        component: Input,
        initial: 'Original credential',
        filled: 'Filled credential',
        external: 'Application credential',
    },
    ...controls,
] satisfies readonly ScalarSpec[]) {
    for (const renderOrder of ['Lit before Vue', 'Vue before Lit']) {
        test.each(['field', 'form'] as const)(
            `${spec.name} discards a pending native fill after an equal-valued Inertia %s rebind with ${renderOrder}`,
            async (binding) => {
                const first = useForm({ a: spec.initial, b: spec.initial });
                const second = useForm({ a: spec.initial, b: spec.initial });
                const state = reactive({ switched: false });
                const currentForm = () => (binding === 'form' && state.switched ? second : first);
                const currentField = () => (binding === 'field' && state.switched ? 'b' : 'a');
                const submissions: { owner: string; native: FormDataEntryValue | null }[] = [];
                const container = document.createElement('div');
                document.body.append(container);
                const component: Component = spec.component;
                const app = createApp({
                    render: () =>
                        h(
                            'form',
                            {
                                onSubmit: (event: SubmitEvent) => {
                                    event.preventDefault();
                                    if (!(event.target instanceof HTMLFormElement))
                                        throw new Error('Expected the submitted native form.');
                                    submissions.push({
                                        owner: currentForm()[currentField()],
                                        native: new FormData(event.target).get('value'),
                                    });
                                },
                            },
                            [
                                h(component, {
                                    form: currentForm(),
                                    field: currentField(),
                                    name: 'value',
                                    defaultValue: spec.initial,
                                }),
                                h('button', { type: 'submit' }, 'Continue'),
                            ],
                        ),
                });
                app.mount(container);
                onTestFinished(() => {
                    app.unmount();
                    container.remove();
                });
                const input = container.querySelector<ScalarHost>(spec.tag);
                const nativeForm = container.querySelector('form');
                const button = container.querySelector('button');
                if (!input || !nativeForm || !button)
                    throw new Error('Expected the rebindable scalar control and its form.');
                await ready(input);
                expect(first).not.toBe(second);
                expect(input.value).toBe(spec.initial);

                input.input.value = spec.filled;
                if (renderOrder === 'Lit before Vue') {
                    input.label = 'Queue the original binding render';
                    state.switched = true;
                } else {
                    state.switched = true;
                    input.label = 'Queue the original binding render';
                }
                await ready(input);
                await ready(input);

                expect(first.data()).toEqual({ a: spec.initial, b: spec.initial });
                expect(second.data()).toEqual({ a: spec.initial, b: spec.initial });
                expect(input.value).toBe(spec.initial);
                expect(input.input.value).toBe(spec.initial);
                expect(new FormData(nativeForm).get('value')).toBe(spec.initial);
                button.click();
                expect(submissions).toEqual([{ owner: spec.initial, native: spec.initial }]);

                input.input.value = spec.external;
                input.label = 'Queue the new binding render';
                await ready(input);
                await ready(input);

                expect(first.data()).toEqual({
                    a: spec.initial,
                    b: binding === 'field' ? spec.external : spec.initial,
                });
                expect(second.data()).toEqual({
                    a: binding === 'form' ? spec.external : spec.initial,
                    b: spec.initial,
                });
                expect(input.value).toBe(spec.external);
                expect(input.input.value).toBe(spec.external);
                expect(new FormData(nativeForm).get('value')).toBe(spec.external);
                button.click();
                expect(submissions).toEqual([
                    { owner: spec.initial, native: spec.initial },
                    { owner: spec.external, native: spec.external },
                ]);
            },
        );
    }
}
