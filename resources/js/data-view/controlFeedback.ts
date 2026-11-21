import { onScopeDispose, ref, watch } from 'vue';
import type { AsyncOutcome } from '@artisan-toolbox/dapter';
import type { DataViewHandle, DataViewLabelSubject } from './types';

export type ControlLabel = (
    subject: Exclude<DataViewLabelSubject<never, never>, { kind: 'row' }>,
) => string;

export type ControlLabelFormatter = (subject: Parameters<ControlLabel>[0]) => string | undefined;

export function resolveControlLabel(
    subject: Parameters<ControlLabel>[0],
    format?: ControlLabelFormatter,
): string {
    const label = format?.(subject);
    if (label !== undefined) return label;
    if (subject.kind === 'field') return subject.field;
    if (subject.kind === 'filter')
        return subject.field === null
            ? subject.filter
            : `${resolveControlLabel({ kind: 'field', field: subject.field }, format)} · ${subject.filter}`;
    return typeof subject.value === 'string'
        ? JSON.stringify(subject.value)
        : String(subject.value);
}

export function useControlFeedback(adapter: () => DataViewHandle, signature: () => string) {
    const message = ref('');
    let generation = 0;
    function invalidate() {
        generation++;
        message.value = '';
    }
    watch(signature, invalidate, { flush: 'sync' });
    onScopeDispose(invalidate);
    async function run(command: () => Promise<AsyncOutcome>, showAdapterError = false) {
        invalidate();
        // Dapter can synchronously publish the requested state before returning its promise.
        const result = command();
        const token = generation;
        const outcome = await result;
        if (
            token === generation &&
            outcome.status === 'failure' &&
            (showAdapterError || adapter().error !== outcome.error)
        )
            message.value = outcome.error.message;
    }
    return { message, invalidate, run };
}
