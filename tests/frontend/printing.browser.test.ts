import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { page, userEvent } from 'vitest/browser';
import { createApp, h } from 'vue';
import { createFrontAwesome } from '@artisan-toolbox/front-awesome';
import { createPrinting, PrintDrawer, usePrinting } from '@artisan-toolbox/front-awesome/printing';
import type { PrintBridge, PrintingOptions } from '@artisan-toolbox/front-awesome/printing';
import { renderPrintRequest } from '@artisan-toolbox/qztray';
import '@artisan-toolbox/front-awesome/web-awesome.css';
import { createQzBridge } from '../../resources/js/printing/bridge';
import { printingPdfBase64 } from './fixtures/printingPdf';
import preflight from 'tailwindcss/preflight.css?raw';

function deferred<Value>() {
    let resolve: (value: Value) => void = () => {};
    const promise = new Promise<Value>((done) => {
        resolve = done;
    });
    return { promise, resolve };
}
function mount(overrides: Partial<PrintBridge> = {}, options: Partial<PrintingOptions> = {}) {
    const bridge: PrintBridge = {
        connect: vi.fn(async () => {}),
        getPrinters: vi.fn(async () => ['Office printer', 'Receipt printer']),
        render: vi.fn((document, settings) => renderPrintRequest(document, settings)),
        print: vi.fn(async () => {}),
        ...overrides,
    };
    const printing = createPrinting({
        bridge,
        storage: false,
        autoAdvance: false,
        showSummary: true,
        defaults: {
            escpos: { printer: 'Receipt printer' },
            pdf: { printer: 'Office printer' },
            zpl: { printer: 'Office printer' },
        },
        ...options,
    });
    const container = document.createElement('div');
    document.body.append(container);
    const originalClasses = document.documentElement.className;
    document.documentElement.classList.add('wa-theme-default', 'wa-light');
    const app = createApp({
        setup() {
            const injected = usePrinting();
            expect(injected).toBe(printing);
            return () => h(PrintDrawer);
        },
    }).use(createFrontAwesome({ printing }));
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
        document.documentElement.className = originalClasses;
    });
    return { printing, bridge, app, container };
}
const receipt = btoa(
    '\x1b@\x1ba\x01ARTISAN TOOLBOX\n\x1ba\x00Order #1042\n\nCoffee beans          24.00\nPaper filters          6.00\n--------------------------\nTOTAL                 30.00\n\nThank you!\n\n\x1dV\x00',
);

async function reviewReady(printing: ReturnType<typeof createPrinting>) {
    await expect
        .poll(() => printing.currentStep.value?.preview.status, { timeout: 10000 })
        .toBe('ready');
    await expect.poll(() => printing.state.value.connection).toBe('ready');
    await expect
        .poll(() => document.querySelector('wa-drawer')?.shadowRoot?.querySelector('dialog')?.open)
        .toBe(true);
    await expect
        .poll(
            () =>
                document
                    .querySelector('wa-drawer')
                    ?.shadowRoot?.querySelector('dialog')
                    ?.getAnimations()
                    .filter((animation) => animation.playState === 'running').length,
        )
        .toBe(0);
    await expect
        .element(page.getByRole('button', { name: 'Send to printer', exact: true }))
        .toBeEnabled();
}

test('renders real ESC/POS pages and reviews promised multi-file steps before explicit submissions', async () => {
    const { printing, bridge } = mount();
    const source = deferred<{ receipt: string[]; optional: null; invoice: string }>();
    const handle = printing.job({
        title: 'Order #1042',
        source: source.promise,
        steps: [
            { type: 'escpos', flavor: 'base64', key: 'receipt', title: 'Customer receipt' },
            { type: 'pdf', flavor: 'base64', key: 'optional', title: 'Optional invoice' },
            { type: 'pdf', flavor: 'base64', key: 'invoice', title: 'Merchant copy' },
        ],
    });
    await expect.element(page.getByText('Loading your document…')).toBeVisible();
    source.resolve({ receipt: [receipt, receipt], optional: null, invoice: printingPdfBase64() });
    await reviewReady(printing);
    await expect.element(page.getByRole('img', { name: 'Customer receipt, Page 1' })).toBeVisible();
    await expect.element(page.getByText('Page 1 of 2')).toBeVisible();
    await page.getByRole('button', { name: 'Next page' }).click();
    await expect.element(page.getByRole('img', { name: 'Customer receipt, Page 2' })).toBeVisible();
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await expect.element(page.getByText('125%')).toBeVisible();
    await page.getByRole('button', { name: 'Send to printer', exact: true }).click();
    await expect
        .element(page.getByText('Physical printing is not confirmed.', { exact: false }))
        .toBeVisible();
    expect(bridge.print).toHaveBeenCalledTimes(1);
    await page.getByRole('button', { name: 'Next document', exact: true }).click();
    await reviewReady(printing);
    expect(printing.currentStep.value?.title).toBe('Merchant copy');
    await expect.element(page.getByRole('img', { name: 'Merchant copy, Page 1' })).toBeVisible();
    await expect.element(page.getByText('Page 1 of 2')).toBeVisible();
    await expect.element(page.getByText('Step 3 of 3', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Send to printer', exact: true }).click();
    await expect.element(page.getByRole('heading', { name: 'Job summary' })).toBeVisible();
    expect((await handle.finished).steps.map((step) => step.status)).toEqual([
        'submitted',
        'skipped',
        'submitted',
    ]);
    await page.getByRole('button', { name: 'Done', exact: true }).click();
    expect(printing.state.value.visible).toBe(false);
});

test('supports reconnect, preview retry, printer selection and invalid copy recovery through real controls', async () => {
    let failConnect = true;
    let failRender = true;
    const { printing, bridge, container } = mount(
        {
            connect: async () => {
                if (failConnect) throw new Error('offline');
            },
            render: async (document, settings) => {
                if (failRender) throw new Error('preview offline');
                return renderPrintRequest(document, settings);
            },
        },
        { defaults: {} },
    );
    printing.escpos(receipt);
    await expect.element(page.getByRole('button', { name: 'Retry preview' })).toBeVisible();
    await expect
        .element(
            page
                .getByText('Could not connect to QZ Tray or load printers.', { exact: false })
                .last(),
        )
        .toBeVisible();
    failConnect = false;
    failRender = false;
    await page.getByRole('button', { name: 'Reconnect', exact: true }).click();
    await page.getByRole('button', { name: 'Retry preview', exact: true }).click();
    await expect
        .poll(() => printing.currentStep.value?.preview.status, { timeout: 10000 })
        .toBe('ready');
    const select = page.getByRole('combobox', { name: 'Printer', exact: true });
    await select.click();
    await page.getByRole('option', { name: 'Receipt printer' }).click();
    const copies = page.getByRole('spinbutton', { name: 'Copies' });
    await copies.fill('0');
    await expect
        .element(page.getByRole('button', { name: 'Send to printer', exact: true }))
        .toBeDisabled();
    await copies.fill('2');
    await reviewReady(printing);
    await page.getByRole('button', { name: 'Send to printer', exact: true }).click();
    expect(bridge.print).toHaveBeenCalledWith(
        expect.objectContaining({
            printer: 'Receipt printer',
            options: expect.objectContaining({ copies: 2 }),
        }),
    );
    expect(container.querySelector('wa-drawer')).not.toBeNull();
});

test('allows drawer dismissal without cancelling or disconnecting and disposal settles pending jobs', async () => {
    const { printing, app } = mount();
    const source = deferred<string>();
    const handle = printing.escpos(source.promise);
    await expect.element(page.getByText('Loading your document…')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => printing.state.value.visible).toBe(false);
    expect(printing.currentStep.value?.status).toBe('loading');
    printing.show();
    app.unmount();
    expect((await handle.finished).steps[0]?.status).toBe('cancelled');
    source.resolve(receipt);
    expect(printing.state.value.disposed).toBe(true);
});

test.each([
    { width: 1280, mode: 'light' },
    { width: 390, mode: 'light' },
    { width: 1280, mode: 'dark' },
    { width: 390, mode: 'dark' },
])(
    'keeps the review canvas and settings usable at $width in $mode mode',
    async ({ width, mode }) => {
        await page.viewport(width, 900);
        const { printing, container } = mount();
        document.documentElement.classList.toggle('wa-dark', mode === 'dark');
        document.documentElement.classList.toggle('wa-light', mode === 'light');
        printing.escpos(receipt, { title: 'Customer receipt' });
        await reviewReady(printing);
        await expect
            .element(page.getByRole('img', { name: 'Customer receipt, Page 1' }))
            .toBeVisible();
        const workspace = container.querySelector('.print-workspace');
        const settings = container.querySelector('.print-settings');
        const preview = container.querySelector('.print-preview');
        expect(workspace).not.toBeNull();
        expect(settings).not.toBeNull();
        expect(preview).not.toBeNull();
        if (settings && preview) {
            const settingsRect = settings.getBoundingClientRect();
            const previewRect = preview.getBoundingClientRect();
            expect(settingsRect.right).toBeLessThanOrEqual(width);
            if (width < 700) expect(settingsRect.top).toBeGreaterThan(previewRect.top);
            else expect(settingsRect.left).toBeGreaterThan(previewRect.left);
        }
        await page.screenshot({
            path: `../../build/printing/printing-${width}-${mode}.png`,
            fullPage: true,
        });
    },
);

test('renders real ZPL labels with configured dimensions and waits for explicit submission', async () => {
    const { printing, bridge } = mount(
        {},
        { previewOptions: { zpl: { widthMm: 50, heightMm: 30, dpmm: 8 } } },
    );
    const job = printing.zpl(
        '^XA^FO20,20^A0N,28,28^FDOrder 1042^FS^XZ\n^XA^FO20,20^A0N,28,28^FDPacking copy^FS^XZ',
        { title: 'Shipping labels' },
    );
    await reviewReady(printing);
    await expect.element(page.getByRole('img', { name: 'Shipping labels, Page 1' })).toBeVisible();
    await expect.element(page.getByText('Page 1 of 2')).toBeVisible();
    expect(bridge.print).not.toHaveBeenCalled();
    await page.getByRole('button', { name: 'Send to printer', exact: true }).click();
    expect((await job.finished).steps[0]?.status).toBe('submitted');
});

test('materializes authenticated file bytes once and sends the reviewed snapshot after the remote file changes', async () => {
    const originalFetch = globalThis.fetch;
    const first = printingPdfBase64();
    let current = first;
    let downloads = 0;
    let authenticated = false;
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
        const url = input instanceof Request ? input.url : input.toString();
        if (!url.endsWith('/private/printing-invoice.pdf')) return originalFetch(input, init);
        downloads++;
        authenticated = new Headers(init?.headers).get('Authorization') === 'Bearer document-test';
        return Promise.resolve(
            new Response(
                Uint8Array.from(atob(current), (character) => character.charCodeAt(0)),
                { headers: { 'content-type': 'application/pdf' } },
            ),
        );
    });
    onTestFinished(() => fetch.mockRestore());
    const { printing, bridge } = mount(
        { prepare: createQzBridge().prepare },
        { previewOptions: { requestInit: { headers: { Authorization: 'Bearer document-test' } } } },
    );
    const job = printing.pdf('/private/printing-invoice.pdf', { title: 'Private invoice' });
    await reviewReady(printing);
    current = btoa('different server file');
    printing.configure({ options: { copies: 2 } });
    await reviewReady(printing);
    await page.getByRole('button', { name: 'Send to printer', exact: true }).click();
    expect(authenticated).toBe(true);
    expect(downloads).toBe(1);
    expect(bridge.print).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'pdf', flavor: 'base64', payload: first }),
    );
    expect((await job.finished).steps[0]?.status).toBe('submitted');
});

test('keeps a reviewed blob document available after its original URL is revoked', async () => {
    const payload = printingPdfBase64();
    const url = URL.createObjectURL(
        new Blob([Uint8Array.from(atob(payload), (character) => character.charCodeAt(0))], {
            type: 'application/pdf',
        }),
    );
    onTestFinished(() => URL.revokeObjectURL(url));
    const { printing, bridge } = mount({ prepare: createQzBridge().prepare });
    const job = printing.pdf(url);
    await reviewReady(printing);
    URL.revokeObjectURL(url);
    await page.getByRole('button', { name: 'Send to printer', exact: true }).click();
    expect(bridge.print).toHaveBeenCalledWith(
        expect.objectContaining({ flavor: 'base64', payload }),
    );
    expect((await job.finished).steps[0]?.status).toBe('submitted');
});

test('centers fit-page PDF paper under Tailwind Preflight and retains page controls', async () => {
    await page.viewport(1280, 900);
    const style = document.createElement('style');
    style.textContent = `@layer base { ${preflight} }`;
    document.head.append(style);
    onTestFinished(() => style.remove());
    const { printing, container } = mount();
    printing.pdfBase64(printingPdfBase64(), { title: 'Invoice preview' });
    await reviewReady(printing);
    const image = container.querySelector<HTMLImageElement>('.print-paper');
    const stage = container.querySelector('.print-paper-stage');
    if (!image || !stage) throw new Error('Expected PDF paper and its preview stage.');
    const imageRect = image.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    expect(getComputedStyle(image).display).toBe('block');
    expect(
        Math.abs((imageRect.left + imageRect.right) / 2 - (stageRect.left + stageRect.right) / 2),
    ).toBeLessThan(1);
    expect(imageRect.height).toBeLessThan(stageRect.height);
    await expect.element(page.getByRole('button', { name: 'Next page' })).toBeVisible();
    await page.screenshot({
        path: '../../build/printing/printing-pdf-preflight.png',
        fullPage: true,
    });
});

test('bounds large-screen review and groups completed documents in a narrower summary', async () => {
    await page.viewport(1920, 1080);
    const { printing, container } = mount();
    printing.job({
        source: { first: receipt, second: receipt, third: receipt },
        steps: [
            { type: 'escpos', flavor: 'base64', key: 'first', title: 'Receipt' },
            { type: 'escpos', flavor: 'base64', key: 'second', title: 'Merchant copy' },
            { type: 'escpos', flavor: 'base64', key: 'third', title: 'Packing copy' },
        ],
    });
    await reviewReady(printing);
    const drawer = container.querySelector('wa-drawer');
    const dialog = drawer?.shadowRoot?.querySelector('dialog');
    const stage = container.querySelector('.print-paper-stage');
    if (!dialog || !stage) throw new Error('Expected the print dialog and preview stage.');
    const reviewWidth = dialog.getBoundingClientRect().width;
    expect(reviewWidth).toBeLessThan(1100);
    expect(stage.getBoundingClientRect().height).toBeLessThanOrEqual(512);
    for (let index = 0; index < 3; index++) {
        await reviewReady(printing);
        await printing.submit();
        if (index < 2) printing.next();
    }
    await expect.element(page.getByRole('heading', { name: 'Job summary' })).toBeVisible();
    expect(dialog.getBoundingClientRect().width).toBeLessThan(reviewWidth);
    expect(dialog.getBoundingClientRect().width).toBeLessThan(720);
    const results = container.querySelector('.print-results');
    if (!results) throw new Error('Expected completed document results.');
    expect(results.children.length).toBe(3);
    expect(results.getBoundingClientRect().height).toBeLessThan(400);
    await page.screenshot({
        path: '../../build/printing/printing-summary-1920.png',
        fullPage: true,
    });
});

test('uses remembered format printers and advances after one click without confirmation or a report by default', async () => {
    const storageKey = 'printing-simple-browser';
    localStorage.setItem(
        storageKey,
        JSON.stringify({
            escpos: { printer: 'Receipt printer' },
            pdf: { printer: 'Office printer' },
            zpl: { printer: 'Office printer' },
        }),
    );
    onTestFinished(() => localStorage.removeItem(storageKey));
    const { printing, bridge, container } = mount(
        {},
        {
            autoAdvance: undefined,
            showSummary: undefined,
            defaults: undefined,
            storage: localStorage,
            storageKey,
            previewOptions: { zpl: { widthMm: 50, heightMm: 30, dpmm: 8 } },
        },
    );
    const handle = printing.job({
        source: {
            receipt,
            invoice: printingPdfBase64(),
            label: '^XA^FO20,20^A0N,28,28^FDOrder 1042^FS^XZ',
        },
        steps: [
            { type: 'escpos', flavor: 'base64', key: 'receipt', title: 'Receipt' },
            { type: 'pdf', flavor: 'base64', key: 'invoice', title: 'Invoice' },
            { type: 'zpl', key: 'label', title: 'Label' },
        ],
    });
    for (const [index, printer] of [
        'Receipt printer',
        'Office printer',
        'Office printer',
    ].entries()) {
        await reviewReady(printing);
        expect(printing.currentStep.value?.printer).toBe(printer);
        expect(bridge.print).toHaveBeenCalledTimes(index);
        expect(container.querySelector('.print-results')).toBeNull();
        await page.getByRole('button', { name: 'Send to printer', exact: true }).click();
    }
    expect((await handle.finished).steps.map((step) => step.status)).toEqual([
        'submitted',
        'submitted',
        'submitted',
    ]);
    await expect.poll(() => printing.state.value.visible).toBe(false);
    expect(container.querySelector('.print-results')).toBeNull();
    expect(printing.currentJob.value).toBeUndefined();
});

test('keeps the ready connection when promoting queued jobs', async () => {
    const reconnect = deferred<void>();
    const connect = vi
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockImplementation(() => reconnect.promise);
    const { printing, bridge } = mount({ connect }, { autoAdvance: true, showSummary: false });
    printing.escpos(receipt, { flavor: 'base64', title: 'First receipt' });
    printing.escpos(receipt, { flavor: 'base64', title: 'Second receipt' });
    await reviewReady(printing);
    await page.getByRole('button', { name: 'Send to printer', exact: true }).click();
    await reviewReady(printing);
    expect(printing.currentStep.value?.title).toBe('Second receipt');
    expect(bridge.connect).toHaveBeenCalledTimes(1);
    expect(bridge.print).toHaveBeenCalledTimes(1);
});

test('does not send the promoted document from the second click of a double-click', async () => {
    const { printing, bridge } = mount(
        { render: async () => ['data:image/png;base64,cHJldmlldw=='] },
        { autoAdvance: undefined, showSummary: undefined },
    );
    printing.job({
        source: { first: receipt, second: receipt },
        steps: [
            { type: 'escpos', flavor: 'base64', key: 'first', title: 'First' },
            { type: 'escpos', flavor: 'base64', key: 'second', title: 'Second' },
        ],
    });
    await reviewReady(printing);
    await userEvent.dblClick(page.getByRole('button', { name: 'Send to printer', exact: true }));
    await reviewReady(printing);
    expect(bridge.print).toHaveBeenCalledTimes(1);
    expect(printing.currentStep.value).toMatchObject({ title: 'Second', status: 'ready' });
});

test('does not acknowledge an uncertain outcome with the second click of Print', async () => {
    const { printing, bridge } = mount(
        {
            render: async () => ['data:image/png;base64,cHJldmlldw=='],
            print: vi.fn(async () => {
                throw new Error('Lost response');
            }),
        },
        { autoAdvance: undefined, showSummary: undefined },
    );
    printing.job({
        source: { first: receipt, second: receipt },
        steps: [
            { type: 'escpos', flavor: 'base64', key: 'first', title: 'First' },
            { type: 'escpos', flavor: 'base64', key: 'second', title: 'Second' },
        ],
    });
    await reviewReady(printing);
    await userEvent.dblClick(page.getByRole('button', { name: 'Send to printer', exact: true }));
    expect(bridge.print).toHaveBeenCalledTimes(1);
    expect(printing.currentStep.value).toMatchObject({ title: 'First', status: 'unknown' });
    await expect
        .element(page.getByRole('button', { name: 'Next document', exact: true }))
        .toBeVisible();
    expect(document.querySelector('.print-results')).toBeNull();
});
