import { createMosaicast } from '@artisan-toolbox/mosaicast';
import type { MosaicastPluginOptions } from '@artisan-toolbox/mosaicast';
import type { Plugin } from 'vue';
import { initializeFlashToast } from './WebAwesome/flashToast';
import type { FlashToastOptions } from './WebAwesome/flashToast';
import { toastKey, toastService } from './WebAwesome/toast';
import type { ToastService } from './WebAwesome/toast';
import { initializeAppearance } from './appearance';

export type { FlashToastOptions, ToastIconOptions, ToastOptions } from './WebAwesome/flashToast';
export { useToast } from './WebAwesome/toast';
export type { ToastService } from './WebAwesome/toast';
export type { AppearancePreference } from './appearance';
export type { ButtonGroupProps, ButtonProps } from './WebAwesome/buttonProps';
export { useFormBridge } from './WebAwesome/useFormBridge';
export type { FormBindingProps, FormBridgeValue, TextFieldName } from './WebAwesome/useFormBridge';
export type { InputAttributes, InputProps } from './WebAwesome/inputProps';
export type { IconProps } from './WebAwesome/iconProps';
export type { TagProps } from './WebAwesome/tagProps';
export type { TooltipProps } from './WebAwesome/tooltipProps';
export type { PopoverProps } from './WebAwesome/popoverProps';
export type { PageProps } from './WebAwesome/pageProps';

declare module 'vue' {
    interface ComponentCustomProperties {
        $frontAwesome: { toast: ToastService };
    }
}

export interface FrontAwesomeOptions {
    mosaicast?: MosaicastPluginOptions;
    flashToast?: FlashToastOptions;
    appearance?: boolean;
}

// Mosaicast 1.1 keeps its Inertia listener for the document lifetime.
const mosaicastDocuments = new WeakSet<Document>();

export function createFrontAwesome({
    mosaicast,
    flashToast,
    appearance,
}: FrontAwesomeOptions = {}): Plugin {
    return {
        install(app) {
            app.provide(toastKey, toastService);
            app.config.globalProperties.$frontAwesome = { toast: toastService };

            if (appearance) {
                initializeAppearance(app);
            }

            if (typeof document === 'undefined') {
                return;
            }

            if (!mosaicastDocuments.has(document)) {
                app.use(createMosaicast(mosaicast));
                mosaicastDocuments.add(document);
            }
            app.onUnmount(initializeFlashToast(flashToast));
        },
    };
}
