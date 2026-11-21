import { computed } from 'vue';
import type { AsyncOutcome } from '@artisan-toolbox/dapter';
import { useControlFeedback } from './controlFeedback';
import type { DataViewHandle } from './types';

export function usePageNavigation(adapter: () => DataViewHandle, showAdapterError = false) {
    const paging = computed(() => adapter().paging);
    const busy = computed(() => paging.value.loading);
    const numbered = computed(() => {
        const { mode, current, pages, filtered, per_page, goToPage } = paging.value;
        if (
            !adapter().ready ||
            adapter().infinite ||
            mode !== 'offset' ||
            !goToPage ||
            current === null ||
            pages === null ||
            pages <= 1 ||
            filtered === null ||
            per_page.value === null
        )
            return null;
        return { page: current, total: filtered, pageSize: per_page.value, goToPage };
    });
    const feedback = useControlFeedback(adapter, () =>
        JSON.stringify([
            adapter().ready,
            adapter().requested?.paging,
            paging.value.mode,
            paging.value.per_page.options,
        ]),
    );
    const { message, invalidate } = feedback;
    const run = (command: () => Promise<AsyncOutcome>) => feedback.run(command, showAdapterError);
    function requestPage(page: number) {
        const target = numbered.value;
        if (!target || busy.value || page === target.page) return;
        const requested = adapter().requested?.paging;
        if (
            adapter().status === 'error' &&
            requested?.mode === 'offset' &&
            requested.current === page
        ) {
            void run(paging.value.reload);
        } else {
            void run(() => target.goToPage(page));
        }
    }
    return { paging, busy, numbered, requestPage, run, message, invalidate };
}
