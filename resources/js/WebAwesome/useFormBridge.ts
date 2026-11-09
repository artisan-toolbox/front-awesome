import { computed, getCurrentInstance, onBeforeUpdate, shallowRef } from 'vue';
import type { FormDataKeys, FormDataValues } from '@inertiajs/core';
import type { InertiaForm } from '@inertiajs/vue3';

export type FormBridgeValue = string | null | undefined;

export type TextFieldName<T extends object> = {
    [K in FormDataKeys<T>]: FormDataValues<T, K> extends FormBridgeValue ? K : never;
}[FormDataKeys<T>];

export type FormBindingProps<T extends object> =
    | { modelValue: FormBridgeValue; form?: string; fieldName?: never }
    | { modelValue?: never; form: InertiaForm<T>; fieldName: TextFieldName<T> };

interface BridgeProps {
    modelValue?: FormBridgeValue;
    form?: string | object;
    fieldName?: string;
}

interface BridgeOptions {
    emitValue: (value: FormBridgeValue) => void;
    /** Raw component props distinguish an explicit undefined model from an absent binding. */
    binding?: () => Record<string, unknown> | null;
}

function record(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function textValue(value: unknown): FormBridgeValue {
    if (typeof value !== 'string' && value !== null && value !== undefined) {
        throw new Error('Front Awesome Input requires a string, null, or undefined value.');
    }
    return value;
}

function fieldAt(root: unknown, path: string) {
    const segments = path.split('.');
    let container = root;
    for (const [index, key] of segments.entries()) {
        if (
            !key ||
            ['__proto__', 'prototype', 'constructor'].includes(key) ||
            !record(container) ||
            !Object.hasOwn(container, key) ||
            (Array.isArray(container) && !/^(0|[1-9]\d*)$/.test(key))
        ) {
            throw new Error(`Front Awesome Input cannot access data field "${path}".`);
        }
        if (index === segments.length - 1) {
            textValue(container[key]);
            return { container, key };
        }
        container = container[key];
    }
    throw new Error('Front Awesome Input requires a nonempty fieldName.');
}

/** Connect a text control to exactly one Vue model or existing Inertia data leaf. */
export function useFormBridge(props: BridgeProps, options: BridgeOptions) {
    const instance = getCurrentInstance();
    const revision = shallowRef(0);
    if (instance) {
        onBeforeUpdate(() => revision.value++);
    }

    function source() {
        void revision.value;
        const binding = options.binding?.() ?? instance?.vnode.props ?? {};
        const hasModel =
            Object.hasOwn(binding, 'modelValue') || Object.hasOwn(binding, 'model-value');
        const form = props.form;
        if (record(form)) {
            if (hasModel) {
                throw new Error(
                    'Front Awesome Input accepts either v-model or form and fieldName, not both.',
                );
            }
            const path = props.fieldName;
            if (
                typeof path !== 'string' ||
                !path ||
                typeof form.data !== 'function' ||
                !record(form.errors)
            ) {
                throw new Error(
                    'Front Awesome Input requires an Inertia form and a nonempty fieldName.',
                );
            }
            // data() limits traversal to user data, excluding Inertia methods and metadata.
            fieldAt(form.data(), path);
            const field = fieldAt(form, path);
            return { kind: 'form' as const, form, path, ...field };
        }
        if (
            !hasModel ||
            props.fieldName !== undefined ||
            (form !== undefined && typeof form !== 'string')
        ) {
            throw new Error(
                'Front Awesome Input requires v-model or an Inertia form with fieldName.',
            );
        }
        const listener = binding['onUpdate:modelValue'] ?? binding['onUpdate:model-value'];
        if (
            typeof listener !== 'function' &&
            !(
                Array.isArray(listener) &&
                listener.length > 0 &&
                listener.every((item) => typeof item === 'function')
            )
        ) {
            throw new Error('Front Awesome Input v-model requires an update:modelValue listener.');
        }
        return { kind: 'model' as const };
    }

    const value = computed({
        get() {
            const current = source();
            return textValue(
                current.kind === 'model' ? props.modelValue : current.container[current.key],
            );
        },
        set(next: FormBridgeValue) {
            textValue(next);
            const current = source();
            if (current.kind === 'model') {
                options.emitValue(next);
            } else {
                current.container[current.key] = next;
            }
        },
    });
    const errors = computed<readonly string[]>(() => {
        const current = source();
        if (current.kind === 'model') {
            return [];
        }
        const bag = current.form.errors;
        const error = record(bag) ? bag[current.path] : undefined;
        return (Array.isArray(error) ? error : [error]).filter(
            (message): message is string =>
                typeof message === 'string' && message.trim().length > 0,
        );
    });
    return { value, errors, invalid: computed(() => errors.value.length > 0) };
}
