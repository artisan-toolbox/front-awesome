import { createRenderer } from 'vue';
import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { createLocalization } from '../../resources/js/localization';
import { createPrinting } from '../../resources/js/printing/service';
import type { PrintBridge, PrintingOptions } from '../../resources/js/printing/types';
import catalog from './fixtures/printingCatalog.json';

vi.mock('virtual:front-awesome/web-awesome-locales', () => ({ default: {} }));
const renderer = createRenderer<object, object>({
    createElement: () => ({}),
    createText: () => ({}),
    createComment: () => ({}),
    insert() {},
    remove() {},
    setText() {},
    setElementText() {},
    patchProp() {},
    parentNode: () => null,
    nextSibling: () => null,
});
function deferred<Value>() {
    let resolve: (value: Value) => void = () => {};
    let reject: (reason: unknown) => void = () => {};
    const promise = new Promise<Value>((done, fail) => {
        resolve = done;
        reject = fail;
    });
    return { promise, resolve, reject };
}
function setup(overrides: Partial<PrintBridge> = {}, options: Partial<PrintingOptions> = {}) {
    class Observer {
        observe() {}
        disconnect() {}
    }
    vi.stubGlobal('document', {
        documentElement: { lang: 'en' },
        defaultView: { MutationObserver: Observer },
    });
    const bridge: PrintBridge = {
        prepare: vi.fn(async (document) => document),
        connect: vi.fn(async () => {}),
        getPrinters: vi.fn(async () => ['Office']),
        render: vi.fn(async () => ['data:image/png;base64,cHJldmlldw==']),
        print: vi.fn(async () => {}),
        ...overrides,
    };
    const localization = createLocalization(catalog);
    const printing = createPrinting({
        storage: false,
        showSummary: true,
        autoAdvance: false,
        bridge,
        ...options,
    });
    const app = renderer
        .createApp({ render: () => null })
        .use(localization)
        .use(printing);
    app.mount({});
    onTestFinished(() => {
        app.unmount();
        vi.unstubAllGlobals();
    });
    const text = (key: string) => localization.t(`front-awesome::printing.${key}`);
    return { printing, localization, bridge, text };
}

test('translates loading, queued, active and summary projections without repeating print work', async () => {
    const source = deferred<string>();
    const submission = deferred<void>();
    const { printing, localization, bridge, text } = setup({
        print: vi.fn(() => submission.promise),
    });
    const active = printing.pdfBase64(source.promise);
    printing.pdfBase64('other', { title: 'Caller invoice' });
    localization.setLocale('es');
    expect(printing.currentJob.value?.title).toBe(text('title'));
    expect(printing.currentStep.value?.title).toBe(`${text('document')} 1`);
    expect(printing.state.value.jobs[1]?.title).toBe('Caller invoice');
    source.resolve('JVBERi0x');
    await vi.waitFor(() => expect(printing.currentStep.value?.preview.status).toBe('ready'));
    await printing.connect();
    printing.configure({ printer: 'Office' });
    const prepare = bridge.prepare;
    if (!prepare) throw new Error('The fixture requires the prepare bridge.');
    const before = {
        prepare: vi.mocked(prepare).mock.calls.length,
        render: vi.mocked(bridge.render).mock.calls.length,
        connect: vi.mocked(bridge.connect).mock.calls.length,
    };
    const pending = printing.submit();
    expect(printing.currentStep.value?.status).toBe('submitting');
    localization.setLocale('pt_BR');
    expect(printing.currentStep.value?.status).toBe('submitting');
    submission.reject(new Error('Transport interrupted.'));
    await pending;
    const finished = await active.finished;
    expect(finished.steps[0]?.message).toBe(text('unknownOutcome'));
    expect(finished.title).toBe(text('title'));
    expect(finished.steps[0]?.title).toBe(`${text('document')} 1`);
    localization.setLocale('es');
    expect(printing.currentStep.value?.message).toBe(text('unknownOutcome'));
    expect(printing.currentJob.value?.title).toBe(text('title'));
    expect(finished.title).toBe(catalog.locales['pt-BR'].messages['front-awesome::printing.title']);
    expect(finished.steps[0]?.message).toBe(
        catalog.locales['pt-BR'].messages['front-awesome::printing.unknownOutcome'],
    );
    expect(bridge.prepare).toHaveBeenCalledTimes(before.prepare);
    expect(bridge.render).toHaveBeenCalledTimes(before.render);
    expect(bridge.connect).toHaveBeenCalledTimes(before.connect);
    expect(bridge.print).toHaveBeenCalledTimes(1);
    expect(printing.currentStep.value?.printer).toBe('Office');
});

test('keeps semantic missing, invalid and loading failures live after locale changes', async () => {
    const { printing, localization, text, bridge } = setup();
    const handle = printing.job({
        source: { invalid: '' },
        steps: [
            { type: 'pdf', flavor: 'base64', key: 'missing' },
            { type: 'pdf', flavor: 'base64', key: 'invalid' },
        ],
    });
    const result = await handle.finished;
    expect(result.steps.map((step) => step.status)).toEqual(['failed', 'failed']);
    localization.setLocale('es');
    expect(printing.currentJob.value?.steps.map((step) => step.message)).toEqual([
        text('missingDocument'),
        text('invalidDocument'),
    ]);
    expect(result.steps[0]?.message).toBe(
        catalog.locales.en.messages['front-awesome::printing.missingDocument'],
    );
    printing.pdfBase64(Promise.reject(new Error('Server rejected.')));
    await vi.waitFor(() => expect(printing.state.value.jobs[1]?.steps[0]?.status).toBe('failed'));
    localization.setLocale('pt-BR');
    expect(printing.state.value.jobs[1]?.steps[0]?.message).toBe(text('loadingFailed'));
    expect(bridge.connect).not.toHaveBeenCalled();
    expect(bridge.render).not.toHaveBeenCalled();
    expect(bridge.print).not.toHaveBeenCalled();
});

test('translates preview and connection failures while preserving literal caller errors and overrides', async () => {
    const { printing, localization, text, bridge } = setup(
        {
            render: vi.fn(async () => {
                throw new Error('Renderer failed.');
            }),
            connect: vi.fn(async () => {
                throw new Error('QZ unavailable.');
            }),
        },
        { messages: { title: 'Custom title', invalidDocument: 'Custom invalid document' } },
    );
    printing.pdfBase64('JVBERi0x');
    await vi.waitFor(() => expect(printing.currentStep.value?.preview.status).toBe('failed'));
    await printing.connect();
    localization.setLocale('es');
    expect(printing.currentStep.value?.preview.message).toBe(text('previewFailed'));
    expect(printing.state.value.connectionError).toBe(text('connectionFailed'));
    expect(printing.currentJob.value?.title).toBe('Custom title');
    expect(printing.messages.title).toBe('Custom title');
    expect(printing.messages.invalidDocument).toBe('Custom invalid document');
    expect(bridge.connect).toHaveBeenCalledTimes(1);
    expect(bridge.render).toHaveBeenCalledTimes(1);
    expect(bridge.print).not.toHaveBeenCalled();
    const custom = setup({
        prepare: vi.fn(async () => {
            throw new Error('Application-specific failure');
        }),
    });
    const handle = custom.printing.pdfBase64('JVBERi0x');
    await handle.finished;
    custom.localization.setLocale('pt-BR');
    expect(custom.printing.currentStep.value?.message).toBe('Application-specific failure');
});
