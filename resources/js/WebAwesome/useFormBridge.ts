import { computed, getCurrentInstance, onBeforeUpdate, shallowRef } from 'vue';
import type { ComputedRef, WritableComputedRef } from 'vue';
import type { FormDataKeys, FormDataValues } from '@inertiajs/core';
import type { InertiaForm } from '@inertiajs/vue3';

export type FormBridgeValue = string | null | undefined;
export type FormBridgeFailed = boolean | string | readonly string[];

export type TextFieldName<T extends object> = {
    [K in FormDataKeys<T>]: FormDataValues<T, K> extends FormBridgeValue ? K : never;
}[FormDataKeys<T>];

/** A field accepts every native read value and provides only supported setter values. */
export type CompatibleField<T extends object, Write, Read> = {
    [K in FormDataKeys<T>]: 0 extends 1 & FormDataValues<T, K>
        ? never
        : [FormDataValues<T, K>] extends [never]
          ? never
          : [FormDataValues<T, K>] extends [Write]
            ? [Read] extends [FormDataValues<T, K>]
                ? K
                : never
            : never;
}[FormDataKeys<T>];

export type FormFieldAlias<K extends string> =
    | { field: K; fieldName?: K }
    | { field?: never; fieldName: K };

export type FormBindingProps<T extends object> = { failed?: FormBridgeFailed } & (
    | { modelValue: FormBridgeValue; form?: string; field?: never; fieldName?: never }
    | ({ modelValue?: never; form: InertiaForm<T> } & FormFieldAlias<TextFieldName<T>>)
);

type BoundCurrentKeys<CurrentKey extends string> = { [Key in CurrentKey]?: never };

export type ControlBindingProps<
    T extends object,
    Write,
    Read,
    CurrentKey extends string = never,
> = { failed?: FormBridgeFailed } & (
    | { modelValue?: never; form?: string; field?: never; fieldName?: never }
    | ({
          modelValue: Write;
          form?: string;
          field?: never;
          fieldName?: never;
      } & /* @vue-ignore */ BoundCurrentKeys<CurrentKey>)
    | ({ modelValue?: never; form: InertiaForm<T> } & FormFieldAlias<
          CompatibleField<NoInfer<T>, Write, Read>
      > &
          /* @vue-ignore */ BoundCurrentKeys<CurrentKey>)
);

export interface ControlBridgeProps {
    modelValue?: unknown;
    form?: unknown;
    field?: unknown;
    fieldName?: unknown;
    failed?: FormBridgeFailed;
}

interface BridgeOptions {
    emitValue: (value: FormBridgeValue) => void;
    /** Raw component props distinguish explicit undefined from an absent binding. */
    binding?: () => Record<string, unknown> | null;
}

export interface ControlBridgeOptions<Write, Read> {
    acceptsWrite: (value: unknown) => value is Write;
    acceptsRead: (value: unknown) => value is Read;
    emitValue: (value: Read) => void;
    binding?: () => Record<string, unknown> | null;
    modelName?: string;
    componentName?: string;
    /** Permit a native control with no Vue model or Inertia source. */
    optional?: boolean;
    /** State models ignore the primary control's form and validation presentation. */
    allowForm?: boolean;
    nativeAliases?: readonly string[];
}

export type FormBridgeSource<Write, Read> =
    | { kind: 'native' }
    | { kind: 'model'; name: string; current: () => Write; commit: (value: Read) => void }
    | {
          kind: 'form';
          form: Record<string, unknown>;
          path: string;
          current: () => Write;
          commit: (value: Read) => void;
      };

export interface FormBridge<Write, Read> {
    source: ComputedRef<FormBridgeSource<Write, Read>>;
    value: WritableComputedRef<Write, Read>;
    errors: ComputedRef<readonly string[]>;
    invalid: ComputedRef<boolean>;
    isBound: ComputedRef<boolean>;
}

function record(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isTextValue(value: unknown): value is FormBridgeValue {
    return typeof value === 'string' || value === null || value === undefined;
}

function kebab(name: string) {
    return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function fieldAt(root: unknown, path: string, component: string) {
    const segments = path.split('.');
    let container = root;
    for (const [index, key] of segments.entries()) {
        if (
            !key ||
            ['__proto__', 'prototype', 'constructor'].includes(key) ||
            !record(container) ||
            !Object.hasOwn(container, key) ||
            (Array.isArray(container) &&
                (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= 2 ** 32 - 1))
        ) {
            throw new Error(`Front Awesome ${component} cannot access data field "${path}".`);
        }
        if (index === segments.length - 1) return { container, key };
        container = container[key];
    }
    throw new Error(`Front Awesome ${component} requires a nonempty fieldName.`);
}

function messages(value: unknown): string[] {
    return (Array.isArray(value) ? value : [value]).filter(
        (message): message is string => typeof message === 'string' && message.trim().length > 0,
    );
}

/** Resolve a native, Vue model, or existing Inertia data source without touching the element. */
export function useFormBridge<Write, Read>(
    props: object,
    options: ControlBridgeOptions<Write, Read>,
): FormBridge<Write, Read>;
/** Preserve the required, text-only Input contract for existing callers. */
export function useFormBridge(
    props: ControlBridgeProps,
    options: BridgeOptions & { acceptsWrite?: never; acceptsRead?: never },
): FormBridge<FormBridgeValue, FormBridgeValue>;
export function useFormBridge<Write, Read>(
    props: object,
    options: BridgeOptions | ControlBridgeOptions<Write, Read>,
) {
    if ('acceptsWrite' in options) return createBridge(props, options);
    return createBridge(props, {
        ...options,
        acceptsWrite: isTextValue,
        acceptsRead: isTextValue,
        componentName: 'Input',
        textOnly: true,
    });
}

function createBridge<Write, Read>(
    props: object,
    options: ControlBridgeOptions<Write, Read> & { textOnly?: boolean },
): FormBridge<Write, Read> {
    const prop = (name: string): unknown => Reflect.get(props, name);
    const instance = getCurrentInstance();
    const revision = shallowRef(0);
    if (instance) onBeforeUpdate(() => revision.value++);
    const component = options.componentName ?? 'Control';
    const modelName = options.modelName ?? 'modelValue';
    const modelAlias = kebab(modelName);
    const prefix = `Front Awesome ${component}`;

    function writeValue(value: unknown): Write {
        if (!options.acceptsWrite(value)) {
            throw new Error(
                options.textOnly
                    ? `${prefix} requires a string, null, or undefined value.`
                    : `${prefix} received an unsupported value for "${modelName}".`,
            );
        }
        return value;
    }

    function readValue(value: unknown): Read {
        if (!options.acceptsRead(value)) {
            throw new Error(
                options.textOnly
                    ? `${prefix} requires a string, null, or undefined value.`
                    : `${prefix} received an unsupported native value for "${modelName}".`,
            );
        }
        return value;
    }

    function dataField(form: Record<string, unknown>, path: string) {
        if (typeof form.data !== 'function' || !record(form.errors)) {
            throw new Error(`${prefix} requires an Inertia form and a nonempty fieldName.`);
        }
        const data = fieldAt(form.data(), path, component);
        writeValue(data.container[data.key]);
        const live = fieldAt(form, path, component);
        writeValue(live.container[live.key]);
        return live;
    }

    const source = computed<FormBridgeSource<Write, Read>>(() => {
        void revision.value;
        const binding = options.binding?.() ?? instance?.vnode.props ?? {};
        const hasModel = Object.hasOwn(binding, modelName) || Object.hasOwn(binding, modelAlias);
        const form = options.allowForm === false ? undefined : prop('form');
        const field = options.allowForm === false ? undefined : prop('field');
        const fieldName = options.allowForm === false ? undefined : prop('fieldName');
        const hasField =
            options.allowForm !== false &&
            (field !== undefined ||
                fieldName !== undefined ||
                ['field', 'fieldName', 'field-name'].some((name) => Object.hasOwn(binding, name)));
        const rawFieldAliases =
            options.allowForm === false
                ? []
                : ['field', 'fieldName', 'field-name'].filter((name) =>
                      Object.hasOwn(binding, name),
                  );
        const firstFieldAlias = rawFieldAliases[0];
        if (
            firstFieldAlias !== undefined &&
            rawFieldAliases.some((name) => !Object.is(binding[name], binding[firstFieldAlias]))
        ) {
            throw new Error(`${prefix} received conflicting aliases for "fieldName".`);
        }
        if (field !== undefined && fieldName !== undefined && field !== fieldName) {
            throw new Error(`${prefix} received conflicting aliases for "fieldName".`);
        }
        const path =
            field ??
            fieldName ??
            (firstFieldAlias === undefined ? undefined : binding[firstFieldAlias]);
        if (
            Object.hasOwn(binding, modelName) &&
            Object.hasOwn(binding, modelAlias) &&
            binding[modelName] !== binding[modelAlias]
        ) {
            throw new Error(`${prefix} received conflicting aliases for "${modelAlias}".`);
        }
        const bound = hasModel || record(form);
        if (
            bound &&
            options.nativeAliases?.some(
                (alias) =>
                    alias !== modelName && alias !== modelAlias && Object.hasOwn(binding, alias),
            )
        ) {
            throw new Error(`${prefix} uses v-model or form for its current value.`);
        }
        const modifiersName =
            modelName === 'modelValue' ? 'modelModifiers' : `${modelName}Modifiers`;
        const modifiers = binding[modifiersName] ?? binding[kebab(modifiersName)];
        if (hasModel && record(modifiers) && Object.keys(modifiers).length > 0) {
            throw new Error(`${prefix} requires unmodified v-model.`);
        }
        if (record(form)) {
            if (hasModel)
                throw new Error(
                    `${prefix} accepts either v-model or form and fieldName, not both.`,
                );
            if (typeof path !== 'string' || !path) {
                throw new Error(`${prefix} requires an Inertia form and a nonempty fieldName.`);
            }
            dataField(form, path);
            return {
                kind: 'form',
                form,
                path,
                current: () => {
                    const field = dataField(form, path);
                    return writeValue(field.container[field.key]);
                },
                commit: (next) => {
                    const value = readValue(next);
                    const field = dataField(form, path);
                    field.container[field.key] = value;
                },
            };
        }
        if (hasField || (form !== undefined && typeof form !== 'string')) {
            throw new Error(`${prefix} requires v-model or an Inertia form with fieldName.`);
        }
        const listener = binding[`onUpdate:${modelName}`] ?? binding[`onUpdate:${modelAlias}`];
        const writable =
            typeof listener === 'function' ||
            (Array.isArray(listener) &&
                listener.length > 0 &&
                Array.from(listener).every((item) => typeof item === 'function'));
        if (!hasModel || (modelName !== 'modelValue' && !writable && options.optional)) {
            if (options.optional) return { kind: 'native' };
            throw new Error(`${prefix} requires v-model or an Inertia form with fieldName.`);
        }
        if (!writable)
            throw new Error(`${prefix} v-model requires an update:${modelName} listener.`);
        const current = () => writeValue(record(props) ? props[modelName] : undefined);
        current();
        return {
            kind: 'model',
            name: modelName,
            current,
            commit: (next) => options.emitValue(readValue(next)),
        };
    });
    const value = computed<Write, Read>({
        get() {
            const current = source.value;
            if (current.kind === 'native') throw new Error(`${prefix} has no bound value.`);
            return current.current();
        },
        set(next) {
            const current = source.value;
            if (current.kind === 'native') throw new Error(`${prefix} has no bound value.`);
            current.commit(next);
        },
    });
    const errors = computed<readonly string[]>(() => {
        const current = source.value;
        if (options.allowForm === false) return [];
        const bag = current.kind === 'form' ? current.form.errors : undefined;
        const inherited = current.kind === 'form' && record(bag) ? messages(bag[current.path]) : [];
        return [...new Set([...inherited, ...messages(prop('failed'))])];
    });
    const invalid = computed(
        () => errors.value.length > 0 || (options.allowForm !== false && prop('failed') === true),
    );
    return {
        source,
        value,
        errors,
        invalid,
        isBound: computed(() => source.value.kind !== 'native'),
    };
}
