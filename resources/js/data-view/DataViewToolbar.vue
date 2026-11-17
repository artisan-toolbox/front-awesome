<template>
    <div class="data-view-toolbar">
        <Input
            v-if="adapter.global?.search"
            label="Search results"
            :size="size"
            :model-value="search"
            @update:model-value="submitSearch"
        />
        <Select
            v-if="adapter.global?.order"
            label="Order results"
            :size="size"
            :model-value="adapter.global.order.current?.id ?? ''"
            @update:model-value="submitOrder"
        >
            <Option value="">Default order</Option>
            <Option
                v-for="preset in adapter.global.order.available.presets"
                :key="preset.id"
                :value="preset.id"
                >{{ preset.label }}</Option
            >
        </Select>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import Input from '../components/WebAwesome/Input.vue';
import Select from '../components/WebAwesome/Select.vue';
import Option from '../components/WebAwesome/Option.vue';
import type { DataViewHandle, DataViewSize } from './types';
const props = defineProps<{ adapter: DataViewHandle; size: DataViewSize }>();
const search = computed(() => props.adapter.global?.search?.current?.value ?? '');
function submitSearch(value: unknown) {
    const capability = props.adapter.global?.search;
    if (!capability || typeof value !== 'string') return;
    if (value === '') void capability.clear();
    else void capability.call({ value });
}
function submitOrder(value: unknown) {
    const capability = props.adapter.global?.order;
    if (!capability || typeof value !== 'string') return;
    if (value === '') void capability.clear();
    else if (capability.available.presets.some((preset) => preset.id === value))
        void capability.call({ id: value });
}
</script>
<style scoped>
.data-view-toolbar {
    display: flex;
    align-items: end;
    flex-wrap: wrap;
    gap: var(--wa-space-m);
}
</style>
