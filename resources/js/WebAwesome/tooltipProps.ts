import type { WaTooltipProps } from '@awesome.me/webawesome/dist/custom-elements-jsx.d.ts';
import type { HTMLAttributes } from 'vue';

type TooltipImplementationProps =
    | 'did-ssr'
    | 'didSSR'
    | 'initialReflectedProperties'
    | 'internals'
    | 'defaultSlot'
    | 'body'
    | 'popup'
    | 'anchor'
    | 'onwa-show'
    | 'onwa-after-show'
    | 'onwa-hide'
    | 'onwa-after-hide';

export interface TooltipProps
    extends HTMLAttributes, Omit<WaTooltipProps, TooltipImplementationProps> {
    slot?: HTMLElement['slot'];
    onWaShow?: WaTooltipProps['onwa-show'];
    onWaAfterShow?: WaTooltipProps['onwa-after-show'];
    onWaHide?: WaTooltipProps['onwa-hide'];
    onWaAfterHide?: WaTooltipProps['onwa-after-hide'];
}
