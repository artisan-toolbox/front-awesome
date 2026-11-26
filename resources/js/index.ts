export type * from './WebAwesome/componentProps';
import { createMosaicast } from '@artisan-toolbox/mosaicast';
import type { MosaicastPluginOptions } from '@artisan-toolbox/mosaicast';
import type { App, Plugin } from 'vue';
import { dataViewOptionsKey, resolveDataViewOptions } from './dataViewOptions';
import type { DataViewOptions, ResolvedDataViewOptions } from './dataViewOptions';
export { useDataViewOptions } from './dataViewOptions';
export type {
    DataViewOptions,
    DataViewMultiSortKey,
    DataViewSortIcon,
    ResolvedDataViewOptions,
} from './dataViewOptions';
import { initializeFlashToast } from './WebAwesome/flashToast';
import type { FlashToastOptions } from './WebAwesome/flashToast';
import { toastKey, toastService } from './WebAwesome/toast';
import type { ToastService } from './WebAwesome/toast';
import { initializeAppearance } from './preferences/appearance';
import type { PreferencesService } from './preferences/types';
import { useMaskTemplate, useMaskTemplates } from './masked-input/templates';
import {
    createScrollbarDirective,
    legacyScrollbarDirective,
    scrollbarDirective,
    scrollbarDirectiveKey,
    type ScrollbarPluginOptions,
} from './scrollbar';
export { scrollbarDirective };
export type { ScrollbarOptions, ScrollbarPluginOptions, ScrollbarVariant } from './scrollbar';
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
export { default as MaskedInput } from './masked-input/MaskedInput.vue';
export { useMaskTemplate, useMaskTemplates };
export type {
    Mask,
    MaskCell,
    MaskChoices,
    MaskContext,
    MaskInputMode,
    MaskOptions,
    MaskPattern,
    MaskTemplate,
    MaskToken,
} from './masked-input/mask';
export type { IconProps } from './WebAwesome/iconProps';
export type { TagProps } from './WebAwesome/tagProps';
export type { TooltipProps } from './WebAwesome/tooltipProps';
export type { PopoverProps } from './WebAwesome/popoverProps';
export type { PageProps } from './WebAwesome/pageProps';
export { default as UserPermissionEditor } from './user-permission-editor/UserPermissionEditor.vue';
export type {
    UserPermissionEditorHandle,
    UserPermissionEditorSubject,
} from './user-permission-editor/protocol';

export interface FrontAwesomeServices {
    toast: ToastService;
    dataView?: ResolvedDataViewOptions;
    localization?: LocalizationService;
    preferences?: PreferencesService;
}

export interface FrontAwesomePrinting {
    install(app: App): void;
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $frontAwesome: FrontAwesomeServices;
        $maskTemplates: ReturnType<typeof useMaskTemplate>;
    }

    interface GlobalDirectives {
        vScrollbar: typeof scrollbarDirective;
        vFaScrollbar: typeof legacyScrollbarDirective;
    }
}

export interface FrontAwesomeOptions {
    mosaicast?: MosaicastPluginOptions;
    dataView?: DataViewOptions;
    flashToast?: FlashToastOptions;
    appearance?: boolean;
    printing?: FrontAwesomePrinting;
    localization?: LocalizationService;
    preferences?: PreferencesService;
    scrollbar?: ScrollbarPluginOptions;
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
    dataView,
    scrollbar,
}: FrontAwesomeOptions = {}): Plugin {
    const dataViewOptions = resolveDataViewOptions(dataView);
    const configuredScrollbar = createScrollbarDirective(scrollbar);
    return {
        install(app) {
            app.directive('scrollbar', configuredScrollbar);
            app.directive('fa-scrollbar', legacyScrollbarDirective);
            app.provide(dataViewOptionsKey, dataViewOptions);
            app.provide(scrollbarDirectiveKey, configuredScrollbar);
            app.provide(toastKey, toastService);
            app.config.globalProperties.$frontAwesome = {
                ...app.config.globalProperties.$frontAwesome,
                toast: toastService,
                dataView: dataViewOptions,
            };
            app.config.globalProperties.$maskTemplates = useMaskTemplate();
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
