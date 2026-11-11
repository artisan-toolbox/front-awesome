import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { page } from 'vitest/browser';
import { createApp, h } from 'vue';
import { createFrontAwesome } from '@artisan-toolbox/front-awesome';
import { createPrinting, PrintDrawer } from '@artisan-toolbox/front-awesome/printing';
import { createLocalization } from '../../resources/js/localization';
import type { PrintBridge } from '../../resources/js/printing/types';
import catalog from './fixtures/printingCatalog.json';
import '@artisan-toolbox/front-awesome/web-awesome.css';

function deferred<Value>() {
    let resolve: (value: Value) => void = () => {};
    let reject: (reason: unknown) => void = () => {};
    const promise = new Promise<Value>((done, fail) => {
        resolve = done;
        reject = fail;
    });
    return { promise, resolve, reject };
}
function mount(overrides: Partial<PrintBridge> = {}) {
    const previous = document.documentElement.lang;
    document.documentElement.lang = 'es';
    const container = document.createElement('div');
    document.body.append(container);
    const bridge: PrintBridge = {
        prepare: vi.fn(async (document) => document),
        connect: vi.fn(async () => {}),
        getPrinters: vi.fn(async () => ['Office']),
        render: vi.fn(async () => [
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="white"/></svg>',
        ]),
        print: vi.fn(async () => {}),
        ...overrides,
    };
    const localization = createLocalization(catalog);
    const printing = createPrinting({
        storage: false,
        bridge,
        showSummary: true,
        autoAdvance: false,
        defaults: { pdf: { printer: 'Office' } },
    });
    const app = createApp({
        render: () =>
            h(PrintDrawer, { messages: { cancel: 'Literal cancel', submit: 'Literal send' } }),
    }).use(createFrontAwesome({ localization, printing }));
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
        document.documentElement.lang = previous;
    });
    const text = (key: string) => localization.t(`front-awesome::printing.${key}`);
    return { printing, localization, bridge, container, text };
}

test('updates the open drawer and summary on locale changes while keeping active requests and literal overrides intact', async () => {
    const source = deferred<string>();
    const request = deferred<void>();
    const { printing, localization, bridge, container, text } = mount({
        print: vi.fn(() => request.promise),
    });
    const handle = printing.pdfBase64(source.promise);
    printing.pdfBase64('queued', { title: 'Caller invoice' });
    await expect.poll(() => container.textContent).toContain(text('loadingDocument'));
    source.resolve('JVBERi0x');
    await expect.poll(() => printing.currentStep.value?.preview.status).toBe('ready');
    await expect.poll(() => printing.state.value.connection).toBe('ready');
    await expect
        .element(page.getByRole('button', { name: 'Literal send', exact: true }))
        .toBeEnabled();
    await expect
        .element(page.getByRole('button', { name: 'Literal cancel', exact: true }))
        .toBeVisible();
    await page.getByRole('button', { name: 'Literal send', exact: true }).click();
    expect(bridge.print).toHaveBeenCalledTimes(1);
    const renders = vi.mocked(bridge.render).mock.calls.length;
    const connections = vi.mocked(bridge.connect).mock.calls.length;
    localization.setLocale('pt-BR');
    await expect.poll(() => container.textContent).toContain(text('submitting'));
    expect(printing.currentJob.value?.title).toBe(text('title'));
    expect(printing.state.value.jobs[1]?.title).toBe('Caller invoice');
    request.reject(new Error('Submission interrupted.'));
    const settled = await handle.finished;
    expect(settled.steps[0]?.message).toBe(text('unknownOutcome'));
    await expect.poll(() => container.textContent).toContain(text('summary'));
    localization.setLocale('es');
    await expect.poll(() => container.textContent).toContain(text('unknownOutcome'));
    expect(settled.steps[0]?.message).toBe(
        catalog.locales['pt-BR'].messages['front-awesome::printing.unknownOutcome'],
    );
    expect(bridge.print).toHaveBeenCalledTimes(1);
    expect(bridge.render).toHaveBeenCalledTimes(renders);
    expect(bridge.connect).toHaveBeenCalledTimes(connections);
    expect(printing.currentStep.value?.printer).toBe('Office');
});

test('updates failed preview and connection text without retrying either operation on a locale change', async () => {
    const { printing, localization, bridge, container, text } = mount({
        render: vi.fn(async () => {
            throw new Error('Preview failed.');
        }),
        connect: vi.fn(async () => {
            throw new Error('Connection failed.');
        }),
    });
    printing.pdfBase64('JVBERi0x');
    await expect.poll(() => printing.currentStep.value?.preview.status).toBe('failed');
    await expect.poll(() => printing.state.value.connection).toBe('failed');
    await expect.poll(() => container.textContent).toContain(text('previewFailed'));
    localization.setLocale('pt_BR');
    await expect.poll(() => container.textContent).toContain(text('previewFailed'));
    await expect.poll(() => container.textContent).toContain(text('connectionFailed'));
    expect(bridge.render).toHaveBeenCalledTimes(1);
    expect(bridge.connect).toHaveBeenCalledTimes(1);
    expect(bridge.print).not.toHaveBeenCalled();
});
