import { onScopeDispose, ref, watch } from 'vue';
import type { AsyncOutcome } from '@artisan-toolbox/dapter';
import type { DataViewHandle, DataViewLabelSubject } from './types';

export type ControlLabel = (
    subject: Exclude<DataViewLabelSubject<never, never>, { kind: 'row' }>,
) => string;

export function useControlFeedback(adapter: () => DataViewHandle, signature: () => string) {
    const message = ref('');
    let generation = 0;
    function invalidate() {
        generation++;
        message.value = '';
    }
    watch(signature, invalidate, { flush: 'sync' });
    onScopeDispose(invalidate);
    async function run(command: () => Promise<AsyncOutcome>) {
        invalidate();
        // Dapter can synchronously publish the requested state before returning its promise.
        const result = command();
        const token = generation;
        const outcome = await result;
        if (
            token === generation &&
            outcome.status === 'failure' &&
            adapter().error !== outcome.error
        )
            message.value = outcome.error.message;
    }
    return { message, invalidate, run };
}
