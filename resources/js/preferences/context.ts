import { inject, type InjectionKey } from 'vue';
import type { PreferencesService } from './types';

export const preferencesKey: InjectionKey<PreferencesService> = Symbol('Front Awesome preferences');

export function usePreferences(): PreferencesService {
    const preferences = inject(preferencesKey, undefined);
    if (!preferences)
        throw new Error('usePreferences requires app.use(createPreferences(initialPreferences)).');
    return preferences;
}
