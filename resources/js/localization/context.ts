import { inject, type InjectionKey } from 'vue';
import type { LocalizationService } from './types';

export const localizationKey: InjectionKey<LocalizationService> = Symbol(
    'front-awesome.localization',
);

export function useLocalization(): LocalizationService {
    const service = inject(localizationKey);
    if (!service)
        throw new Error(
            'Install createFrontAwesome({ localization: createLocalization(catalog) }) before using localization.',
        );
    return service;
}
