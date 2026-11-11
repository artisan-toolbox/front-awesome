import { expect, test, vi } from 'vite-plus/test';
import { createPrinting } from '../../resources/js/printing/service';
import type { PrintBridge, PrintingService } from '../../resources/js/printing/types';

function deferred<Value>() {
    let resolve: (value: Value) => void = () => {};
    let reject: (reason: unknown) => void = () => {};
    const promise = new Promise<Value>((yes, no) => {
        resolve = yes;
        reject = no;
    });
    return { promise, resolve, reject };
}
function setup(
    overrides: Partial<PrintBridge> = {},
    workflow = { autoAdvance: false, showSummary: true },
) {
    const bridge: PrintBridge = {
        connect: vi.fn(async () => {}),
        getPrinters: vi.fn(async () => ['Office', 'Receipt']),
        render: vi.fn(async () => ['data:image/png;base64,cHJldmlldw==']),
        print: vi.fn(async () => {}),
        ...overrides,
    };
    return { bridge, printing: createPrinting({ bridge, storage: false, ...workflow }) };
}
async function ready(printing: PrintingService) {
    await vi.waitFor(() => expect(printing.currentStep.value?.preview.status).toBe('ready'));
    await printing.connect();
    printing.configure({ printer: 'Office' });
}

test('previews immutable PDF files and submits the exact document once despite double clicks', async () => {
    const pending = deferred<void>();
    const { bridge, printing } = setup({ print: vi.fn(() => pending.promise) });
    const payload = ['JVBERi0x', 'JVBERi0y'];
    const options = { copies: 2, jobName: 'Invoice', rasterize: false };
    const handle = printing.pdfBase64(payload, {
        title: 'Invoice',
        options,
        dataOptions: { pageRanges: '1-2' },
    });
    payload[0] = 'mutated';
    options.copies = 99;
    await ready(printing);
    const document = printing.currentStep.value?.document;
    expect(document?.payload).toEqual(['JVBERi0x', 'JVBERi0y']);
    expect(document?.options?.copies).toBe(2);
    expect(bridge.render).toHaveBeenCalledWith(document, {});
    const first = printing.submit();
    await printing.submit();
    expect(bridge.print).toHaveBeenCalledTimes(1);
    expect(bridge.print).toHaveBeenCalledWith({ ...document, printer: 'Office' });
    pending.resolve();
    await first;
    expect((await handle.finished).steps.map((step) => step.status)).toEqual(['submitted']);
    expect(printing.currentStep.value?.message).toContain('Physical printing is not confirmed');
});

test('uses a shared promised response for ordered explicit receipt and invoice steps', async () => {
    const source = deferred<{ receipt: string; invoice: string[]; optional: null }>();
    const { bridge, printing } = setup();
    const job = printing.job({
        title: 'Order',
        source: source.promise,
        steps: [
            { type: 'escpos', flavor: 'base64', key: 'receipt', title: 'Receipt' },
            {
                type: 'pdf',
                flavor: 'base64',
                key: 'invoice',
                title: 'Invoice',
                dataOptions: { pageRanges: '1' },
            },
            { type: 'zpl', key: 'optional' },
        ],
    });
    expect(printing.currentStep.value?.status).toBe('loading');
    source.resolve({ receipt: 'aGVsbG8=', invoice: ['JVBERg==', 'JVBERg=='], optional: null });
    await ready(printing);
    await printing.submit();
    expect(bridge.print).toHaveBeenCalledTimes(1);
    expect(printing.currentStep.value?.status).toBe('submitted');
    printing.next();
    await ready(printing);
    expect(printing.currentStep.value?.title).toBe('Invoice');
    expect(printing.currentStep.value?.document).toMatchObject({
        dataOptions: { pageRanges: '1' },
    });
    await printing.submit();
    expect((await job.finished).steps.map((step) => step.status)).toEqual([
        'submitted',
        'submitted',
        'skipped',
    ]);
});

test('keeps jobs FIFO and never submits the next job automatically', async () => {
    const { bridge, printing } = setup();
    const first = printing.zpl('^XA^XZ', { title: 'First' });
    const second = printing.pdfBase64(Promise.resolve('JVBERg=='), { title: 'Second' });
    await ready(printing);
    await printing.submit();
    await first.finished;
    expect(printing.currentJob.value?.id).toBe(first.id);
    expect(printing.state.value.jobs[1]?.status).toBe('queued');
    printing.next();
    await ready(printing);
    expect(printing.currentJob.value?.id).toBe(second.id);
    expect(bridge.print).toHaveBeenCalledTimes(1);
});

test.each([undefined, '', [], [''], [undefined], { nested: 'value' }])(
    'settles malformed payload %j as failed',
    async (value) => {
        const { printing } = setup();
        const handle = printing.job({
            source: { file: value },
            steps: [{ type: 'pdf', key: 'file' }],
        });
        expect((await handle.finished).steps[0]?.status).toBe('failed');
        expect(printing.currentStep.value?.message).toContain('empty or');
    },
);

test('only selected null skips and inherited or dotted properties never resolve', async () => {
    const { printing } = setup();
    const skipped = printing.pdfBase64({ file: null }, { key: 'file' });
    expect((await skipped.finished).steps[0]?.status).toBe('skipped');
    printing.next();
    const inherited = printing.job({
        source: Object.create({ file: 'JVBERg==' }),
        steps: [{ type: 'pdf', key: 'file' }],
    });
    expect((await inherited.finished).steps[0]?.status).toBe('failed');
    printing.next();
    const nested = printing.job({
        source: { file: { pdf: 'JVBERg==' } },
        steps: [{ type: 'pdf', key: 'file.pdf' }],
    });
    expect((await nested.finished).steps[0]?.status).toBe('failed');
});

test('settles rejected promises and cancellation before late source resolution without rendering', async () => {
    const { bridge, printing } = setup();
    const rejected = printing.pdfBase64(Promise.reject(new Error('private server detail')));
    expect((await rejected.finished).steps[0]).toMatchObject({
        status: 'failed',
        message: expect.not.stringContaining('private'),
    });
    printing.next();
    const source = deferred<string>();
    const cancelled = printing.pdfBase64(source.promise);
    cancelled.cancel();
    expect((await cancelled.finished).steps[0]?.status).toBe('cancelled');
    source.resolve('JVBERg==');
    await Promise.resolve();
    await Promise.resolve();
    expect(bridge.render).not.toHaveBeenCalled();
});

test('marks cancellation of an active send unknown and ignores its late success', async () => {
    const sent = deferred<void>();
    const { bridge, printing } = setup({ print: vi.fn(() => sent.promise) });
    const handle = printing.pdfBase64('JVBERg==');
    await ready(printing);
    const submission = printing.submit();
    handle.cancel();
    const result = await handle.finished;
    expect(result.steps[0]?.status).toBe('unknown');
    sent.resolve();
    await submission;
    expect(printing.currentStep.value?.status).toBe('unknown');
    expect(bridge.print).toHaveBeenCalledTimes(1);
});

test('does not retry ambiguous failures and explains that delivery may have happened', async () => {
    const { bridge, printing } = setup({
        print: vi.fn(async () => {
            throw new Error('socket closed');
        }),
    });
    const job = printing.escpos('aGVsbG8=');
    await ready(printing);
    await printing.submit();
    await printing.submit();
    expect((await job.finished).steps[0]?.status).toBe('unknown');
    expect(bridge.print).toHaveBeenCalledTimes(1);
    expect(printing.currentStep.value?.message).toContain('will not retry automatically');
});

test('recovers connection and preview failures and rejects invalid settings without sending', async () => {
    let connected = false;
    let rendered = false;
    const { bridge, printing } = setup({
        connect: vi.fn(async () => {
            if (!connected) throw new Error('offline');
        }),
        render: vi.fn(async () => {
            if (!rendered) throw new Error('unavailable');
            return ['preview'];
        }),
    });
    printing.pdfBase64('JVBERg==');
    await vi.waitFor(() => expect(printing.currentStep.value?.preview.status).toBe('failed'));
    await printing.connect();
    expect(printing.state.value.connection).toBe('failed');
    connected = true;
    rendered = true;
    await printing.connect();
    await printing.preview();
    printing.configure({ printer: 'Office', options: { copies: 0 } });
    await printing.submit();
    expect(bridge.print).not.toHaveBeenCalled();
    expect(printing.currentStep.value?.message).toContain('whole number');
    printing.configure({ options: { copies: 2 } });
    await vi.waitFor(() => expect(printing.currentStep.value?.preview.status).toBe('ready'));
    await printing.submit();
    expect(bridge.print).toHaveBeenCalledTimes(1);
});

test('ignores late preview and connection work after disposal and settles every queued handle', async () => {
    const render = deferred<string[]>();
    const connection = deferred<void>();
    const { printing } = setup({ render: () => render.promise, connect: () => connection.promise });
    const first = printing.pdfBase64('JVBERg==');
    const second = printing.zpl('^XA^XZ');
    await Promise.resolve();
    const connecting = printing.connect();
    printing.dispose();
    expect((await first.finished).steps[0]?.status).toBe('cancelled');
    expect((await second.finished).steps[0]?.status).toBe('cancelled');
    render.resolve(['late']);
    connection.resolve();
    await connecting;
    await Promise.resolve();
    expect(printing.state.value.connection).not.toBe('ready');
    expect(printing.state.value.visible).toBe(false);
    expect(printing.currentStep.value?.preview.images).toEqual([]);
    expect(() => printing.pdfBase64('JVBERg==')).toThrow('disposed');
});

test('keeps optional preferences guarded and excludes document payloads', async () => {
    const values = new Map<string, string>();
    const storage = {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => {
            values.set(key, value);
        },
    };
    const { bridge } = setup();
    const printing = createPrinting({
        bridge,
        storage,
        storageKey: 'tenant-A',
        defaults: { pdf: { printer: 'Office', options: { copies: 3 } } },
    });
    printing.pdfBase64('PRIVATE_DOCUMENT_PAYLOAD');
    await ready(printing);
    await printing.submit();
    expect(values.get('tenant-A')).toContain('Office');
    expect(values.get('tenant-A')).not.toContain('PRIVATE');
    const restored = createPrinting({ bridge, storage, storageKey: 'tenant-A' });
    restored.pdfBase64('JVBERg==');
    await vi.waitFor(() => expect(restored.currentStep.value?.status).toBe('ready'));
    expect(restored.currentStep.value?.document?.options?.copies).toBe(3);
    expect(restored.currentStep.value?.printer).toBe('Office');
    const blocked = createPrinting({
        bridge,
        storage: {
            getItem() {
                throw new Error('denied');
            },
            setItem() {
                throw new Error('denied');
            },
        },
    });
    const blockedJob = blocked.zpl('^XA^XZ');
    await ready(blocked);
    await blocked.submit();
    expect((await blockedJob.finished).steps[0]?.status).toBe('submitted');
    expect(blocked.state.value.visible).toBe(false);
});

test('supports mixed ESC/POS image chunks, per-step preview options and separate app instances', async () => {
    const { bridge } = setup();
    const printing = createPrinting({
        bridge,
        storage: false,
        previewOptions: { escpos: { widthDots: 576 } },
    });
    const payload = [
        'aGVsbG8=',
        { type: 'raw', format: 'image', flavor: 'base64', data: 'aW1hZ2U=' },
    ] as const;
    printing.escpos(payload, { previewOptions: { escpos: { widthDots: 384 } } });
    await ready(printing);
    expect(bridge.render).toHaveBeenCalledWith(
        expect.objectContaining({ payload, flavor: 'base64' }),
        { escpos: { widthDots: 384 } },
    );
    const other = createPrinting({ bridge, storage: false });
    expect(other.state.value.jobs).toEqual([]);
});

test('keeps function-valued QZ options intact and snapshots structured options', async () => {
    const { printing } = setup();
    const bounds = { x: 0, y: 0, width: 10, height: 20 };
    printing.pdf('https://example.test/document.pdf', { options: { bounds } });
    bounds.width = 99;
    await ready(printing);
    expect(printing.currentStep.value?.document?.options?.bounds?.width).toBe(10);
});

test('raw uses an honest source preview and does not call a rendered-page bridge', async () => {
    const { bridge, printing } = setup();
    const job = printing.print({ type: 'raw', payload: 'RAW COMMANDS' });
    await ready(printing);
    await printing.submit();
    expect(bridge.render).not.toHaveBeenCalled();
    expect((await job.finished).steps[0]?.status).toBe('submitted');
});

test('snapshots only selected own payloads and settles throwing getters instead of blocking the queue', async () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;
    const source = {
        file: 'JVBERg==',
        circular,
        get unrelated() {
            throw new Error('unselected');
        },
    };
    const { printing } = setup();
    printing.pdfBase64(source, { key: 'file' });
    await ready(printing);
    expect(printing.currentStep.value?.document?.payload).toBe('JVBERg==');
    printing.cancel();
    printing.next();
    const failed = printing.job({
        source: {
            get file() {
                throw new Error('secret getter');
            },
        },
        steps: [{ type: 'pdf', key: 'file' }],
    });
    expect((await failed.finished).steps[0]).toMatchObject({
        status: 'failed',
        message: expect.not.stringContaining('secret'),
    });
});

test('prepares file documents once and ignores cancellation or disposal during preparation', async () => {
    const materialized = deferred<import('../../resources/js/printing/types').PrintDocument>();
    const { bridge, printing } = setup({ prepare: vi.fn(() => materialized.promise) });
    const handle = printing.pdf('/private/invoice.pdf');
    await Promise.resolve();
    expect(printing.currentStep.value?.status).toBe('loading');
    materialized.resolve({ type: 'pdf', flavor: 'base64', payload: 'JVBERg==' });
    await ready(printing);
    printing.configure({ options: { copies: 2 } });
    await vi.waitFor(() => expect(printing.currentStep.value?.preview.status).toBe('ready'));
    await printing.submit();
    expect(bridge.prepare).toHaveBeenCalledTimes(1);
    expect(bridge.print).toHaveBeenCalledWith(
        expect.objectContaining({ flavor: 'base64', payload: 'JVBERg==' }),
    );
    expect((await handle.finished).steps[0]?.status).toBe('submitted');
    printing.next();
    const late = deferred<import('../../resources/js/printing/types').PrintDocument>();
    const other = setup({ prepare: () => late.promise }).printing;
    const cancelled = other.pdf('/document.pdf');
    await Promise.resolve();
    other.dispose();
    late.resolve({ type: 'pdf', payload: 'late' });
    expect((await cancelled.finished).steps[0]?.status).toBe('cancelled');
    await Promise.resolve();
    expect(other.currentStep.value?.document).toBeUndefined();
});

test('retains configured defaults but remembers only printer and copies from accepted jobs', async () => {
    const { bridge } = setup();
    const printing = createPrinting({
        bridge,
        storage: false,
        defaults: { pdf: { options: { duplex: 'long-edge' } } },
    });
    printing.pdfBase64('JVBERg==', {
        options: {
            copies: 4,
            jobName: 'Alice order',
            size: { width: 4, height: 6 },
            duplex: false,
        },
    });
    await ready(printing);
    await printing.submit();
    printing.next();
    printing.pdfBase64('JVBERg==');
    await ready(printing);
    expect(printing.currentStep.value?.document?.options).toEqual({
        copies: 4,
        duplex: 'long-edge',
    });
});

test('allows reconnect after a custom bridge throws synchronously', async () => {
    let attempts = 0;
    const { printing } = setup({
        connect: () => {
            attempts++;
            if (attempts === 1) throw new Error('sync failure');
            return Promise.resolve();
        },
    });
    await printing.connect();
    expect(printing.state.value.connection).toBe('failed');
    await printing.connect();
    expect(printing.state.value.connection).toBe('ready');
    expect(attempts).toBe(2);
});

test('shows a ready first step while a later document is still preparing', async () => {
    const slow = deferred<import('../../resources/js/printing/types').PrintDocument>();
    const { printing } = setup({
        prepare: async (document) => (document.type === 'zpl' ? slow.promise : document),
    });
    const handle = printing.job({
        source: { first: 'JVBERg==', later: '^XA^XZ' },
        steps: [
            { type: 'pdf', flavor: 'base64', key: 'first' },
            { type: 'zpl', key: 'later' },
        ],
    });
    await ready(printing);
    expect(printing.currentJob.value?.steps[1]?.status).toBe('loading');
    await printing.submit();
    printing.next();
    expect(printing.currentStep.value?.status).toBe('loading');
    printing.skip();
    expect((await handle.finished).steps.map((step) => step.status)).toEqual([
        'submitted',
        'skipped',
    ]);
    slow.resolve({ type: 'zpl', payload: '^XA^XZ' });
});

test('defaults to one print click per document using the remembered printer without a final report', async () => {
    const { bridge } = setup();
    const printing = createPrinting({
        bridge,
        storage: {
            getItem: () =>
                JSON.stringify({
                    pdf: { printer: 'Office' },
                    escpos: { printer: 'Receipt' },
                    zpl: { printer: 'Office' },
                }),
            setItem() {},
        },
    });
    const job = printing.job({
        source: { invoice: 'JVBERg==', receipt: 'aGVsbG8=', label: '^XA^XZ' },
        steps: [
            { type: 'pdf', flavor: 'base64', key: 'invoice' },
            { type: 'escpos', flavor: 'base64', key: 'receipt' },
            { type: 'zpl', key: 'label' },
        ],
    });
    await printing.connect();
    for (const [index, printer] of ['Office', 'Receipt', 'Office'].entries()) {
        await vi.waitFor(() => expect(printing.currentStep.value?.preview.status).toBe('ready'));
        expect(printing.currentStep.value?.printer).toBe(printer);
        expect(bridge.print).toHaveBeenCalledTimes(index);
        await printing.submit();
    }
    expect((await job.finished).steps.map((step) => step.status)).toEqual([
        'submitted',
        'submitted',
        'submitted',
    ]);
    expect(printing.currentJob.value).toBeUndefined();
    expect(printing.state.value.visible).toBe(false);
});

test('uses the latest printer for already queued jobs of the same format', async () => {
    const { bridge } = setup();
    const printing = createPrinting({ bridge, storage: false });
    const first = printing.pdfBase64('first');
    const second = printing.pdfBase64('second');
    await ready(printing);
    printing.configure({ printer: 'Receipt' });
    await printing.submit();
    await vi.waitFor(() => expect(printing.currentStep.value?.preview.status).toBe('ready'));
    expect(printing.currentJob.value?.id).toBe(second.id);
    expect(printing.currentStep.value?.printer).toBe('Receipt');
    expect(bridge.print).toHaveBeenCalledTimes(1);
    expect((await first.finished).steps[0]?.status).toBe('submitted');
    await printing.submit();
    expect((await second.finished).steps[0]?.status).toBe('submitted');
    expect(printing.state.value.visible).toBe(false);
});

test('shows a final report only when explicitly requested and keeps workflow options out of QZ requests', async () => {
    const { bridge } = setup();
    const printing = createPrinting({ bridge, storage: false, showSummary: true });
    const hidden = printing.pdfBase64('first', { showSummary: false });
    await ready(printing);
    await printing.submit();
    expect((await hidden.finished).steps[0]?.status).toBe('submitted');
    expect(printing.currentJob.value).toBeUndefined();
    const shown = printing.pdfBase64('second', { showSummary: true, autoAdvance: false });
    await ready(printing);
    await printing.submit();
    expect((await shown.finished).steps[0]?.status).toBe('submitted');
    expect(printing.currentJob.value).toMatchObject({
        id: shown.id,
        status: 'complete',
        showSummary: true,
        autoAdvance: false,
    });
    expect(printing.state.value.visible).toBe(true);
    expect(bridge.print).toHaveBeenLastCalledWith({
        type: 'pdf',
        flavor: 'base64',
        payload: 'second',
        printer: 'Office',
        options: { copies: 1 },
    });
    printing.next();
    expect(printing.state.value.visible).toBe(false);
});

test('keeps unconfirmed submissions visible without advancing or showing a summary by default', async () => {
    const { bridge } = setup({
        print: vi.fn(async () => {
            throw new Error('Lost reply');
        }),
    });
    const printing = createPrinting({ bridge, storage: false });
    const job = printing.job({
        source: { first: 'first', second: 'second' },
        steps: [
            { type: 'pdf', flavor: 'base64', key: 'first' },
            { type: 'pdf', flavor: 'base64', key: 'second' },
        ],
    });
    await ready(printing);
    await printing.submit();
    expect(printing.currentJob.value).toMatchObject({ stepIndex: 0, showSummary: false });
    expect(printing.currentStep.value?.status).toBe('unknown');
    expect(printing.state.value.visible).toBe(true);
    await printing.submit();
    expect(bridge.print).toHaveBeenCalledTimes(1);
    job.cancel();
    expect((await job.finished).steps.map((step) => step.status)).toEqual(['unknown', 'cancelled']);
});

test('settles every queued default job on disposal without starting more previews', async () => {
    const pending = deferred<string>();
    const { bridge } = setup();
    const printing = createPrinting({ bridge, storage: false });
    const first = printing.pdfBase64(pending.promise);
    const second = printing.pdfBase64(pending.promise);
    printing.dispose();
    expect((await first.finished).steps[0]?.status).toBe('cancelled');
    expect((await second.finished).steps[0]?.status).toBe('cancelled');
    pending.resolve('late');
    await Promise.resolve();
    expect(bridge.render).not.toHaveBeenCalled();
});

test('surfaces every failed document before dismissing a default job that also submitted successfully', async () => {
    const { bridge } = setup();
    const printing = createPrinting({ bridge, storage: false });
    const handle = printing.job({
        source: { invoice: 'JVBERg==' },
        steps: [
            { type: 'pdf', flavor: 'base64', key: 'invoice', title: 'Invoice' },
            { type: 'pdf', flavor: 'base64', key: 'missing', title: 'Missing receipt' },
            { type: 'pdf', flavor: 'base64', key: 'alsoMissing', title: 'Missing label' },
        ],
    });
    await ready(printing);
    await printing.submit();
    expect((await handle.finished).steps.map((step) => step.status)).toEqual([
        'submitted',
        'failed',
        'failed',
    ]);
    expect(printing.currentStep.value).toMatchObject({
        title: 'Missing receipt',
        status: 'failed',
    });
    printing.next();
    expect(printing.currentStep.value).toMatchObject({ title: 'Missing label', status: 'failed' });
    printing.next();
    expect(printing.state.value.visible).toBe(false);
});

test('finishes normally after an uncertain result was already acknowledged and the remaining document was submitted', async () => {
    let attempts = 0;
    const { bridge } = setup({
        print: async () => {
            if (++attempts === 1) throw new Error('Lost response');
        },
    });
    const printing = createPrinting({ bridge, storage: false });
    const handle = printing.job({
        source: { first: 'first', second: 'second' },
        steps: [
            { type: 'pdf', flavor: 'base64', key: 'first' },
            { type: 'pdf', flavor: 'base64', key: 'second' },
        ],
    });
    await ready(printing);
    await printing.submit();
    expect(printing.currentStep.value?.status).toBe('unknown');
    printing.next();
    await ready(printing);
    await printing.submit();
    expect((await handle.finished).steps.map((step) => step.status)).toEqual([
        'unknown',
        'submitted',
    ]);
    expect(printing.state.value.visible).toBe(false);
});

test('keeps a ready connection when cancellation promotes the next queued job', async () => {
    const { bridge } = setup();
    const printing = createPrinting({ bridge, storage: false });
    const first = printing.pdfBase64('first');
    const second = printing.pdfBase64('second');
    await ready(printing);
    first.cancel();
    expect((await first.finished).steps[0]?.status).toBe('cancelled');
    expect(printing.currentJob.value?.id).toBe(second.id);
    expect(printing.state.value.connection).toBe('ready');
    await vi.waitFor(() => expect(printing.currentStep.value?.preview.status).toBe('ready'));
    printing.configure({ printer: 'Office' });
    await printing.submit();
    expect((await second.finished).steps[0]?.status).toBe('submitted');
});
