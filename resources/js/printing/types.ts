import type {
    QzTrayPrintDocument,
    QzTrayPrintOptions,
    QzTrayPrintRequest,
    QzTrayRenderPrintRequestOptions,
} from '@artisan-toolbox/qztray';
import type { App, ComputedRef } from 'vue';
import type { PrintingMessages } from './messages';

type SplitFormat<Document> = Document extends { type: infer Format }
    ? Format extends string
        ? Omit<Document, 'type'> & { type: Format }
        : never
    : never;
export type PrintDocument = SplitFormat<QzTrayPrintDocument>;
export type PrintFormat = PrintDocument['type'];
export type PrintSource<Payload> =
    | Payload
    | Record<string, unknown>
    | PromiseLike<Payload | Record<string, unknown>>;
type AsyncDocument<Document> = Document extends PrintDocument
    ? Omit<Document, 'payload'> & { payload: PrintSource<Document['payload']> }
    : never;
export type PrintInputDocument = AsyncDocument<PrintDocument>;
type Step<Document> = Document extends PrintDocument
    ? Omit<Document, 'payload'> & {
          key?: string;
          title?: string;
          previewOptions?: QzTrayRenderPrintRequestOptions;
      }
    : never;
export type PrintJobStep = Step<PrintDocument>;
export interface PrintJobOptions {
    title?: string;
    autoAdvance?: boolean;
    showSummary?: boolean;
}
export interface PrintTaskOptions extends PrintJobOptions {
    key?: string;
}
export type PrintFormatOptions<Format extends PrintFormat> = Omit<
    Extract<PrintJobStep, { type: Format }>,
    'type'
> &
    Pick<PrintJobOptions, 'autoAdvance' | 'showSummary'>;
export interface PrintJobInput extends PrintJobOptions {
    source: unknown;
    steps: readonly PrintJobStep[];
}
export type PrintStepOutcome = 'submitted' | 'skipped' | 'cancelled' | 'failed' | 'unknown';
export type PrintStepStatus = 'loading' | 'ready' | 'submitting' | PrintStepOutcome;
export interface PrintStepResult {
    id: string;
    title: string;
    status: PrintStepOutcome;
    message?: string;
}
export interface PrintJobResult {
    id: string;
    title: string;
    steps: readonly PrintStepResult[];
}
export interface PrintJobHandle {
    id: string;
    finished: Promise<PrintJobResult>;
    cancel(): void;
}
export interface PrintStepView {
    id: string;
    title: string;
    type: PrintFormat;
    status: PrintStepStatus;
    document?: PrintDocument;
    printer: string;
    message?: string;
    preview: {
        status: 'idle' | 'loading' | 'ready' | 'failed';
        images: readonly string[];
        message?: string;
    };
}
export interface PrintJobView {
    id: string;
    title: string;
    status: 'queued' | 'active' | 'complete';
    steps: readonly PrintStepView[];
    stepIndex: number;
    autoAdvance: boolean;
    showSummary: boolean;
}
export interface PrintingState {
    visible: boolean;
    jobs: readonly PrintJobView[];
    connection: 'idle' | 'connecting' | 'ready' | 'failed';
    printers: readonly string[];
    connectionError?: string;
    disposed: boolean;
}
export interface PrintBridge {
    prepare?(
        this: void,
        document: PrintDocument,
        options?: QzTrayRenderPrintRequestOptions,
    ): Promise<PrintDocument>;
    connect(this: void): Promise<unknown>;
    getPrinters(this: void): Promise<string[]>;
    render(
        this: void,
        document: PrintDocument,
        options?: QzTrayRenderPrintRequestOptions,
    ): Promise<string[]>;
    print(this: void, request: QzTrayPrintRequest): Promise<unknown>;
}
export interface PrintPreference {
    printer?: string;
    options?: QzTrayPrintOptions;
}
export interface PrintingOptions {
    bridge?: PrintBridge;
    messages?: Partial<PrintingMessages>;
    previewOptions?: QzTrayRenderPrintRequestOptions;
    defaults?: Partial<Record<PrintFormat, PrintPreference>>;
    /** Preferences only. Documents and payloads are never stored. false disables browser storage. */
    storage?: Pick<Storage, 'getItem' | 'setItem'> | false;
    storageKey?: string;
    autoAdvance?: boolean;
    showSummary?: boolean;
}
export interface PrintingService {
    messages: Readonly<PrintingMessages>;
    state: ComputedRef<PrintingState>;
    currentJob: ComputedRef<PrintJobView | undefined>;
    currentStep: ComputedRef<PrintStepView | undefined>;
    print(document: PrintInputDocument, options?: PrintTaskOptions): PrintJobHandle;
    pdf(
        payload: PrintSource<Extract<PrintDocument, { type: 'pdf' }>['payload']>,
        options?: PrintFormatOptions<'pdf'>,
    ): PrintJobHandle;
    pdfBase64(
        payload: PrintSource<Extract<PrintDocument, { type: 'pdf' }>['payload']>,
        options?: Omit<PrintFormatOptions<'pdf'>, 'flavor'>,
    ): PrintJobHandle;
    escpos(
        payload: PrintSource<Extract<PrintDocument, { type: 'escpos' }>['payload']>,
        options?: PrintFormatOptions<'escpos'>,
    ): PrintJobHandle;
    zpl(
        payload: PrintSource<Extract<PrintDocument, { type: 'zpl' | 'raw' }>['payload']>,
        options?: PrintFormatOptions<'zpl' | 'raw'>,
    ): PrintJobHandle;
    job(job: PrintJobInput): PrintJobHandle;
    configure(preference: PrintPreference): void;
    connect(): Promise<void>;
    preview(): Promise<void>;
    submit(): Promise<void>;
    skip(): void;
    cancel(id?: string): void;
    next(): void;
    show(): void;
    hide(): void;
    dispose(): void;
    install(app: App): void;
}
