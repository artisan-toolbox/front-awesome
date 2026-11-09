import type { WaTagProps } from '@awesome.me/webawesome/dist/custom-elements-jsx.d.ts';
import type { HTMLAttributes } from 'vue';

type TagImplementationProps =
    | 'did-ssr'
    | 'didSSR'
    | 'initialReflectedProperties'
    | 'internals'
    | 'onwa-remove';

export interface TagProps extends HTMLAttributes, Omit<WaTagProps, TagImplementationProps> {
    slot?: HTMLElement['slot'];
    onWaRemove?: WaTagProps['onwa-remove'];
}
