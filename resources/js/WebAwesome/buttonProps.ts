import type {
    WaButtonGroupProps,
    WaButtonProps,
} from '@awesome.me/webawesome/dist/custom-elements-jsx.d.ts';
import type { HTMLAttributes } from 'vue';

type InternalElementProps = 'did-ssr' | 'didSSR' | 'initialReflectedProperties' | 'internals';

type ButtonImplementationProps =
    | InternalElementProps
    | 'assumeInteractionOn'
    | 'button'
    | 'custom-error'
    | 'customError'
    | 'emitInvalid'
    | 'hasInteracted'
    | 'input'
    | 'invalid'
    | 'isIconButton'
    | 'labelSlot'
    | 'required'
    | 'states'
    | 'valueHasChanged';

type ButtonAliases =
    | 'formAction'
    | 'formEnctype'
    | 'formMethod'
    | 'formNoValidate'
    | 'formTarget'
    | 'onblur'
    | 'onfocus'
    | 'onwa-invalid'
    | 'withCaret'
    | 'withEnd'
    | 'withStart';

export interface ButtonProps
    extends
        HTMLAttributes,
        Omit<WaButtonProps, ButtonImplementationProps | ButtonAliases | 'form'> {
    form?: string;
    onWaInvalid?: WaButtonProps['onwa-invalid'];
}

export interface ButtonGroupProps
    extends
        HTMLAttributes,
        Omit<
            WaButtonGroupProps,
            InternalElementProps | 'defaultSlot' | 'disableRole' | 'hasOutlined'
        > {}
