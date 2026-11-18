<template>
    <nav class="data-view-pager min-w-0" :aria-label="t('pagination')">
        <div class="pager-buttons">
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
                    @click="run(paging.goToFirst)"
                    >{{ t('first') }}</Button
                >
                <Button
                    :size="size"
                    :disabled="!paging.has_previous || busy"
                    @click="run(paging.goToPrevious)"
                    >{{ t('previous') }}</Button
                >
                <span v-if="paging.current !== null">{{
                    paging.pages === null
                        ? t('page', { page: paging.current })
                        : t('pageOf', { page: paging.current, pages: paging.pages })
                }}</span>
                <Button
                    :size="size"
                    :disabled="!paging.has_next || busy"
                    @click="run(paging.goToNext)"
                    >{{ t('next') }}</Button
                >
                <Button
                    v-if="paging.goToLast"
                    :size="size"
                    :disabled="!paging.has_next || busy"
                    @click="run(paging.goToLast)"
                    >{{ t('last') }}</Button
                >
            </template>
            <Button
                :size="size"
                appearance="outlined"
                :disabled="busy"
                @click="run(paging.reload)"
                >{{ t('reload') }}</Button
            >
        </div>
        <div v-if="canJump || paging.per_page.options.length" class="pager-fields">
            <Input
                v-if="canJump"
                type="number"
                :label="t('jump')"
                :size="size"
                :min="1"
                :max="paging.pages ?? undefined"
                :disabled="busy"
                :model-value="pageDraft"
                :failed="
                    invalidDraft && paging.pages !== null
                        ? t('pageRange', { pages: paging.pages })
                        : undefined
                "
                @update:model-value="setPageDraft"
                @change="goToPage"
                @keydown.enter.prevent="goToPage"
            />
            <Select
                v-if="paging.per_page.options.length"
                :label="t('perPage')"
                :size="size"
                :model-value="String(paging.per_page.value)"
                :disabled="busy"
                @update:model-value="setPerPage"
            >
                <Option
                    v-for="count in paging.per_page.options"
                    :key="count"
                    :value="String(count)"
                    >{{ count }}</Option
                >
            </Select>
        </div>
        <p v-if="adapter.ready" class="pager-counts">
            <span>{{ t('loaded', {}, adapter.data.length) }}</span>
            <span v-if="paging.filtered !== null">{{ t('matching', {}, paging.filtered) }}</span>
            <span v-if="paging.total !== null">{{ t('total', {}, paging.total) }}</span>
            <span v-if="paging.filtered === null && paging.total === null">{{
                t('unknownCounts')
            }}</span>
        </p>
        <span v-if="message" role="alert">{{ message }}</span>
    </nav>
</template>
<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import Button from '../components/WebAwesome/Button.vue';
import Input from '../components/WebAwesome/Input.vue';
import Select from '../components/WebAwesome/Select.vue';
import Option from '../components/WebAwesome/Option.vue';
import { useControlFeedback } from './controlFeedback';
import { useDataViewText } from './messages';
import type { DataViewHandle, DataViewSize } from './types';
const props = defineProps<{ adapter: DataViewHandle; size: DataViewSize }>();
const t = useDataViewText();
const paging = computed(() => props.adapter.paging);
const busy = computed(() => paging.value.loading);
const canJump = computed(
    () => !props.adapter.infinite && !!paging.value.goToPage && !!paging.value.pages,
);
const canAppend = computed(
    () =>
        props.adapter.ready &&
        props.adapter.infinite?.status === 'idle' &&
        !busy.value &&
        paging.value.has_next,
);
const pageDraft = shallowRef('');
const invalidDraft = shallowRef(false);
const { run, message, invalidate } = useControlFeedback(
    () => props.adapter,
    () =>
        JSON.stringify([
            props.adapter.ready,
            props.adapter.requested?.paging,
            paging.value.mode,
            paging.value.per_page.options,
        ]),
);
function setPerPage(value: unknown) {
    const option = paging.value.per_page.options.find((count) => String(count) === value);
    if (!busy.value && option !== undefined) void run(() => paging.value.per_page.setValue(option));
}
watch(
    () => [canJump.value, paging.value.current] as const,
    ([, current]) => {
        pageDraft.value = String(current ?? '');
        invalidDraft.value = false;
    },
    { immediate: true, flush: 'sync' },
);
function setPageDraft(value: unknown) {
    if (typeof value !== 'string') return;
    pageDraft.value = value;
    invalidDraft.value = false;
    invalidate();
}
function goToPage() {
    const { pages, goToPage: go } = paging.value;
    if (!go || pages === null || busy.value) return;
    const page = Number(pageDraft.value);
    invalidDraft.value = !Number.isSafeInteger(page) || page < 1 || page > pages;
    if (!invalidDraft.value && page !== paging.value.current) void run(() => go(page));
}
</script>
<style scoped>
.data-view-pager {
    display: grid;
    gap: var(--wa-space-m);
    min-width: 0;
    padding-block-start: var(--wa-space-m);
    border-block-start: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
.pager-buttons,
.pager-fields,
.pager-counts {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--wa-space-s);
}
.pager-fields > * {
    min-width: 0;
    max-width: 100%;
    flex: 0 1 11em;
}
.pager-counts {
    margin: 0;
    color: var(--wa-color-text-quiet);
    font-size: var(--wa-font-size-s);
}
.pager-counts span + span {
    border-inline-start: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    padding-inline-start: var(--wa-space-s);
}
</style>
