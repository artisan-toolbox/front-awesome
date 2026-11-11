export { createPrinting } from './service';
export { usePrinting } from './context';
export { default as PrintDrawer } from './PrintDrawer.vue';
export type * from './types';
export { printingMessages } from './messages';
export type { PrintingMessages } from './messages';

import type { PrintingService } from './types';
declare module '../index' {
    interface FrontAwesomeServices {
        printing?: PrintingService;
    }
}
