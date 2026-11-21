<template>
    <div
        v-if="
            withSettings || numbered || adapter.infinite || paging.has_previous || paging.has_next
        "
        ref="pager"
        class="data-view-pager"
        :data-size="size"
    >
        <div class="pager-row">
            <Pagination
                v-if="numbered"
                :total="numbered.total"
                :page-size="numbered.pageSize"
                :page="numbered.page"
                :format="width < 416 ? 'compact' : 'standard'"
                :sibling-count="width >= 560 ? 2 : 1"
                appearance="outlined"
                :disabled="busy"
                :label="t('pagination')"
                @wa-before-page-change="navigate"
            />
            <nav
                v-else-if="adapter.infinite || paging.has_previous || paging.has_next"
                :aria-label="t('pagination')"
                class="pager-buttons"
            >
                <template v-if="adapter.infinite">
                    <Button
                        v-if="adapter.infinite.status === 'paused'"
                        :size="size"
                        :disabled="busy"
                        @click="run(adapter.infinite.retry)"
                        >{{ t('retryMore') }}</Button
                    >
                    <Button
                        v-else
                        :size="size"
                        :disabled="!canAppend"
                        :loading="adapter.infinite.status === 'loading'"
                        @click="run(adapter.infinite.append)"
                        >{{ t('loadMore') }}</Button
                    >
                    <span v-if="adapter.infinite.status === 'exhausted'" role="status">{{
                        t('exhausted')
                    }}</span>
                </template>
                <template v-else>
                    <Button
                        :size="size"
                        :disabled="!paging.has_previous || busy"
                        @click="traverse(false)"
                        >{{ t('previous') }}</Button
                    >
                    <span v-if="paging.current !== null">{{
                        t('page', { page: paging.current })
                    }}</span>
                    <Button
                        :size="size"
                        :disabled="!paging.has_next || busy"
                        @click="traverse(true)"
                        >{{ t('next') }}</Button
                    >
                </template>
            </nav>
            <ControlPanel
                v-if="withSettings"
                class="pager-settings"
                icon="forward-step"
                :label="t('pageSettings')"
                :size="size"
            >
                <DataViewPageSettings :adapter="adapter" :size="size" />
            </ControlPanel>
        </div>
        <span v-if="message" role="alert">{{ message }}</span>
    </div>
</template>
<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import { useElementSize } from '@vueuse/core';
import Button from '../components/WebAwesome/Button.vue';
import Pagination from '../components/WebAwesome/Pagination.vue';
import DataViewPageSettings from './DataViewPageSettings.vue';
import ControlPanel from './ControlPanel.vue';
import { usePageNavigation } from './pageNavigation';
import { useDataViewText } from './messages';
import type { DataViewHandle, DataViewSize } from './types';
const props = defineProps<{
    adapter: DataViewHandle;
    size: DataViewSize;
    withSettings?: boolean;
}>();
const t = useDataViewText();
const { width } = useElementSize(useTemplateRef('pager'));
const { paging, busy, numbered, requestPage, run, message } = usePageNavigation(
    () => props.adapter,
);
const canAppend = computed(
    () =>
        props.adapter.ready &&
        props.adapter.infinite?.status === 'idle' &&
        !busy.value &&
        paging.value.has_next,
);
function navigate(event: Event) {
    event.preventDefault();
    if (!('detail' in event)) return;
    const detail = event.detail;
    if (
        detail &&
        typeof detail === 'object' &&
        'page' in detail &&
        typeof detail.page === 'number'
    ) {
        requestPage(detail.page);
    }
}
function traverse(forward: boolean) {
    const page = paging.value;
    const { requested, status } = props.adapter;
    if (
        status === 'error' &&
        page.mode === 'simple' &&
        requested?.paging.mode === 'simple' &&
        page.current !== requested.paging.current
    ) {
        const adjacent = page.current + (forward ? 1 : -1);
        // Relative commands start at the requested ordinal, which may be the failed page.
        void run(
            adjacent === requested.paging.current
                ? page.reload
                : () =>
                      props.adapter.replaceState({
                          ...requested,
                          paging: { ...requested.paging, current: adjacent },
                      }),
        );
        return;
    }
    if (
        status === 'error' &&
        page.mode === 'cursor' &&
        requested?.paging.mode === 'cursor' &&
        requested.paging.cursor === (forward ? page.next_cursor : page.previous_cursor)
    ) {
        void run(page.reload);
        return;
    }
    void run(forward ? page.goToNext : page.goToPrevious);
}
</script>
<style scoped>
.data-view-pager {
    container: results-pager / inline-size;
    flex: 1 1 20rem;
    min-inline-size: 0;
    font-size: var(--wa-font-size-m);
}
.data-view-pager[data-size='s'] {
    font-size: var(--wa-font-size-s);
}
.data-view-pager[data-size='l'] {
    font-size: var(--wa-font-size-l);
}
.pager-row {
    display: grid;
    min-inline-size: 0;
    gap: var(--wa-space-s);
    align-items: center;
}
.pager-buttons,
wa-pagination::part(base),
wa-pagination::part(pages) {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
}
.pager-buttons {
    gap: var(--wa-space-s);
}
wa-pagination {
    display: block;
}
wa-pagination::part(base) {
    flex: 1;
}
wa-pagination::part(button),
wa-pagination::part(ellipsis),
wa-pagination::part(label) {
    min-block-size: var(--wa-form-control-height);
}
.pager-settings :deep(.panel-trigger) {
    inline-size: 100%;
}
@container results-pager (min-width: 416px) {
    .pager-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: end;
    }
    .pager-settings :deep(.panel-trigger) {
        inline-size: auto;
    }
}
@container data-view (max-width: 32rem) {
    .data-view-pager {
        flex: none;
        inline-size: 100%;
    }
}
</style>
