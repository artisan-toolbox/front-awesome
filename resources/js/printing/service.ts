import { computed, inject, shallowRef } from 'vue';
import { localizationKey } from '../localization/context';
import type { LocalizationService } from '../localization/types';
import type { PrintingMessages } from './messages';
import { printingMessages } from './messages';
import { printingKey } from './context';
import { createQzBridge } from './bridge';
import { PrintDocumentError, resolveDocument, selectPayload, snapshot } from './document';
import type {
    PrintFormat,
    PrintJobHandle,
    PrintJobInput,
    PrintJobResult,
    PrintJobStep,
    PrintJobView,
    PrintPreference,
    PrintingOptions,
    PrintingService,
    PrintingState,
    PrintStepOutcome,
    PrintStepView,
} from './types';

type Step = Omit<PrintStepView, 'title'> & {
    title?: string;
    ordinal: number;
    messageKey?: keyof PrintingMessages;
    input: PrintJobStep;
    revision: number;
    printerSelected: boolean;
    acknowledged?: boolean;
};
type Job = Omit<PrintJobView, 'steps' | 'title'> & {
    title?: string;
    steps: Step[];
    settled: boolean;
    finish(result: PrintJobResult): void;
};
const terminal = new Set(['submitted', 'skipped', 'cancelled', 'failed', 'unknown']);
const outcomes = new Set<PrintStepOutcome>([
    'submitted',
    'skipped',
    'cancelled',
    'failed',
    'unknown',
]);

export function createPrinting(options: PrintingOptions = {}): PrintingService {
    const localization = shallowRef<LocalizationService>();
    const overrides = Object.freeze({ ...options.messages });
    const messages = { ...printingMessages };
    for (const [key, fallback] of Object.entries(printingMessages)) {
        Object.defineProperty(messages, key, {
            enumerable: true,
            get() {
                const override: unknown = Reflect.get(overrides, key);
                if (typeof override === 'string') return override;
                const service = localization.value;
                if (!service) return fallback;
                const name = `front-awesome::printing.${key}`;
                const translated = service.t(name);
                return translated === name ? fallback : translated;
            },
        });
    }
    Object.freeze(messages);
    const bridge = options.bridge ?? createQzBridge();
    const jobs: Job[] = [];
    const preferences: Partial<Record<PrintFormat, PrintPreference>> = {
        ...snapshot(options.defaults ?? {}),
    };
    const previewDefaults = snapshot(options.previewOptions ?? {});
    const storageKey = options.storageKey ?? 'front-awesome.printing';
    const state = shallowRef<PrintingState>({
        visible: false,
        jobs: [],
        connection: 'idle',
        printers: [],
        disposed: false,
    });
    let sequence = 0;
    let connectionRevision = 0;
    let connectionPromise: Promise<void> | undefined;
    function storage() {
        try {
            return options.storage === false
                ? undefined
                : (options.storage ??
                      (typeof localStorage === 'undefined' ? undefined : localStorage));
        } catch {
            return undefined;
        }
    }
    try {
        const saved: unknown = JSON.parse(storage()?.getItem(storageKey) ?? 'null');
        if (saved && typeof saved === 'object') {
            for (const format of ['pdf', 'escpos', 'zpl', 'raw'] as const) {
                const preference: unknown = Reflect.get(saved, format);
                if (preference && typeof preference === 'object') {
                    const printer: unknown = Reflect.get(preference, 'printer');
                    const copies: unknown = Reflect.get(preference, 'copies');
                    preferences[format] = {
                        ...preferences[format],
                        ...(typeof printer === 'string' ? { printer } : {}),
                        ...(typeof copies === 'number' && Number.isInteger(copies) && copies > 0
                            ? { options: { ...preferences[format]?.options, copies } }
                            : {}),
                    };
                }
            }
        }
    } catch {}
    function projectStep(step: Step): PrintStepView {
        return {
            id: step.id,
            title: step.title ?? `${messages.document} ${step.ordinal}`,
            type: step.type,
            status: step.status,
            document: step.document,
            printer: step.printer,
            message: step.messageKey ? messages[step.messageKey] : step.message,
            preview: {
                ...step.preview,
                ...(step.preview.status === 'failed' ? { message: messages.previewFailed } : {}),
            },
        };
    }
    function projectJobs(): PrintJobView[] {
        return jobs.map((job) => ({
            id: job.id,
            title: job.title ?? messages.title,
            status: job.status,
            stepIndex: job.stepIndex,
            autoAdvance: job.autoAdvance,
            showSummary: job.showSummary,
            steps: job.steps.map(projectStep),
        }));
    }
    function publish() {
        state.value = { ...state.value, jobs: projectJobs() };
    }
    const publicState = computed<PrintingState>(() => ({
        ...state.value,
        jobs: projectJobs(),
        ...(state.value.connection === 'failed'
            ? { connectionError: messages.connectionFailed }
            : {}),
    }));
    function current() {
        const job = jobs[0];
        return { job, step: job?.steps[job.stepIndex] };
    }
    function live(job: Job, step: Step) {
        return !state.value.disposed && jobs.includes(job) && !terminal.has(step.status);
    }
    function settle(job: Job) {
        if (job.settled || !job.steps.every((step) => terminal.has(step.status))) return;
        job.settled = true;
        job.status = 'complete';
        job.finish({
            id: job.id,
            title: job.title ?? messages.title,
            steps: job.steps.map((internal) => {
                const step = projectStep(internal);
                const status = outcomes.has(step.status as PrintStepOutcome)
                    ? (step.status as PrintStepOutcome)
                    : 'failed';
                return {
                    id: step.id,
                    title: step.title,
                    status,
                    ...(step.message ? { message: step.message } : {}),
                };
            }),
        });
    }
    function cancel(job: Job) {
        if (job.settled) return;
        if (job === jobs[0]) {
            connectionRevision++;
            connectionPromise = undefined;
            if (state.value.connection === 'connecting')
                state.value = { ...state.value, connection: 'idle' };
        }
        for (const step of job.steps) {
            if (!terminal.has(step.status)) {
                step.revision++;
                step.messageKey = step.status === 'submitting' ? 'cancelledSubmission' : undefined;
                step.message = undefined;
                step.status = step.status === 'submitting' ? 'unknown' : 'cancelled';
            }
        }
        settle(job);
        activate();
    }
    function previewOptions(step: Step) {
        const override = step.input.previewOptions ?? {};
        return {
            ...previewDefaults,
            ...override,
            ...(previewDefaults.pdf || override.pdf
                ? { pdf: { ...previewDefaults.pdf, ...override.pdf } }
                : {}),
            ...(previewDefaults.escpos || override.escpos
                ? { escpos: { ...previewDefaults.escpos, ...override.escpos } }
                : {}),
            ...(previewDefaults.zpl || override.zpl
                ? { zpl: { ...previewDefaults.zpl, ...override.zpl } }
                : {}),
        };
    }
    async function preview() {
        const { job, step } = current();
        if (!job || !step || step.status !== 'ready' || !step.document) return;
        if (step.type === 'raw') {
            step.preview = { status: 'ready', images: [] };
            publish();
            return;
        }
        const revision = ++step.revision;
        const document = step.document;
        step.preview = { status: 'loading', images: [] };
        publish();
        try {
            const images = await bridge.render(document, previewOptions(step));
            if (!live(job, step) || step.revision !== revision) return;
            if (!images.length || images.some((image) => typeof image !== 'string' || !image))
                throw new Error('No preview pages were returned.');
            step.preview = { status: 'ready', images: [...images] };
        } catch {
            if (!live(job, step) || step.revision !== revision) return;
            step.preview = { status: 'failed', images: [] };
        }
        publish();
    }
    function activate() {
        if (state.value.disposed) {
            publish();
            return;
        }
        while (jobs[0]?.settled && !jobs[0].showSummary) {
            const pendingOutcome = jobs[0].steps.findIndex(
                (step) =>
                    !step.acknowledged && (step.status === 'failed' || step.status === 'unknown'),
            );
            if (pendingOutcome >= 0) {
                jobs[0].stepIndex = pendingOutcome;
                break;
            }
            jobs.shift();
        }
        const { job, step } = current();
        if (!job) {
            state.value = { ...state.value, visible: false };
            publish();
            return;
        }
        if (!job.settled) job.status = 'active';
        if (
            step &&
            !step.printerSelected &&
            (step.status === 'ready' || step.status === 'loading')
        ) {
            step.printer = preferences[step.type]?.printer ?? '';
        }
        if (step?.status === 'skipped' && job.stepIndex < job.steps.length - 1) {
            job.stepIndex++;
            activate();
            return;
        }
        publish();
        if (step?.status === 'ready' && step.preview.status === 'idle') void preview();
    }
    function enqueue(input: PrintJobInput): PrintJobHandle {
        if (state.value.disposed)
            throw new Error(
                'This printing service has been disposed. Create a new service for a new application.',
            );
        if (!input.steps.length) throw new Error('A print job must contain at least one step.');
        const id = `print-${++sequence}`;
        let resolveFinished: (result: PrintJobResult) => void = () => {};
        const finished = new Promise<PrintJobResult>((resolve) => {
            resolveFinished = resolve;
        });
        const job: Job = {
            id,
            title: input.title,
            status: jobs.length ? 'queued' : 'active',
            stepIndex: 0,
            autoAdvance: input.autoAdvance ?? options.autoAdvance ?? true,
            showSummary: input.showSummary ?? options.showSummary ?? false,
            settled: false,
            finish: resolveFinished,
            steps: input.steps.map((raw, index) => {
                const preference = preferences[raw.type];
                const step = snapshot({
                    ...raw,
                    options: { ...preference?.options, ...raw.options },
                });
                return {
                    id: `${id}-${index + 1}`,
                    title: step.title,
                    ordinal: index + 1,
                    type: step.type,
                    input: step,
                    revision: 0,
                    status: 'loading',
                    printer: preference?.printer ?? '',
                    printerSelected: false,
                    preview: { status: 'idle', images: [] },
                };
            }),
        };
        jobs.push(job);
        state.value = { ...state.value, visible: true };
        publish();
        function capture(value: unknown, step: Step) {
            try {
                return snapshot(selectPayload(value, step.input.key, messages));
            } catch (error) {
                throw error instanceof PrintDocumentError
                    ? error
                    : new PrintDocumentError('invalidDocument', messages.invalidDocument);
            }
        }
        let asynchronous = true;
        try {
            asynchronous =
                input.source !== null &&
                (typeof input.source === 'object' || typeof input.source === 'function') &&
                'then' in input.source;
        } catch {}
        const shared = asynchronous
            ? Promise.resolve(input.source).catch(() => {
                  throw new PrintDocumentError('loadingFailed', messages.loadingFailed);
              })
            : undefined;
        const selections = job.steps.map((step) => {
            if (shared) return shared.then((value) => capture(value, step));
            try {
                return Promise.resolve(capture(input.source, step));
            } catch (error) {
                return Promise.reject(error);
            }
        });
        void Promise.all(
            job.steps.map(async (step, index) => {
                const revision = ++step.revision;
                try {
                    const payload = await selections[index];
                    if (!live(job, step) || step.revision !== revision) return;
                    if (step.input.key !== undefined && payload === null) {
                        step.status = 'skipped';
                        return;
                    }
                    const document = resolveDocument(step.input, payload, messages);
                    const prepared = bridge.prepare
                        ? await bridge.prepare(document, previewOptions(step))
                        : document;
                    if (!live(job, step) || step.revision !== revision) return;
                    step.document = snapshot(prepared);
                    step.status = 'ready';
                } catch (error) {
                    if (!live(job, step) || step.revision !== revision) return;
                    step.status = 'failed';
                    step.messageKey =
                        error instanceof PrintDocumentError
                            ? error.code
                            : error instanceof Error
                              ? undefined
                              : 'loadingFailed';
                    step.message =
                        error instanceof PrintDocumentError
                            ? undefined
                            : error instanceof Error
                              ? error.message
                              : undefined;
                } finally {
                    if (!state.value.disposed && jobs.includes(job)) {
                        settle(job);
                        activate();
                    }
                }
            }),
        );
        return { id, finished, cancel: () => cancel(job) };
    }
    function configure(preference: PrintPreference) {
        const { step } = current();
        if (!step || step.status !== 'ready' || !step.document) return;
        if (preference.printer !== undefined) {
            step.printer = preference.printer;
            step.printerSelected = true;
        }
        if (preference.options) {
            step.document = snapshot({
                ...step.document,
                options: { ...step.document.options, ...preference.options },
            });
            step.preview = { status: 'idle', images: [] };
            void preview();
        }
        publish();
    }
    function connect(): Promise<void> {
        if (state.value.disposed) return Promise.resolve();
        if (connectionPromise) return connectionPromise;
        const revision = ++connectionRevision;
        state.value = { ...state.value, connection: 'connecting', connectionError: undefined };
        connectionPromise = Promise.resolve().then(async () => {
            try {
                await bridge.connect();
                if (state.value.disposed || revision !== connectionRevision) return;
                const printers = await bridge.getPrinters();
                if (state.value.disposed || revision !== connectionRevision) return;
                state.value = { ...state.value, connection: 'ready', printers: [...printers] };
            } catch {
                if (state.value.disposed || revision !== connectionRevision) return;
                state.value = {
                    ...state.value,
                    connection: 'failed',
                    printers: [],
                    connectionError: undefined,
                };
            } finally {
                if (revision === connectionRevision) connectionPromise = undefined;
            }
        });
        return connectionPromise;
    }
    async function submit() {
        const { job, step } = current();
        if (!job || !step || step.status !== 'ready' || !step.document || state.value.disposed)
            return;
        const copies = step.document.options?.copies ?? 1;
        if (!Number.isInteger(copies) || copies < 1 || copies > 999) {
            step.messageKey = 'invalidCopies';
            step.message = undefined;
            publish();
            return;
        }
        if (
            !step.printer ||
            !state.value.printers.includes(step.printer) ||
            state.value.connection !== 'ready'
        ) {
            step.messageKey = 'printerRequired';
            step.message = undefined;
            publish();
            return;
        }
        if (step.preview.status !== 'ready') {
            step.messageKey = 'previewRequired';
            step.message = undefined;
            publish();
            return;
        }
        step.status = 'submitting';
        step.messageKey = undefined;
        step.message = undefined;
        const request = { ...step.document, printer: step.printer };
        publish();
        try {
            await bridge.print(request);
            if (!live(job, step)) return;
            step.status = 'submitted';
            step.messageKey = 'accepted';
            step.message = undefined;
            preferences[step.type] = {
                printer: step.printer,
                options: {
                    ...preferences[step.type]?.options,
                    copies: step.document.options?.copies ?? 1,
                },
            };
            try {
                storage()?.setItem(
                    storageKey,
                    JSON.stringify(
                        Object.fromEntries(
                            Object.entries(preferences).map(([format, pref]) => [
                                format,
                                { printer: pref?.printer, copies: pref?.options?.copies },
                            ]),
                        ),
                    ),
                );
            } catch {}
        } catch {
            if (!live(job, step)) return;
            step.status = 'unknown';
            step.messageKey = 'unknownOutcome';
            step.message = undefined;
        }
        settle(job);
        if (!job.settled && job.autoAdvance && step.status === 'submitted' && job === jobs[0])
            job.stepIndex++;
        activate();
    }
    const service: PrintingService = {
        messages,
        state: publicState,
        currentJob: computed(() => publicState.value.jobs[0]),
        currentStep: computed(() => {
            const job = publicState.value.jobs[0];
            return job?.steps[job.stepIndex];
        }),
        print(document, task = {}) {
            const { payload, ...step } = document;
            const { key, title, ...jobOptions } = task;
            return enqueue({
                ...jobOptions,
                title,
                source: payload,
                steps: [{ ...step, key, title }],
            });
        },
        pdf(payload, settings = {}) {
            const { key, title, autoAdvance, showSummary, ...document } = settings;
            return service.print(
                { type: 'pdf', payload, ...document },
                { key, title, autoAdvance, showSummary },
            );
        },
        pdfBase64(payload, settings = {}) {
            const { key, title, autoAdvance, showSummary, ...document } = settings;
            return service.print(
                { type: 'pdf', flavor: 'base64', payload, ...document },
                { key, title, autoAdvance, showSummary },
            );
        },
        escpos(payload, settings = {}) {
            const { key, title, autoAdvance, showSummary, ...document } = settings;
            return service.print(
                { type: 'escpos', flavor: 'base64', payload, ...document },
                { key, title, autoAdvance, showSummary },
            );
        },
        zpl(payload, settings = {}) {
            const { key, title, autoAdvance, showSummary, ...document } = settings;
            return service.print(
                { type: 'zpl', payload, ...document },
                { key, title, autoAdvance, showSummary },
            );
        },
        job: enqueue,
        configure,
        connect,
        preview,
        submit,
        skip() {
            const { job, step } = current();
            if (!job || !step || (step.status !== 'ready' && step.status !== 'loading')) return;
            step.revision++;
            step.status = 'skipped';
            settle(job);
            if (!job.settled && job.autoAdvance && job === jobs[0]) job.stepIndex++;
            activate();
        },
        cancel(id) {
            const job = id ? jobs.find((item) => item.id === id) : jobs[0];
            if (job) cancel(job);
        },
        next() {
            const { job, step } = current();
            if (!job || !step || !terminal.has(step.status)) return;
            step.acknowledged = true;
            if (job.settled && !job.showSummary) {
                activate();
                return;
            }
            if (!job.settled && job.stepIndex < job.steps.length - 1) job.stepIndex++;
            else jobs.shift();
            activate();
        },
        show() {
            if (!state.value.disposed) state.value = { ...state.value, visible: true };
        },
        hide() {
            state.value = { ...state.value, visible: false };
        },
        dispose() {
            if (state.value.disposed) return;
            connectionRevision++;
            state.value = { ...state.value, disposed: true, visible: false };
            for (const job of jobs) cancel(job);
            publish();
        },
        install(app) {
            localization.value = app.runWithContext(() => inject(localizationKey, undefined));
            app.provide(printingKey, service);
            app.config.globalProperties.$frontAwesome = {
                ...app.config.globalProperties.$frontAwesome,
                printing: service,
            };
            app.onUnmount(() => service.dispose());
        },
    };
    return service;
}
