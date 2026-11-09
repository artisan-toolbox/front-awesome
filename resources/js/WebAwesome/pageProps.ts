import type { WaPageProps } from '@awesome.me/webawesome/dist/custom-elements-jsx.d.ts';
import type { HTMLAttributes } from 'vue';

export interface PageProps extends HTMLAttributes {
    nonce?: WaPageProps['nonce'];
    navOpen?: WaPageProps['navOpen'];
    'nav-open'?: WaPageProps['nav-open'];
    mobileBreakpoint?: WaPageProps['mobileBreakpoint'];
    'mobile-breakpoint'?: WaPageProps['mobile-breakpoint'];
    navigationPlacement?: WaPageProps['navigationPlacement'];
    'navigation-placement'?: WaPageProps['navigation-placement'];
    disableNavigationToggle?: WaPageProps['disableNavigationToggle'];
    'disable-navigation-toggle'?: WaPageProps['disable-navigation-toggle'];
    slot?: HTMLElement['slot'];
    disableSticky?: string;
    'disable-sticky'?: string;
}
