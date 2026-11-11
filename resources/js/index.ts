export type * from './WebAwesome/componentProps';
import { createMosaicast } from '@artisan-toolbox/mosaicast';
import type { MosaicastPluginOptions } from '@artisan-toolbox/mosaicast';
import type { App, Plugin } from 'vue';
import { initializeFlashToast } from './WebAwesome/flashToast';
import type { FlashToastOptions } from './WebAwesome/flashToast';
import { toastKey, toastService } from './WebAwesome/toast';
import type { ToastService } from './WebAwesome/toast';
import { initializeAppearance } from './preferences/appearance';
import type { PreferencesService } from './preferences/types';
export { createPreferences, usePreferences } from './preferences';
export type {
    Preferences,
    PreferencesBootstrap,
    PreferencesService,
    PreferenceErrors,
    PreferenceField,
} from './preferences/types';
import type { LocalizationService } from './localization/types';
export { useLocalization } from './localization/context';
export type {
    LaravelLocalizationCatalog,
    LocalizationLocale,
    LocalizationOptions,
    LocalizationService,
} from './localization/types';

export type { FlashToastOptions, ToastIconOptions, ToastOptions } from './WebAwesome/flashToast';
export { useToast } from './WebAwesome/toast';
export type { ToastService } from './WebAwesome/toast';
export type { AppearancePreference } from './preferences/appearance';
export type { ButtonGroupProps, ButtonProps } from './WebAwesome/buttonProps';
export { useFormBridge } from './WebAwesome/useFormBridge';
export type {
    CompatibleField,
    ControlBindingProps,
    ControlBridgeOptions,
    ControlBridgeProps,
    FormBindingProps,
    FormBridge,
    FormBridgeFailed,
    FormBridgeSource,
    FormBridgeValue,
    FormFieldAlias,
    TextFieldName,
} from './WebAwesome/useFormBridge';
export type { InputAttributes, InputProps } from './WebAwesome/inputProps';
export type { IconProps } from './WebAwesome/iconProps';
export type { TagProps } from './WebAwesome/tagProps';
export type { TooltipProps } from './WebAwesome/tooltipProps';
export type { PopoverProps } from './WebAwesome/popoverProps';
export type { PageProps } from './WebAwesome/pageProps';

export interface FrontAwesomeServices {
    toast: ToastService;
    localization?: LocalizationService;
    preferences?: PreferencesService;
}

export interface FrontAwesomePrinting {
    install(app: App): void;
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $frontAwesome: FrontAwesomeServices;
    }
}

export interface FrontAwesomeOptions {
    mosaicast?: MosaicastPluginOptions;
    flashToast?: FlashToastOptions;
    appearance?: boolean;
    printing?: FrontAwesomePrinting;
    localization?: LocalizationService;
    preferences?: PreferencesService;
}

// Mosaicast 1.1 keeps its Inertia listener for the document lifetime.
const mosaicastDocuments = new WeakSet<Document>();

export function createFrontAwesome({
    mosaicast,
    flashToast,
    appearance,
    printing,
    localization,
    preferences,
}: FrontAwesomeOptions = {}): Plugin {
    return {
        install(app) {
            app.provide(toastKey, toastService);
            app.config.globalProperties.$frontAwesome = {
                ...app.config.globalProperties.$frontAwesome,
                toast: toastService,
            };
            if (preferences) preferences.install(app);
            if (localization) localization.install(app);
            if (printing) printing.install(app);

            if (appearance && !preferences) {
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
