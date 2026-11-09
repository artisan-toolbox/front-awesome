import type { WaInputProps } from '@awesome.me/webawesome/dist/custom-elements-jsx.d.ts';
import type { HTMLAttributes } from 'vue';
import type { FormBindingProps } from './useFormBridge';

type InputImplementationProps =
    | 'did-ssr'
    | 'didSSR'
    | 'initialReflectedProperties'
    | 'internals'
    | 'assumeInteractionOn'
    | 'input'
    | 'valueHasChanged'
    | 'hasInteracted'
    | 'states'
    | 'emitInvalid'
    | 'form'
    | 'value'
    | 'oninput'
    | 'onchange'
    | 'onblur'
    | 'onfocus'
    | 'onwa-clear'
    | 'onwa-invalid';

export type InputAttributes = Omit<HTMLAttributes, keyof WaInputProps> &
    Omit<WaInputProps, InputImplementationProps> & {
        onWaClear?: WaInputProps['onwa-clear'];
        onWaInvalid?: WaInputProps['onwa-invalid'];
        value?: never;
    };

export type InputProps<T extends object> = InputAttributes & FormBindingProps<T>;

type BooleanInputKey = {
    [K in keyof WaInputProps]-?: NonNullable<WaInputProps[K]> extends boolean ? K : never;
}[keyof WaInputProps];

/** Presence attributes only. Autocorrect and spellcheck use enumerated values. */
export const inputBooleanAttributes = [
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
] as const satisfies readonly BooleanInputKey[];
