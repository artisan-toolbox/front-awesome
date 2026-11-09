import type { WaIconProps } from '@awesome.me/webawesome/dist/custom-elements-jsx.d.ts';
import type { HTMLAttributes } from 'vue';

type IconImplementationProps =
    | 'did-ssr'
    | 'didSSR'
    | 'initialReflectedProperties'
    | 'internals'
    | 'onwa-load'
    | 'onwa-error';

export interface IconProps extends HTMLAttributes, Omit<WaIconProps, IconImplementationProps> {
    slot?: HTMLElement['slot'];
    onWaLoad?: WaIconProps['onwa-load'];
    onWaError?: WaIconProps['onwa-error'];
}
