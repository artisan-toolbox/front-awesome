import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { createApp, h, nextTick, shallowReactive } from 'vue';
import type { Component } from 'vue';
import { useForm } from '@inertiajs/vue3';
import DateInput from '@artisan-toolbox/front-awesome/components/WebAwesome/DateInput.vue';
import type WaDateInput from '@web.awesome.me/webawesome-pro/dist/components/date-input/date-input.js';
import '@artisan-toolbox/front-awesome/web-awesome.css';

type RichDate = Date | { from: Date; to: Date };
const component: Component = DateInput;
const modes = [
    {
        mode: 'single',
        filled: '2000-02-03',
        initial: new Date(2000, 1, 3),
        external: new Date(2026, 10, 17),
        expected: '2026-11-17',
    },
    {
        mode: 'range',
        filled: '2000-02-03/2000-02-05',
        initial: { from: new Date(2000, 1, 3), to: new Date(2000, 1, 5) },
        external: { from: new Date(2026, 10, 17), to: new Date(2026, 10, 19) },
        expected: '2026-11-17/2026-11-19',
    },
] satisfies {
    mode: 'single' | 'range';
    filled: string;
    initial: RichDate;
    external: RichDate;
    expected: string;
}[];

async function ready(input: WaDateInput) {
    await vi.dynamicImportSettled();
    await customElements.whenDefined(input.localName);
    await nextTick();
    await input.updateComplete;
    await nextTick();
    await input.updateComplete;
}

function mount(render: () => ReturnType<typeof h>) {
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp({ render });
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    const input = container.querySelector<WaDateInput>('wa-date-input');
    if (!input) throw new Error('Expected the DateInput control.');
    return { container, input };
}

for (const spec of modes) {
    test.each(['host-value', 'restore'])(
        `DateInput ${spec.mode} submits a %s canonical value immediately`,
        async (method) => {
            const form = useForm({ value: '' });
            const submissions: { owner: string; native: FormDataEntryValue | null }[] = [];
            const { container, input } = mount(() =>
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
                            label: 'Autofilled date',
                            mode: spec.mode,
                        }),
                        h('button', { type: 'submit' }, 'Continue'),
                    ],
                ),
            );
            await ready(input);
            if (method === 'host-value') input.value = spec.filled;
            else input.formStateRestoreCallback(spec.filled);
            const button = container.querySelector('button');
            if (!button) throw new Error('Expected the submit button.');
            button.click();
            expect(submissions).toEqual([{ owner: spec.filled, native: spec.filled }]);
        },
    );

    test(`DateInput ${spec.mode} preserves rich owners across external writes and unrelated renders`, async () => {
        const state = shallowReactive<{ value: RichDate | string; label: string }>({
            value: spec.initial,
            label: 'Initial date label',
        });
        const updates: string[] = [];
        const { input } = mount(() =>
            h(component, {
                modelValue: state.value,
                'onUpdate:modelValue': (value: string) => {
                    updates.push(value);
                    state.value = value;
                },
                mode: spec.mode,
                label: state.label,
            }),
        );
        await ready(input);
        expect(state.value).toBe(spec.initial);
        state.value = spec.external;
        await ready(input);
        expect(input.value).toBe(spec.expected);
        state.label = 'Unrelated label update';
        await ready(input);
        input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        await nextTick();
        expect(state.value).toBe(spec.external);
        expect(updates).toEqual([]);
    });
}
