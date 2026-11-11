import type { PrintingMessages } from './messages';
import type { PrintDocument, PrintJobStep } from './types';

export class PrintDocumentError extends Error {
    constructor(
        readonly code: 'missingDocument' | 'invalidDocument' | 'loadingFailed',
        message: string,
    ) {
        super(message);
        this.name = 'PrintDocumentError';
    }
}

export function snapshot<Value>(value: Value, ancestors = new Set<object>()): Value {
    if (!value || typeof value !== 'object') return value;
    const plain =
        Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null;
    if (!Array.isArray(value) && !plain) return value;
    if (ancestors.has(value))
        throw new TypeError('Print documents and options cannot contain circular data.');
    ancestors.add(value);
    const detached = Array.isArray(value)
        ? value.map((item: unknown) => snapshot(item, ancestors))
        : Object.fromEntries(
              Object.entries(value).map(([key, item]) => [key, snapshot(item, ancestors)]),
          );
    ancestors.delete(value);
    return Object.freeze(detached) as Value;
}

export function selectPayload(
    source: unknown,
    key: string | undefined,
    messages: PrintingMessages,
): unknown {
    if (key === undefined) return source;
    if (!source || typeof source !== 'object' || !Object.hasOwn(source, key))
        throw new PrintDocumentError('missingDocument', messages.missingDocument);
    return Reflect.get(source, key);
}

export function resolveDocument(
    step: PrintJobStep,
    payload: unknown,
    messages: PrintingMessages,
): PrintDocument {
    const files = Array.isArray(payload) ? payload : [payload];
    if (
        !files.length ||
        Array.from(files).some((file: unknown) => {
            if (typeof file === 'string') return file.trim().length === 0;
            return !(
                step.type === 'escpos' &&
                file !== null &&
                typeof file === 'object' &&
                'type' in file &&
                file.type === 'raw' &&
                'format' in file &&
                file.format === 'image' &&
                'flavor' in file &&
                (file.flavor === 'base64' || file.flavor === 'file') &&
                'data' in file &&
                typeof file.data === 'string' &&
                file.data.trim().length > 0
            );
        })
    )
        throw new PrintDocumentError('invalidDocument', messages.invalidDocument);
    const { key: _key, title: _title, previewOptions: _previewOptions, ...request } = step;
    return snapshot({ ...request, payload }) as PrintDocument;
}
