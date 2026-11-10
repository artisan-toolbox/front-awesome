import { expect, test } from 'vite-plus/test';
import { page } from 'vitest/browser';
import { reactive } from 'vue';
import Controls from './fixtures/form-errors-matrix/Controls.vue';
import { matrixForm } from './fixtures/form-errors-matrix/data';
import type { MatrixData } from './fixtures/form-errors-matrix/data';
import {
    arrow,
    exerciseErrors,
    h,
    mount,
    paint,
    part,
    required,
    ready,
    surface,
    userEvent,
} from '../frontend/fixtures/form-errors-matrix/browser';
import type { FieldValue, Paint } from '../frontend/fixtures/form-errors-matrix/browser';
import '@artisan-toolbox/front-awesome/web-awesome.css';

type Form = ReturnType<typeof matrixForm>;
type Scenario = {
    name: 'Combobox' | 'DateInput' | 'DatePicker' | 'FileInput';
    field: keyof MatrixData;
    tag: string;
    initial: (form: Form) => FieldValue;
    userValue: (file: File) => FieldValue;
    externalValue: (file: File) => FieldValue;
    external: (form: Form, file: File) => void;
    interact: (host: HTMLElement, file: File) => Promise<void>;
    paints: Paint[];
};
const cases: Scenario[] = [
    {
        name: 'Combobox',
        field: 'combobox',
        tag: 'wa-combobox',
        initial: () => 'one',
        userValue: () => 'two',
        externalValue: () => null,
        external: (form) => {
            form.combobox = null;
        },
        interact: async (host) => {
            await userEvent.click(part(host, '[part~="combobox-input"]'));
            await userEvent.click(required(host, 'wa-option[value="two"]'));
        },
        paints: [...surface('combobox'), paint('[part~="combobox-input"]', 'color', 'text')],
    },
    {
        name: 'DateInput',
        field: 'dateInput',
        tag: 'wa-date-input',
        initial: () => '2026-11-09',
        userValue: () => '2026-11-10',
        externalValue: () => '2026-11-12',
        external: (form) => {
            form.dateInput = '2026-11-12';
        },
        interact: (host) => arrow(host, '[part~="segment"][data-segment="day"]'),
        paints: [...surface('input-wrapper'), paint('[part~="segment"]', 'color', 'text')],
    },
    {
        name: 'DatePicker',
        field: 'datePicker',
        tag: 'wa-date-picker',
        initial: () => '2026-11-09',
        userValue: () => '2026-11-10',
        externalValue: () => '2026-11-12',
        external: (form) => {
            form.datePicker = '2026-11-12';
        },
        interact: (host) => userEvent.click(part(host, '[part~="day"][data-date="2026-11-10"]')),
        paints: [
            ...surface('date-picker'),
            paint('[part~="day-selected"]', 'backgroundColor', 'active'),
        ],
    },
    {
        name: 'FileInput',
        field: 'fileInput',
        tag: 'wa-file-input',
        initial: (form) => form.fileInput,
        userValue: (file) => [file],
        externalValue: (file) => [file],
        external: (form, file) => {
            form.fileInput = [file];
        },
        interact: async (host, file) => {
            await page.elementLocator(part(host, 'input[type="file"]')).upload(file);
        },
        paints: [...surface('dropzone'), paint('[part~="dropzone-text"]', 'color', 'text')],
    },
];

for (const mode of ['wa-light', 'wa-dark']) {
    for (const [index, item] of cases.entries()) {
        test(`${item.name} binds real Inertia values and restores server and manual errors in ${mode}`, async () => {
            const form = matrixForm();
            const failed = reactive<{ value: boolean | string | readonly string[] }>({
                value: false,
            });
            const userFile = new File(['chosen locally'], 'chosen.txt', { type: 'text/plain' });
            const externalFile = new File(['external locally'], 'external.txt', {
                type: 'text/plain',
            });
            const container = mount(
                { render: () => h(Controls, { control: item.name, form, failed: failed.value }) },
                mode,
                ['block', 'flex', 'grid'][index % 3] ?? 'block',
            );
            const host = required(container, item.tag);
            await exerciseErrors({
                container,
                host,
                failed,
                hasHint: item.name !== 'DatePicker',
                paints: item.paints,
                setError: (messages) => form.setError(item.field, messages),
                clearErrors: () => form.clearErrors(),
                read: () => form.data()[item.field],
                initial: item.initial(form),
                userValue: item.userValue(userFile),
                externalValue: item.externalValue(externalFile),
                ...(item.name === 'DatePicker'
                    ? { nativeValues: [] }
                    : item.name === 'Combobox'
                      ? { nativeValues: [''] }
                      : {}),
                setExternal: () => item.external(form, externalFile),
                interact: (element) => item.interact(element, userFile),
            });
            if (item.name === 'FileInput') {
                expect(form.fileInput).toHaveLength(1);
                expect(form.fileInput[0]?.name).toBe('external.txt');
                expect(await form.fileInput[0]?.text()).toBe('external locally');
            }
        });
    }
}

test('Combobox clears a nullable owner against an explicit empty native reset default', async () => {
    const form = matrixForm();
    const container = mount(
        {
            render: () =>
                h(Controls, {
                    control: 'Combobox',
                    form,
                    failed: false,
                    emptySelectionDefault: true,
                }),
        },
        'wa-light',
        'block',
    );
    const host = required(container, 'wa-combobox');
    await ready(host);
    expect(Reflect.get(host, 'value')).toBe('one');
    expect(Reflect.get(host, 'defaultValue')).toBeNull();
    form.combobox = null;
    await ready(host);
    expect(form.data().combobox).toBeNull();
    expect(Reflect.get(host, 'value')).toBeNull();
});
