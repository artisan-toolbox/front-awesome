import { reactive, shallowReactive } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { expect, expectTypeOf, test } from 'vite-plus/test';
import { useFormBridge } from '@artisan-toolbox/front-awesome';
import type {
    CompatibleField,
    ControlBindingProps,
    ControlBridgeOptions,
    FormBridge,
    FormBridgeFailed,
    FormBridgeValue,
} from '@artisan-toolbox/front-awesome';

const listener = () => {};
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);
const isString = (value: unknown): value is string => typeof value === 'string';
const isStrings = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every(isString);
const booleanOptions = {
    acceptsWrite: isBoolean,
    acceptsRead: isBoolean,
    emitValue: listener,
    componentName: 'Checkbox',
    optional: true,
    binding: () => ({}),
} satisfies ControlBridgeOptions<boolean, boolean>;

test('keeps optional native controls distinct from required legacy Input bindings', () => {
    const field = useFormBridge({}, booleanOptions);
    expectTypeOf(field).toEqualTypeOf<FormBridge<boolean, boolean>>();
    expect(field.source.value.kind).toBe('native');
    expect(field.isBound.value).toBe(false);
    expect(field.errors.value).toEqual([]);
    expect(() => field.value.value).toThrow('Front Awesome Checkbox has no bound value.');
    expect(() => {
        field.value.value = true;
    }).toThrow('Front Awesome Checkbox has no bound value.');
    expect(() => useFormBridge({}, { emitValue: listener }).source.value).toThrow(
        'Front Awesome Input requires v-model',
    );
    expect(useFormBridge({ form: 'checkout' }, booleanOptions).source.value.kind).toBe('native');
});

test('infers distinct setter and commit domains while retaining legacy text inference', () => {
    const initial = new Date(2026, 10, 9);
    const props = { modelValue: initial };
    const options = {
        acceptsWrite: (value: unknown): value is Date | string | null =>
            value instanceof Date || isString(value) || value === null,
        acceptsRead: isString,
        emitValue: listener,
        binding: () => ({ modelValue: initial, 'onUpdate:modelValue': listener }),
    };
    const rich = useFormBridge(props, options);
    expectTypeOf(rich).toEqualTypeOf<FormBridge<Date | string | null, string>>();
    expect(rich.value.value).toBe(initial);
    const legacy = useFormBridge(
        { modelValue: 'First' },
        {
            emitValue: listener,
            binding: () => ({ modelValue: 'First', 'onUpdate:modelValue': listener }),
        },
    );
    expectTypeOf(legacy).toEqualTypeOf<FormBridge<FormBridgeValue, FormBridgeValue>>();
    expect(legacy.value.value).toBe('First');
});

test('connects boolean models in both directions and validates both boundaries', () => {
    const props = reactive({ modelValue: false });
    const updates: boolean[] = [];
    const field = useFormBridge(props, {
        ...booleanOptions,
        binding: () => ({ modelValue: props.modelValue, 'onUpdate:modelValue': listener }),
        emitValue: (next) => updates.push(next),
    });
    expect(field.source.value.kind).toBe('model');
    expect(field.value.value).toBe(false);
    props.modelValue = true;
    expect(field.value.value).toBe(true);
    field.value.value = false;
    expect(updates).toEqual([false]);
    const untyped: { modelValue: unknown } = { modelValue: 'false' };
    const invalid = useFormBridge(untyped, {
        ...booleanOptions,
        binding: () => ({ modelValue: 'false', 'onUpdate:modelValue': listener }),
    });
    expect(() => invalid.source.value).toThrow(
        'Front Awesome Checkbox received an unsupported value',
    );
    expect(() => {
        // @ts-expect-error A boolean control cannot receive a native string.
        field.value.value = 'false';
    }).toThrow('unsupported native value');
});

test('validates explicit undefined against the actual model domain', () => {
    expect(
        () =>
            useFormBridge(
                { modelValue: undefined },
                {
                    ...booleanOptions,
                    binding: () => ({ modelValue: undefined, 'onUpdate:modelValue': listener }),
                },
            ).source.value,
    ).toThrow('unsupported value');
    const acceptsOptional = (value: unknown): value is boolean | undefined =>
        value === undefined || isBoolean(value);
    const field = useFormBridge(
        { modelValue: undefined },
        {
            ...booleanOptions,
            acceptsWrite: acceptsOptional,
            binding: () => ({ modelValue: undefined, 'onUpdate:modelValue': listener }),
        },
    );
    expect(field.source.value.kind).toBe('model');
    expect(field.value.value).toBeUndefined();
});

test('rejects incomplete listener arrays instead of treating a model as writable', () => {
    const listeners = [listener, listener];
    const options = {
        ...booleanOptions,
        binding: () => ({ modelValue: false, 'onUpdate:modelValue': listeners }),
    };
    expect(useFormBridge({ modelValue: false }, options).value.value).toBe(false);
    Reflect.deleteProperty(listeners, '0');
    expect(() => useFormBridge({ modelValue: false }, options).source.value).toThrow(
        'requires an update:modelValue listener',
    );
});

test.each([{ listeners: [] }, { listeners: [listener, false] }, { listeners: [undefined] }])(
    'rejects unusable update listeners (%j)',
    ({ listeners }) => {
        expect(
            () =>
                useFormBridge(
                    { modelValue: false },
                    {
                        ...booleanOptions,
                        binding: () => ({ modelValue: false, 'onUpdate:modelValue': listeners }),
                    },
                ).source.value,
        ).toThrow('requires an update:modelValue listener');
    },
);

test('accepts equivalent model aliases and rejects competing current values', () => {
    const binding = shallowReactive<Record<string, unknown>>({
        modelValue: false,
        'model-value': false,
        'onUpdate:modelValue': listener,
    });
    const field = useFormBridge(
        { modelValue: false },
        {
            ...booleanOptions,
            binding: () => binding,
        },
    );
    expect(field.value.value).toBe(false);
    binding['model-value'] = true;
    expect(() => field.source.value).toThrow('conflicting aliases');
});

test.each([
    { accepted: false, errors: {} },
    { accepted: false, data: () => ({ accepted: false }) },
    { accepted: false, data: () => ({ accepted: false }), errors: null },
])('rejects form-like objects without the required Inertia data and error APIs (%j)', (form) => {
    expect(() => useFormBridge({ form, field: 'accepted' }, booleanOptions).value.value).toThrow(
        'requires an Inertia form',
    );
});

test('writes numeric data leaves without coercion or path creation', () => {
    const form = useForm({ profile: { score: 3 }, numbers: [1, 2] });
    const props = reactive({ form, field: 'profile.score' });
    const field = useFormBridge(props, {
        acceptsWrite: isNumber,
        acceptsRead: isNumber,
        emitValue: listener,
        binding: () => ({}),
        componentName: 'Rating',
    });
    expect(field.value.value).toBe(3);
    field.value.value = 4;
    expect(form.profile.score).toBe(4);
    form.profile = { score: 2 };
    expect(field.value.value).toBe(2);
    props.field = 'numbers.1';
    field.value.value = 7;
    expect(form.numbers).toEqual([1, 7]);
    field.value.value = 0;
    expect(field.value.value).toBe(0);
    for (const value of [NaN, Infinity, -Infinity])
        expect(() => {
            field.value.value = value;
        }).toThrow('unsupported native value');
    props.field = 'numbers.3';
    expect(() => field.source.value).toThrow('cannot access data field "numbers.3"');
    expect(form.numbers).toHaveLength(2);
});

test('preserves array, Date, File, and FormData references at the setter boundary', () => {
    const items = ['one', 'two'];
    const date = new Date('2026-01-01T12:00:00Z');
    const file = new File(['hello'], 'hello.txt');
    const data = new FormData();
    data.append('tag', 'one');
    const acceptsRich = (value: unknown): value is string[] | Date | File | FormData =>
        isStrings(value) ||
        value instanceof Date ||
        value instanceof File ||
        value instanceof FormData;
    for (const original of [items, date, file, data]) {
        const props = shallowReactive({ modelValue: original });
        const field = useFormBridge(props, {
            acceptsWrite: acceptsRich,
            acceptsRead: isStrings,
            emitValue: listener,
            binding: () => ({ modelValue: original, 'onUpdate:modelValue': listener }),
        });
        expect(field.value.value).toBe(original);
    }
});

test('accepts richer external dates while committing the canonical native string', () => {
    const date = new Date('2026-01-01T12:00:00Z');
    const form = useForm<{ date: Date | string | null }>({ date });
    const field = useFormBridge(
        { form, field: 'date' },
        {
            acceptsWrite: (value: unknown): value is Date | string | null =>
                value instanceof Date || isString(value) || value === null,
            acceptsRead: isString,
            emitValue: listener,
            binding: () => ({}),
        },
    );
    expect(field.value.value).toBe(form.date);
    field.value.value = '2026-02-01';
    expect(form.date).toBe('2026-02-01');
    form.reset();
    expect(field.value.value).toBeInstanceOf(Date);
});

test('accepts array-valued form leaves and keeps replacements and reset live', () => {
    const form = useForm({ tags: ['one'] });
    const field = useFormBridge(
        { form, fieldName: 'tags' },
        {
            acceptsWrite: isStrings,
            acceptsRead: isStrings,
            emitValue: listener,
            binding: () => ({}),
        },
    );
    const changed = ['two'];
    field.value.value = changed;
    expect(form.tags).toEqual(changed);
    form.tags = ['three'];
    expect(field.value.value).toEqual(['three']);
    form.reset();
    expect(field.value.value).toEqual(['one']);
});

test('merges all manual errors with Inertia errors without hiding or clearing either source', () => {
    const form = useForm({ accepted: false });
    form.setError('accepted', ['Required', '<b>Unsafe markup</b>', 'Required']);
    const props = reactive<{ form: typeof form; field: string; failed: FormBridgeFailed }>({
        form,
        field: 'accepted',
        failed: ['Required', 'Manual', '', ' '],
    });
    const field = useFormBridge(props, booleanOptions);
    expect(field.errors.value).toEqual(['Required', '<b>Unsafe markup</b>', 'Manual']);
    field.value.value = true;
    expect(field.errors.value).toHaveLength(3);
    props.failed = false;
    expect(field.errors.value).toEqual(['Required', '<b>Unsafe markup</b>']);
    expect(field.invalid.value).toBe(true);
    form.clearErrors();
    expect(field.invalid.value).toBe(false);
    props.failed = true;
    expect(field.invalid.value).toBe(true);
    expect(field.errors.value).toEqual([]);
    props.failed = 'Manual';
    expect(field.errors.value).toEqual(['Manual']);
});

test('supports equal field aliases and rejects conflicting or incomplete aliases', () => {
    const form = useForm({ accepted: false, other: true });
    expect(
        useFormBridge({ form, field: 'accepted', fieldName: 'accepted' }, booleanOptions).value
            .value,
    ).toBe(false);
    expect(
        () =>
            useFormBridge({ form, field: 'accepted', fieldName: 'other' }, booleanOptions).source
                .value,
    ).toThrow('conflicting aliases');
    for (const props of [
        { field: 'accepted' },
        { form },
        { field: undefined },
        { fieldName: undefined },
    ]) {
        expect(
            () => useFormBridge(props, { ...booleanOptions, binding: () => props }).source.value,
        ).toThrow();
    }
    expect(
        () =>
            useFormBridge(
                { form, fieldName: 'accepted' },
                {
                    ...booleanOptions,
                    binding: () => ({ fieldName: 'accepted', 'field-name': 'other' }),
                },
            ).source.value,
    ).toThrow('conflicting aliases');
});

test.each([
    '',
    '__proto__.x',
    'prototype.x',
    'constructor.x',
    'profile..accepted',
    'errors',
    'processing',
    'reset',
    'profile',
    'users.length',
    'users.01.accepted',
    'profile.missing',
])('rejects unsafe, unavailable, metadata, and wrong-domain leaves (%s)', (path) => {
    const form = useForm({ profile: { accepted: false }, users: [{ accepted: true }] });
    expect(() => useFormBridge({ form, field: path }, booleanOptions).source.value).toThrow(
        'Front Awesome Checkbox',
    );
});

test('rejects numeric-looking own array properties that are not array indices', () => {
    const form = useForm({ flags: [false] });
    Reflect.set(form.flags, '4294967295', true);
    expect(
        () => useFormBridge({ form, field: 'flags.4294967295' }, booleanOptions).source.value,
    ).toThrow('cannot access data field');
});

test('tracks native-to-model transitions and model removal from raw binding presence', () => {
    const binding = shallowReactive<Record<string, unknown>>({});
    const props = shallowReactive<{ modelValue?: boolean }>({});
    const field = useFormBridge(props, { ...booleanOptions, binding: () => binding });
    expect(field.source.value.kind).toBe('native');
    props.modelValue = false;
    binding.modelValue = false;
    binding['onUpdate:modelValue'] = listener;
    expect(field.value.value).toBe(false);
    expect(field.isBound.value).toBe(true);
    delete binding.modelValue;
    delete binding['onUpdate:modelValue'];
    expect(field.source.value.kind).toBe('native');
    expect(field.isBound.value).toBe(false);
});

test('rejects model/form overlap, read-only default models, native aliases, and modifiers', () => {
    const form = useForm({ accepted: false });
    const props = { form, field: 'accepted', modelValue: false };
    expect(
        () =>
            useFormBridge(props, {
                ...booleanOptions,
                binding: () => ({ modelValue: false, 'onUpdate:modelValue': listener }),
            }).source.value,
    ).toThrow('not both');
    expect(
        () =>
            useFormBridge(
                { modelValue: false },
                { ...booleanOptions, binding: () => ({ modelValue: false }) },
            ).source.value,
    ).toThrow('requires an update:modelValue listener');
    expect(
        () =>
            useFormBridge(
                { modelValue: false },
                {
                    ...booleanOptions,
                    nativeAliases: ['checked'],
                    binding: () => ({
                        modelValue: false,
                        checked: false,
                        'onUpdate:modelValue': listener,
                    }),
                },
            ).source.value,
    ).toThrow('current value');
    expect(
        () =>
            useFormBridge(
                { modelValue: false },
                {
                    ...booleanOptions,
                    binding: () => ({
                        modelValue: false,
                        modelModifiers: { trim: true },
                        'onUpdate:modelValue': listener,
                    }),
                },
            ).source.value,
    ).toThrow('unmodified v-model');
});

test('keeps named state models independent from primary form and errors', () => {
    const props = reactive({
        page: 2,
        form: useForm({ title: 'A' }),
        field: 'title',
        failed: true,
    });
    const updates: number[] = [];
    const options = {
        acceptsWrite: isNumber,
        acceptsRead: isNumber,
        emitValue: (value: number) => updates.push(value),
        modelName: 'page',
        allowForm: false,
        optional: true,
        nativeAliases: ['page'],
        binding: () => ({ page: props.page, 'onUpdate:page': listener }),
    };
    const field = useFormBridge(props, options);
    expect(field.value.value).toBe(2);
    field.value.value = 3;
    expect(updates).toEqual([3]);
    expect(field.errors.value).toEqual([]);
    expect(field.invalid.value).toBe(false);
    expect(
        useFormBridge(props, { ...options, binding: () => ({ page: 2 }) }).source.value.kind,
    ).toBe('native');
});

test('requires bidirectionally compatible leaves without distributing unions', () => {
    type Data = {
        text: string;
        richDate: Date | string | null;
        date: Date;
        tags: string[];
        mixed: string | number;
        bool: boolean;
        impossible: never;
        unknown: unknown;
        literal: 'fixed';
    };
    expectTypeOf<CompatibleField<Data, Date | string | null, string>>().toEqualTypeOf<
        'text' | 'richDate' | `tags.${number}`
    >();
    expectTypeOf<CompatibleField<Data, string | string[], string | string[]>>().toBeNever();
    expectTypeOf<CompatibleField<Data, string[], string[]>>().toEqualTypeOf<'tags'>();
    expectTypeOf<CompatibleField<Data, boolean, boolean>>().toEqualTypeOf<'bool'>();
    const native: ControlBindingProps<Data, boolean, boolean> = {};
    const model: ControlBindingProps<Data, boolean, boolean> = {
        modelValue: false,
        form: 'native-form',
    };
    const form = useForm({ bool: false });
    const bound: ControlBindingProps<{ bool: boolean }, boolean, boolean> = { form, field: 'bool' };
    // @ts-expect-error Inertia forms and Vue models are mutually exclusive.
    const competing: ControlBindingProps<{ bool: boolean }, boolean, boolean> = {
        form,
        field: 'bool',
        modelValue: false,
    };
    // @ts-expect-error Methods and metadata cannot be form data leaves.
    const metadata: CompatibleField<{ bool: boolean }, boolean, boolean> = 'processing';
    void [native, model, bound, competing, metadata];
});

function bindDateField<T extends object>(
    props: ControlBindingProps<T, Date | string | null, string>,
) {
    return props;
}

test('infers form data independently from the requested field', () => {
    const compatible = useForm<{ date: string | Date | null }>({ date: null });
    const dateOnly = useForm({ date: new Date() });
    bindDateField({ form: compatible, field: 'date' });
    // @ts-expect-error The field cannot widen Date-only data to accept native strings.
    bindDateField({ form: dateOnly, field: 'date' });
});
