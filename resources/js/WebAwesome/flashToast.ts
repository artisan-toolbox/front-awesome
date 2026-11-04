import { mosaicast } from '@artisan-toolbox/mosaicast';
import type WaToast from '@awesome.me/webawesome/dist/components/toast/toast.js';
import type { ToastCreateOptions } from '@awesome.me/webawesome/dist/components/toast/toast.js';
import { router } from '@inertiajs/vue3';

const variants = new Set<unknown>([
    'brand',
    'success',
    'warning',
    'danger',
    'neutral',
] satisfies NonNullable<ToastCreateOptions['variant']>[]);

export type ToastOptions = Omit<ToastCreateOptions, 'size'> & {
    size?: Exclude<ToastCreateOptions['size'], 'small' | 'medium' | 'large'>;
};

export type { ToastIconOptions } from '@awesome.me/webawesome/dist/components/toast/toast.js';

const sizes = new Set<unknown>(['xs', 's', 'm', 'l', 'xl'] satisfies NonNullable<
    ToastOptions['size']
>[]);

interface ToastPayload {
    message: string;
    options?: ToastOptions;
}

export interface FlashToastOptions {
    placement?: WaToast['placement'];
}

let active: { show: typeof showToast; acquire: () => () => void } | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): boolean {
    return value === undefined || typeof value === 'string';
}

function isToastIcon(value: unknown): boolean {
    return (
        typeof value === 'string' ||
        (isRecord(value) &&
            typeof value.name === 'string' &&
            isOptionalString(value.library) &&
            isOptionalString(value.family) &&
            isOptionalString(value.variant))
    );
}

function isToastOptions(value: unknown): value is ToastOptions {
    if (!isRecord(value)) {
        return false;
    }

    const { variant, duration, icon, size, allowHtml } = value;

    return (
        (variant === undefined || variants.has(variant)) &&
        (duration === undefined ||
            (typeof duration === 'number' && Number.isInteger(duration) && duration >= 0)) &&
        (icon === undefined || isToastIcon(icon)) &&
        (size === undefined || sizes.has(size)) &&
        (allowHtml === undefined || typeof allowHtml === 'boolean')
    );
}

function isToastPayload(payload: unknown): payload is ToastPayload {
    return (
        isRecord(payload) &&
        typeof payload.message === 'string' &&
        (payload.options === undefined || isToastOptions(payload.options))
    );
}

export async function showToast(message: string, options?: ToastOptions): Promise<void> {
    if (!isToastPayload({ message, options })) {
        throw new TypeError('Invalid Front Awesome toast message or options.');
    }

    await active?.show(message, options);
}

export function initializeFlashToast({
    placement = 'top-end',
}: FlashToastOptions = {}): () => void {
    if (typeof document === 'undefined') {
        return () => {};
    }

    if (active !== undefined) {
        return active.acquire();
    }

    let host: WaToast | undefined;
    let owners = 0;
    // Inertia can emit the same list when an unrelated flash key changes.
    const seenFlashLists = new WeakSet<unknown[]>();
    const ready = import('#front-awesome-webawesome/components/toast/toast.js').then(async () => {
        if (active?.acquire !== acquire) {
            return;
        }

        host = document.createElement('wa-toast');
        host.placement = placement;
        document.body.append(host);
        await host.updateComplete;
    });

    void ready.catch((error: unknown) => {
        if (active?.acquire === acquire) {
            host?.remove();
            host = undefined;
            globalThis.reportError(error);
        }
    });

    const create = async (message: string, options?: ToastOptions): Promise<void> => {
        if (active?.acquire === acquire && host !== undefined) {
            await host.create(message, options);
        }
    };

    const show: typeof showToast = async (message, options) => {
        await ready;
        await create(message, options);
    };

    const receive = (payload: unknown): void => {
        if (!isToastPayload(payload)) {
            return;
        }

        void ready
            .then(
                () => create(payload.message, payload.options),
                () => {},
            )
            .catch((error: unknown) => globalThis.reportError(error));
    };

    const stopMosaicast = mosaicast().on('front-awesome.toast', receive);
    const stopFlash = router.on('flash', ({ detail }) => {
        const payloads: unknown = detail.flash['front-awesome.toasts'];

        if (Array.isArray(payloads) && !seenFlashLists.has(payloads)) {
            seenFlashLists.add(payloads);
            payloads.forEach(receive);
        }
    });

    function acquire(): () => void {
        owners++;
        let released = false;

        return () => {
            if (released) {
                return;
            }
            released = true;
            owners--;
            if (owners > 0) {
                return;
            }

            active = undefined;
            stopMosaicast();
            stopFlash();
            host?.remove();
        };
    }

    active = { show, acquire };
    return acquire();
}
