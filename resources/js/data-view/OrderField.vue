<template>
    <fieldset v-if="model" class="criteria-controls">
        <legend>
            <span>{{ label }}</span>
            <span v-if="model.current">{{
                t('priority', { priority: model.current.priority })
            }}</span>
        </legend>
        <Select
            :label="t('direction')"
            :size="size"
            :model-value="direction ?? ''"
            @update:model-value="chooseDirection"
        >
            <Option v-for="value in model.directions" :key="value" :value="value">{{
                t(value)
            }}</Option>
        </Select>
        <Select
            :label="t('sortType')"
            :size="size"
            :model-value="sortType ?? ''"
            @update:model-value="chooseType"
        >
            <Option v-for="value in model.sortTypes" :key="value" :value="value">{{
                t(value)
            }}</Option>
        </Select>
        <div class="order-actions">
            <Button
                type="button"
                :size="size"
                :aria-describedby="message ? messageId : undefined"
                @click="apply(false)"
                ><Icon slot="start" name="check" library="system" aria-hidden="true" />{{
                    t('replaceOrder')
                }}</Button
            >
            <Button
                type="button"
                appearance="outlined"
                v-if="model.canAdd"
                :size="size"
                @click="apply(true)"
                ><Icon slot="start" name="plus" library="system" aria-hidden="true" />{{
                    t(model.current ? 'updateOrder' : 'addOrder')
                }}</Button
            >
            <Button
                type="button"
                appearance="outlined"
                v-if="model.current"
                :size="size"
                @click="remove"
                ><Icon slot="start" name="minus" library="system" aria-hidden="true" />{{
                    t('removeOrder')
                }}</Button
            >
        </div>
        <span v-if="message" :id="messageId" role="alert">{{ message }}</span>
    </fieldset>
</template>
<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import type { OrderSelection } from '@artisan-toolbox/dapter';
import Icon from '../components/WebAwesome/Icon.vue';
import Button from '../components/WebAwesome/Button.vue';
import Select from '../components/WebAwesome/Select.vue';
import Option from '../components/WebAwesome/Option.vue';
import type { DataViewHandle, DataViewSize } from './types';
import { orderModel } from './OrderModel';
import { useControlFeedback } from './controlFeedback';
import { useDataViewText } from './messages';
import { useDocumentId } from './documentId';
const props = defineProps<{
    adapter: DataViewHandle;
    size: DataViewSize;
    field: string;
    label: string;
}>();
const t = useDataViewText();
const model = computed(() => orderModel(props.adapter, props.field));
const signature = () =>
    JSON.stringify([model.value?.current, model.value?.directions, model.value?.sortTypes]);
const { message, invalidate, run } = useControlFeedback(() => props.adapter, signature);
const messageId = useDocumentId(useId());
const direction = ref<OrderSelection['direction']>();
const sortType = ref<OrderSelection['sortType']>();
watch(
    signature,
    () => {
        direction.value = model.value?.current?.direction ?? model.value?.directions[0];
        sortType.value = model.value?.current?.sortType ?? model.value?.sortTypes[0];
    },
    { immediate: true, flush: 'sync' },
);
function chooseDirection(value: unknown) {
    invalidate();
    direction.value = model.value?.directions.find((choice) => choice === value);
}
function chooseType(value: unknown) {
    invalidate();
    sortType.value = model.value?.sortTypes.find((choice) => choice === value);
}
function apply(add: boolean) {
    const live = model.value;
    const selectedDirection = direction.value;
    const selectedType = sortType.value;
    if (
        !live ||
        (add && !live.canAdd) ||
        !selectedDirection ||
        !selectedType ||
        !live.directions.includes(selectedDirection) ||
        !live.sortTypes.includes(selectedType)
    )
        return;
    void run(() =>
        live.capability.call({
            direction: selectedDirection,
            sortType: selectedType,
            multiSort: add,
        }),
    );
}
function remove() {
    const live = model.value;
    if (live?.current) void run(() => live.capability.clear());
}
</script>
<style scoped>
fieldset {
    display: grid;
    min-inline-size: 0;
    gap: var(--wa-space-s);
    border: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    border-radius: var(--wa-border-radius-m);
    padding: var(--wa-space-s);
}
.order-actions {
    display: grid;
    gap: var(--wa-space-xs);
    margin-block-start: var(--wa-space-2xs);
}
.order-actions > wa-button {
    inline-size: 100%;
}
legend {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: var(--wa-space-xs);
    padding-inline: var(--wa-space-2xs);
    overflow-wrap: anywhere;
}
</style>
