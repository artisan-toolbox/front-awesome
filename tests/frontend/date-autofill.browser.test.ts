import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { createApp, h, nextTick, shallowReactive } from 'vue';
import type { Component } from 'vue';
import { useForm } from '@inertiajs/vue3';
import KnownDate from '@artisan-toolbox/front-awesome/components/WebAwesome/KnownDate.vue';
import TimeInput from '@artisan-toolbox/front-awesome/components/WebAwesome/TimeInput.vue';
import type WaKnownDate from '@awesome.me/webawesome/dist/components/known-date/known-date.js';
import type WaTimeInput from '@awesome.me/webawesome/dist/components/time-input/time-input.js';
import '@artisan-toolbox/front-awesome/web-awesome.css';

type DateHost = WaKnownDate | WaTimeInput;
const controls = [
    {
        name: 'KnownDate',
        tag: 'wa-known-date',
        component: KnownDate,
        filled: '2000-02-03',
        autocomplete: 'bday',
        external: '2026-11-17',
    },
    {
        name: 'TimeInput',
        tag: 'wa-time-input',
        component: TimeInput,
        filled: '14:30',
        autocomplete: 'on',
        external: '09:45',
    },
] satisfies {
    name: string;
    tag: string;
    component: Component;
    filled: string;
    autocomplete: string;
    external: string;
}[];

async function ready(input: DateHost) {
    await vi.dynamicImportSettled();
    await customElements.whenDefined(input.localName);
    await nextTick();
    await input.updateComplete;
    await nextTick();
    await input.updateComplete;
}

function mountControl(spec: (typeof controls)[number]) {
    const form = useForm({ value: '' });
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
                        const nativeForm = container.querySelector('form');
                        if (!nativeForm) throw new Error('Expected the date form.');
                        submissions.push({
                            owner: form.data().value,
                            native: new FormData(nativeForm).get('value'),
                        });
                    },
                },
                [
                    h(component, {
                        form,
                        field: 'value',
                        name: 'value',
                        label: `${spec.name} autofill`,
                        autocomplete: spec.autocomplete,
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
    const input = container.querySelector<DateHost>(spec.tag);
    const button = container.querySelector('button');
    if (!input || !button) throw new Error('Expected the bound date control.');
    return { input, button, form, submissions };
}

for (const spec of controls) {
    test.each(['host-value', 'restore'])(
        `${spec.name} submits a %s canonical value immediately`,
        async (mode) => {
            const { input, button, submissions } = mountControl(spec);
            await ready(input);
            if (mode === 'host-value') input.value = spec.filled;
            else input.formStateRestoreCallback(spec.filled);
            button.click();
            expect(submissions).toEqual([{ owner: spec.filled, native: spec.filled }]);
        },
    );

    test(`${spec.name} preserves Date owners across external writes and unrelated renders`, async () => {
        const initial = new Date(2000, 1, 3, 14, 30);
        const external = new Date(2026, 10, 17, 9, 45);
        const state = shallowReactive<{ value: Date | string; label: string }>({
            value: initial,
            label: 'Initial label',
        });
        const updates: string[] = [];
        const container = document.createElement('div');
        document.body.append(container);
        const component: Component = spec.component;
        const app = createApp({
            render: () =>
                h(component, {
                    modelValue: state.value,
                    'onUpdate:modelValue': (value: string) => {
                        updates.push(value);
                        state.value = value;
                    },
                    label: state.label,
                }),
        });
        app.mount(container);
        onTestFinished(() => {
            app.unmount();
            container.remove();
        });
        const input = container.querySelector<DateHost>(spec.tag);
        if (!input) throw new Error('Expected the Date-owned control.');
        await ready(input);
        expect(state.value).toBe(initial);
        state.value = external;
        await ready(input);
        expect(input.value).toBe(spec.external);
        state.label = 'Unrelated label update';
        await ready(input);
        input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        await nextTick();
        expect(state.value).toBe(external);
        expect(updates).toEqual([]);
    });
}

test('KnownDate composes noncomposed birthday field input into the submitted ISO date', async () => {
    const { input, button, submissions } = mountControl(controls[0]);
    await ready(input);
    for (const [field, value] of [
        ['day', '03'],
        ['month', '02'],
        ['year', '2000'],
    ]) {
        const native = input.shadowRoot?.querySelector<HTMLInputElement>(
            `input[autocomplete="bday-${field}"]`,
        );
        if (!native) throw new Error(`Expected the birthday ${field} field.`);
        native.value = value;
        native.dispatchEvent(new InputEvent('input', { bubbles: true, composed: false }));
    }
    button.click();
    expect(submissions).toEqual([{ owner: '2000-02-03', native: '2000-02-03' }]);
});
