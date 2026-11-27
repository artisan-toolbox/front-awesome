<template>
    <div class="pager-fields">
        <Input
            v-if="numbered"
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
            @change="submitPage"
            @keydown.enter.prevent="submitPage"
        />
        <Select
            v-if="paging.per_page.options.length > 1"
            :label="t('perPage')"
            :size="size"
            :model-value="sizeDraft"
            :disabled="busy"
            :options="paging.per_page.options.map(String)"
            :option-value="null"
            :option-label="null"
            @update:model-value="setPerPage"
        />
        <div class="pager-actions">
            <Button
                v-if="!adapter.infinite && paging.has_previous"
                :size="size"
                appearance="outlined"
                type="button"
                :disabled="busy"
                @click="numbered ? requestPage(1) : run(paging.goToFirst)"
            >
                <Icon
                    slot="start"
                    library="system"
                    name="backward-step"
                    class="page-direction"
                    aria-hidden="true"
                />
                {{ t('first') }}</Button
            >
            <Button
                v-if="!adapter.infinite && paging.goToLast && paging.has_next"
                :size="size"
                appearance="outlined"
                type="button"
                :disabled="busy"
                @click="numbered && paging.pages ? requestPage(paging.pages) : run(paging.goToLast)"
            >
                <Icon
                    slot="start"
                    library="system"
                    name="forward-step"
                    class="page-direction"
                    aria-hidden="true"
                />
                {{ t('last') }}</Button
            >
            <Button
                :size="size"
                appearance="outlined"
                type="button"
                :disabled="busy"
                @click="run(paging.reload)"
            >
                <span slot="start" class="reload-icon" aria-hidden="true">↻</span>
                {{ t('reload') }}</Button
            >
        </div>
        <span v-if="message" role="alert">{{ message }}</span>
    </div>
</template>
<script setup lang="ts">
import { shallowRef, watch } from 'vue';
import Button from '../components/WebAwesome/Button.vue';
import Input from '../components/WebAwesome/Input.vue';
import Select from '../components/WebAwesome/Select.vue';
import Icon from '../components/WebAwesome/Icon.vue';
import { usePageNavigation } from './pageNavigation';
import { useDataViewText } from './messages';
import type { DataViewHandle, DataViewSize } from './types';
const props = defineProps<{ adapter: DataViewHandle; size: DataViewSize }>();
const t = useDataViewText();
const { paging, busy, numbered, requestPage, run, message, invalidate } = usePageNavigation(
    () => props.adapter,
    true,
);
const pageDraft = shallowRef('');
const sizeDraft = shallowRef('');
const invalidDraft = shallowRef(false);
watch(
    [
        () => props.adapter,
        () => props.adapter.ready,
        () => paging.value.current,
        () => paging.value.per_page.value,
        () => paging.value.mode,
        busy,
    ],
    () => {
        if (busy.value) return;
        pageDraft.value = String(paging.value.current ?? '');
        sizeDraft.value = String(paging.value.per_page.value ?? '');
        invalidDraft.value = false;
    },
    { immediate: true, flush: 'sync' },
);
function setPerPage(value: unknown) {
    const option = paging.value.per_page.options.find((count) => String(count) === value);
    if (!busy.value && option !== undefined && option !== paging.value.per_page.value) {
        sizeDraft.value = String(option);
        if (
            props.adapter.status === 'error' &&
            props.adapter.requested?.paging.per_page === option
        ) {
            void run(paging.value.reload);
        } else {
            void run(() => paging.value.per_page.setValue(option));
        }
    }
}
function setPageDraft(value: unknown) {
    if (typeof value !== 'string') return;
    pageDraft.value = value;
    invalidDraft.value = false;
    invalidate();
}
function submitPage() {
    const target = numbered.value;
    const { pages } = paging.value;
    if (!target || pages === null || busy.value) return;
    const page = Number(pageDraft.value);
    invalidDraft.value = !Number.isSafeInteger(page) || page < 1 || page > pages;
    if (!invalidDraft.value) requestPage(page);
}
</script>
<style scoped>
.pager-fields {
    display: grid;
    min-inline-size: 0;
    gap: var(--wa-space-s);
}
.pager-actions {
    display: grid;
    gap: var(--wa-space-xs);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 8rem), 1fr));
}
.pager-actions > wa-button:last-child:nth-child(3) {
    grid-column: 1 / -1;
}
.pager-actions > wa-button {
    inline-size: 100%;
}
.page-direction:dir(rtl) {
    transform: scaleX(-1);
}
.reload-icon {
    margin-inline-end: var(--wa-space-2xs);
    font-size: 1.2em;
    line-height: 1;
}
.pager-fields wa-input,
.pager-fields wa-select {
    inline-size: 100%;
    min-inline-size: 0;
}
</style>
