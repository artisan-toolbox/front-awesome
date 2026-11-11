import { expectTypeOf, test } from 'vite-plus/test';
import { createPrinting } from '@artisan-toolbox/front-awesome/printing';
import type {
    PrintDocument,
    PrintFormatOptions,
    PrintJobHandle,
    PrintJobResult,
} from '@artisan-toolbox/front-awesome/printing';

function contract(printing: ReturnType<typeof createPrinting>) {
    const payload = Promise.resolve({ invoice: ['JVBERg=='], optional: null });
    const handle = printing.pdfBase64(payload, {
        key: 'invoice',
        dataOptions: { pageRanges: '1-2' },
        options: { copies: 2 },
        showSummary: true,
        autoAdvance: false,
    });
    expectTypeOf(handle).toEqualTypeOf<PrintJobHandle>();
    expectTypeOf(handle.finished).toEqualTypeOf<Promise<PrintJobResult>>();
    printing.zpl('^XA^XZ', {
        flavor: 'plain',
        options: { copies: 1 },
    } satisfies PrintFormatOptions<'zpl'>);
    printing.escpos([
        'aGVsbG8=',
        { type: 'raw', format: 'image', flavor: 'base64', data: 'aW1hZ2U=' },
    ]);
    printing.print(
        { type: 'pdf', flavor: 'base64', payload, dataOptions: { pageRanges: '1' } },
        { key: 'invoice' },
    );
    // @ts-expect-error PDF transport cannot use plain raw commands.
    const invalidPdf: PrintDocument = {
        type: 'pdf',
        payload: 'JVBERg==',
        flavor: 'plain',
    };
    const invalidZpl: PrintDocument = {
        type: 'zpl',
        payload: '^XA^XZ',
        // @ts-expect-error PDF-only data options do not belong to a ZPL document.
        dataOptions: { pageRanges: '1' },
    };
    expectTypeOf(invalidPdf).toMatchTypeOf<PrintDocument>();
    expectTypeOf(invalidZpl).toMatchTypeOf<PrintDocument>();
}

test('keeps format-specific QZ fields and typed asynchronous job handles', () => {
    expectTypeOf(contract).parameter(0).toEqualTypeOf<ReturnType<typeof createPrinting>>();
});
