import { inject, type InjectionKey } from 'vue';
import type { PrintingService } from './types';

export const printingKey: InjectionKey<PrintingService> = Symbol('front-awesome.printing');

export function usePrinting(): PrintingService {
    const service = inject(printingKey);
    if (!service)
        throw new Error(
            'Install createFrontAwesome({ printing: createPrinting() }) before using printing.',
        );
    return service;
}
