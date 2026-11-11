import type { PrintBridge } from './types';

export function createQzBridge(): PrintBridge {
    const runtime = () => import('@artisan-toolbox/qztray');
    return {
        async prepare(document, options) {
            return (await runtime()).preparePrintDocument(document, {
                requestInit:
                    options?.requestInit ??
                    (document.type === 'pdf' ? options?.pdf?.requestInit : undefined),
            });
        },
        async connect() {
            return (await runtime()).qztray.connect();
        },
        async getPrinters() {
            return (await runtime()).qztray.getPrinters();
        },
        async print(request) {
            return (await runtime()).qztray.print(request);
        },
        async render(document, options) {
            return (await runtime()).renderPrintRequest(document, options);
        },
    };
}
