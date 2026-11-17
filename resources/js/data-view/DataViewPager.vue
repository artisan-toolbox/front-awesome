<template>
    <nav class="data-view-pager" aria-label="Results pagination">
        <template v-if="adapter.infinite">
            <Button
                v-if="adapter.infinite.status === 'paused'"
                :size="size"
                @click="adapter.infinite.retry()"
                >Retry loading more</Button
            >
            <Button
                v-else
                :size="size"
                :disabled="!adapter.paging.has_next || adapter.paging.loading"
                :loading="adapter.infinite.status === 'loading'"
                @click="adapter.infinite.append()"
                >Load more</Button
            >
        </template>
        <template v-else>
            <Button
                :size="size"
                :disabled="!adapter.paging.has_previous || adapter.paging.loading"
                @click="adapter.paging.goToFirst()"
                >First</Button
            >
            <Button
                :size="size"
                :disabled="!adapter.paging.has_previous || adapter.paging.loading"
                @click="adapter.paging.goToPrevious()"
                >Previous</Button
            >
            <span v-if="adapter.paging.current !== null"
                >Page {{ adapter.paging.current
                }}<template v-if="adapter.paging.pages !== null">
                    of {{ adapter.paging.pages }}</template
                ></span
            >
            <Button
                :size="size"
                :disabled="!adapter.paging.has_next || adapter.paging.loading"
                @click="adapter.paging.goToNext()"
                >Next</Button
            >
            <Button
                v-if="adapter.paging.goToLast"
                :size="size"
                :disabled="!adapter.paging.has_next || adapter.paging.loading"
                @click="adapter.paging.goToLast()"
                >Last</Button
            >
            <Input
                v-if="adapter.paging.goToPage && adapter.paging.pages"
                type="number"
                label="Go to page"
                :size="size"
                :min="1"
                :max="adapter.paging.pages"
                :model-value="pageDraft"
                @update:model-value="setPageDraft"
                @change="goToPage"
            />
        </template>
        <Button :size="size" :disabled="adapter.paging.loading" @click="adapter.paging.reload()"
            >Reload</Button
        >
        <Select
            v-if="adapter.paging.per_page.options.length"
            label="Rows per page"
            :size="size"
            :model-value="String(adapter.paging.per_page.value)"
            :disabled="adapter.paging.loading"
            @update:model-value="setPerPage"
        >
            <Option
                v-for="count in adapter.paging.per_page.options"
                :key="count"
                :value="String(count)"
                >{{ count }}</Option
            >
        </Select>
        <span v-if="adapter.paging.filtered !== null">{{ adapter.paging.filtered }} results</span>
    </nav>
</template>
<script setup lang="ts">
import { shallowRef, watch } from 'vue';
import Button from '../components/WebAwesome/Button.vue';
import Input from '../components/WebAwesome/Input.vue';
import Select from '../components/WebAwesome/Select.vue';
import Option from '../components/WebAwesome/Option.vue';
import type { DataViewHandle, DataViewSize } from './types';
const props = defineProps<{ adapter: DataViewHandle; size: DataViewSize }>();
function setPerPage(value: unknown) {
    const count = Number(value);
    if (props.adapter.paging.per_page.options.some((option) => option === count))
        void props.adapter.paging.per_page.setValue(count);
}
const pageDraft = shallowRef('');
watch(
    () => props.adapter.paging.current,
    (value) => {
        pageDraft.value = String(value ?? '');
    },
    { immediate: true },
);
function setPageDraft(value: unknown) {
    if (typeof value === 'string') pageDraft.value = value;
}
function goToPage() {
    const page = Number(pageDraft.value);
    if (Number.isInteger(page) && page >= 1 && page <= (props.adapter.paging.pages ?? 0))
        void props.adapter.paging.goToPage?.(page);
}
</script>
<style scoped>
.data-view-pager {
    display: flex;
    flex-wrap: wrap;
    gap: var(--wa-space-s);
    align-items: center;
}
</style>
