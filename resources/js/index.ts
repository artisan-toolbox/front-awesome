import { createMosaicast } from '@artisan-toolbox/mosaicast';
import type { MosaicastPluginOptions } from '@artisan-toolbox/mosaicast';
import type { Plugin } from 'vue';
import { initializeFlashToast } from './WebAwesome/flashToast';
import type { FlashToastOptions } from './WebAwesome/flashToast';
import { toastKey, toastService } from './WebAwesome/toast';
import type { ToastService } from './WebAwesome/toast';
import { initializeTheme } from './theme';

export type { FlashToastOptions, ToastIconOptions, ToastOptions } from './WebAwesome/flashToast';
export { useToast } from './WebAwesome/toast';
export type { ToastService } from './WebAwesome/toast';
export type { ThemePreference } from './theme';
export type { ButtonGroupProps, ButtonProps } from './WebAwesome/buttonProps';

declare module 'vue' {
    interface ComponentCustomProperties {
        $frontAwesome: { toast: ToastService };
    }
}

export interface FrontAwesomeOptions {
    mosaicast?: MosaicastPluginOptions;
    flashToast?: FlashToastOptions;
    theme?: boolean;
}

// Mosaicast 1.1 keeps its Inertia listener for the document lifetime.
const mosaicastDocuments = new WeakSet<Document>();

export function createFrontAwesome({
    mosaicast,
    flashToast,
    theme,
}: FrontAwesomeOptions = {}): Plugin {
    return {
        install(app) {
            app.provide(toastKey, toastService);
            app.config.globalProperties.$frontAwesome = { toast: toastService };

            if (theme) {
                initializeTheme(app);
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
