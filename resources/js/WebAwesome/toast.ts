import { inject } from 'vue';
import type { InjectionKey } from 'vue';
import { showToast } from './flashToast';

export interface ToastService {
    /** Resolves after the browser creates the toast. During SSR, a valid call has no effect. */
    show: typeof showToast;
}

export const toastService: ToastService = { show: showToast };

export const toastKey: InjectionKey<ToastService> = Symbol('Front Awesome toast');

export function useToast(): ToastService {
    const toast = inject(toastKey, undefined);

    if (toast === undefined) {
        throw new Error('useToast() requires the Front Awesome Vue plugin.');
    }

    return toast;
}
