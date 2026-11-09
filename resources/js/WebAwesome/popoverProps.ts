import type { WaPopoverProps } from '@awesome.me/webawesome/dist/custom-elements-jsx.d.ts';
import type { HTMLAttributes } from 'vue';

type PopoverImplementationProps =
    | 'did-ssr'
    | 'didSSR'
    | 'initialReflectedProperties'
    | 'internals'
    | 'dialog'
    | 'body'
    | 'popup'
    | 'anchor'
    | 'onwa-show'
    | 'onwa-after-show'
    | 'onwa-hide'
    | 'onwa-after-hide';

export interface PopoverProps
    extends HTMLAttributes, Omit<WaPopoverProps, PopoverImplementationProps> {
    slot?: HTMLElement['slot'];
    onWaShow?: WaPopoverProps['onwa-show'];
    onWaAfterShow?: WaPopoverProps['onwa-after-show'];
    onWaHide?: WaPopoverProps['onwa-hide'];
    onWaAfterHide?: WaPopoverProps['onwa-after-hide'];
}
