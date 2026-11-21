<template>
    <p v-if="summary" role="status" class="data-view-result-status">{{ summary }}</p>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { localizationKey } from '../localization/context';
import { useDataViewText } from './messages';
import type { DataViewHandle } from './types';

const props = defineProps<{ adapter: DataViewHandle }>();
const t = useDataViewText();
const localization = inject(localizationKey, undefined);
const fallbackNumbers = new Intl.NumberFormat('en');
const number = (value: number) => localization?.n(value) ?? fallbackNumbers.format(value);

const summary = computed(() => {
    const { ready, status, data, paging, infinite } = props.adapter;
    if (!ready) {
        if (status === 'loading') return t('loading');
        if (status === 'idle') return t('idle');
        return '';
    }
    const { current, per_page, total, filtered } = paging;
    if (total === 0) return t('emptySource');
    if (filtered === 0) return t('emptyMatches');

    const parts: string[] = [];
    if (
        !infinite &&
        data.length &&
        paging.mode === 'offset' &&
        current !== null &&
        per_page.value !== null &&
        filtered !== null
    ) {
        const start = (current - 1) * per_page.value + 1;
        parts.push(
            t(
                total === filtered ? 'recordRange' : 'matchRange',
                {
                    first: number(start),
                    last: number(start + data.length - 1),
                    number: number(filtered),
                },
                filtered,
            ),
        );
    } else {
        parts.push(t(infinite ? 'inView' : 'onPage', { number: number(data.length) }, data.length));
        if (filtered !== null) parts.push(t('matchCount', { number: number(filtered) }, filtered));
    }
    if (total !== null && total !== filtered)
        parts.push(t('totalCount', { number: number(total) }));
    return parts.join(' · ');
});
</script>

<style scoped>
.data-view-result-status {
    margin: 0;
    color: var(--wa-color-text-quiet);
    font-size: var(--wa-font-size-s);
    font-variant-numeric: tabular-nums;
}
</style>
