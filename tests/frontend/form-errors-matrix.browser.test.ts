import { expect, test } from 'vite-plus/test';
import { reactive } from 'vue';
import Controls from './fixtures/form-errors-matrix/Controls.vue';
import { matrixForm } from './fixtures/form-errors-matrix/data';
import type { MatrixData } from './fixtures/form-errors-matrix/data';
import {
    arrow,
    exerciseErrors,
    fill,
    h,
    mount,
    paint,
    part,
    ready,
    required,
    surface,
    userEvent,
} from './fixtures/form-errors-matrix/browser';
import type { FieldValue, Paint } from './fixtures/form-errors-matrix/browser';
import '@artisan-toolbox/front-awesome/web-awesome.css';

type Form = ReturnType<typeof matrixForm>;
type Scenario = {
    name:
        | 'Input'
        | 'Checkbox'
        | 'Switch'
        | 'Textarea'
        | 'NumberInput'
        | 'RadioGroup'
        | 'Slider'
        | 'Rating'
        | 'OtpInput'
        | 'ColorPicker'
        | 'Select'
        | 'TagInput'
        | 'KnownDate'
        | 'TimeInput';
    field: keyof MatrixData;
    tag: string;
    initial: FieldValue;
    userValue: FieldValue;
    externalValue: FieldValue;
    external: (form: Form) => void;
    interact: (host: HTMLElement) => Promise<void>;
    paints: Paint[];
};
const cases: Scenario[] = [
    {
        name: 'Input',
        field: 'input',
        tag: 'wa-input',
        initial: 'Ada',
        userValue: 'Grace',
        externalValue: 'Katherine',
        external: (form) => {
            form.input = 'Katherine';
        },
        interact: (host) => fill(host, '[part~="input"]', 'Grace'),
        paints: [
            ...surface('input-wrapper'),
            paint('[part~="input"]', 'color', 'text'),
            paint('[part~="form-control-label"]', 'color', 'text'),
        ],
    },
    {
        name: 'Checkbox',
        field: 'checkbox',
        tag: 'wa-checkbox',
        initial: true,
        userValue: false,
        externalValue: true,
        external: (form) => {
            form.checkbox = true;
        },
        interact: (host) => userEvent.click(part(host, '[part~="control"]')),
        paints: [
            paint('[part~="control"]', 'backgroundColor', 'active'),
            paint('[part~="label"]', 'color', 'text'),
        ],
    },
    {
        name: 'Switch',
        field: 'switch',
        tag: 'wa-switch',
        initial: true,
        userValue: false,
        externalValue: true,
        external: (form) => {
            form.switch = true;
        },
        interact: (host) => userEvent.click(part(host, '[part~="control"]')),
        paints: [
            paint('[part~="control"]', 'backgroundColor', 'active'),
            paint('[part~="label"]', 'color', 'text'),
        ],
    },
    {
        name: 'Textarea',
        field: 'textarea',
        tag: 'wa-textarea',
        initial: 'Initial notes',
        userValue: 'Edited notes',
        externalValue: 'External notes',
        external: (form) => {
            form.textarea = 'External notes';
        },
        interact: (host) => fill(host, '[part~="textarea"]', 'Edited notes'),
        paints: [...surface('textarea-wrapper'), paint('[part~="textarea"]', 'color', 'text')],
    },
    {
        name: 'NumberInput',
        field: 'numberInput',
        tag: 'wa-number-input',
        initial: '1.50',
        userValue: '2.75',
        externalValue: '3.25',
        external: (form) => {
            form.numberInput = '3.25';
        },
        interact: (host) => fill(host, 'input', '2.75'),
        paints: [...surface('number-input'), paint('[part~="input"]', 'color', 'text')],
    },
    {
        name: 'RadioGroup',
        field: 'radioGroup',
        tag: 'wa-radio-group',
        initial: 'one',
        userValue: 'two',
        externalValue: 'one',
        external: (form) => {
            form.radioGroup = 'one';
        },
        interact: (host) => userEvent.click(required(host, 'wa-radio[value="two"]')),
        paints: [
            paint('light:wa-radio[value="one"] >>> [part~="control"]', 'borderColor', 'active'),
            paint('light:wa-radio[value="one"] >>> [part~="control"]', 'color', 'active'),
            paint('[part~="form-control-label"]', 'color', 'text'),
        ],
    },
    {
        name: 'Slider',
        field: 'slider',
        tag: 'wa-slider',
        initial: 5,
        userValue: 6,
        externalValue: 5,
        external: (form) => {
            form.slider = 5;
        },
        interact: (host) => arrow(host),
        paints: [
            paint('[part~="indicator"]', 'backgroundColor', 'active'),
            paint('[part~="label"]', 'color', 'text'),
        ],
    },
    {
        name: 'Rating',
        field: 'rating',
        tag: 'wa-rating',
        initial: 2,
        userValue: 3,
        externalValue: 2,
        external: (form) => {
            form.rating = 2;
        },
        interact: (host) => arrow(host),
        paints: [paint('.symbol-active', 'color', 'text'), paint('.symbols', 'color', 'text')],
    },
    {
        name: 'OtpInput',
        field: 'otpInput',
        tag: 'wa-otp-input',
        initial: '1234',
        userValue: '5678',
        externalValue: '4321',
        external: (form) => {
            form.otpInput = '4321';
        },
        interact: async (host) => {
            await userEvent.click(part(host, '[part~="segment"]'));
            await userEvent.keyboard('{ControlOrMeta>}a{/ControlOrMeta}5678');
        },
        paints: [...surface('segment'), paint('[part~="segment"]', 'color', 'text')],
    },
    {
        name: 'ColorPicker',
        field: 'colorPicker',
        tag: 'wa-color-picker',
        initial: '#112233',
        userValue: '#445566',
        externalValue: '#112233',
        external: (form) => {
            form.colorPicker = '#112233';
        },
        interact: async (host) => {
            await userEvent.click(part(host, '[part~="trigger"]'));
            await userEvent.click(part(host, '[part~="swatch"][aria-label="#445566"]'));
        },
        paints: [...surface('trigger'), paint('[part~="form-control-label"]', 'color', 'text')],
    },
    {
        name: 'Select',
        field: 'select',
        tag: 'wa-select',
        initial: 'one',
        userValue: 'two',
        externalValue: null,
        external: (form) => {
            form.select = null;
        },
        interact: async (host) => {
            await userEvent.click(part(host, '[part~="display-input"]'));
            await userEvent.click(required(host, 'wa-option[value="two"]'));
        },
        paints: [...surface('combobox'), paint('[part~="display-input"]', 'color', 'text')],
    },
    {
        name: 'TagInput',
        field: 'tagInput',
        tag: 'wa-tag-input',
        initial: ['one'],
        userValue: ['one', 'two'],
        externalValue: ['one'],
        external: (form) => {
            form.tagInput = ['one'];
        },
        interact: async (host) => {
            await fill(host, 'input', 'two');
            await userEvent.keyboard('{Enter}');
        },
        paints: [...surface('tag-input'), paint('[part~="input"]', 'color', 'text')],
    },
    {
        name: 'KnownDate',
        field: 'knownDate',
        tag: 'wa-known-date',
        initial: '2026-11-09',
        userValue: '2026-11-10',
        externalValue: '2026-11-12',
        external: (form) => {
            form.knownDate = '2026-11-12';
        },
        interact: (host) => fill(host, '[part~="field-input"][data-field="day"]', '10'),
        paints: [...surface('field-input'), paint('[part~="field-input"]', 'color', 'text')],
    },
    {
        name: 'TimeInput',
        field: 'timeInput',
        tag: 'wa-time-input',
        initial: '12:30',
        userValue: '13:30',
        externalValue: '14:45',
        external: (form) => {
            form.timeInput = '14:45';
        },
        interact: (host) => arrow(host, '[part~="segment"][data-segment="hour"]'),
        paints: [...surface('input-wrapper'), paint('[part~="segment"]', 'color', 'text')],
    },
];

for (const mode of ['wa-light', 'wa-dark']) {
    for (const [index, item] of cases.entries()) {
        test(`${item.name} binds real Inertia values and restores server and manual errors in ${mode}`, async () => {
            const form = matrixForm();
            const failed = reactive<{ value: boolean | string | readonly string[] }>({
                value: false,
            });
            const container = mount(
                { render: () => h(Controls, { control: item.name, form, failed: failed.value }) },
                mode,
                ['block', 'flex', 'grid'][index % 3] ?? 'block',
            );
            const host = required(container, item.tag);
            if (item.name === 'RadioGroup')
                await expect
                    .poll(() => Reflect.get(required(host, 'wa-radio[value="one"]'), 'checked'))
                    .toBe(true);
            await exerciseErrors({
                container,
                host,
                failed,
                hasHint: item.name !== 'Rating',
                paints: item.paints,
                setError: (messages) => form.setError(item.field, messages),
                clearErrors: () => form.clearErrors(),
                read: () => form.data()[item.field],
                initial: item.initial,
                userValue: item.userValue,
                externalValue: item.externalValue,
                setExternal: () => item.external(form),
                interact: item.interact,
            });
        });
    }
}

test.each(['p', 'label'])(
    'preserves native inline Rating geometry and %s markup after an HTML parser round trip',
    async (tag) => {
        const form = matrixForm();
        const container = mount(
            {
                render: () =>
                    h('span', [
                        h('wa-rating', { value: 2, label: 'Native rating' }),
                        h(Controls, { control: 'Rating', form, failed: 'Choose a score.' }),
                    ]),
            },
            'wa-light',
            'block',
        );
        const rating = required(container, '[data-testid="matrix-control"]');
        const native = required(container, 'wa-rating:not([data-testid])');
        await ready(rating);
        expect(rating.getBoundingClientRect().width).toBe(native.getBoundingClientRect().width);
        expect(rating.getBoundingClientRect().height).toBe(native.getBoundingClientRect().height);
        const frame = rating.parentElement;
        if (!frame) throw new Error('Expected Rating presentation frame.');
        const parsed = new DOMParser().parseFromString(
            `<${tag} id="sentence">Rating ${frame.outerHTML}</${tag}>`,
            'text/html',
        );
        const sentence = parsed.querySelector('#sentence');
        expect(sentence?.querySelector('wa-rating')).not.toBeNull();
        expect(sentence?.querySelector('[role="alert"]')?.textContent).toBe('Choose a score.');
    },
);

test('Select clears a nullable owner against an explicit empty native reset default', async () => {
    const form = matrixForm();
    const container = mount(
        {
            render: () =>
                h(Controls, {
                    control: 'Select',
                    form,
                    failed: false,
                    emptySelectionDefault: true,
                }),
        },
        'wa-light',
        'block',
    );
    const host = required(container, 'wa-select');
    await ready(host);
    expect(Reflect.get(host, 'value')).toBe('one');
    expect(Reflect.get(host, 'defaultValue')).toBeNull();
    form.select = null;
    await ready(host);
    expect(form.data().select).toBeNull();
    expect(Reflect.get(host, 'value')).toBeNull();
});
