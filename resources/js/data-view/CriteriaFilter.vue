<template>
    <div v-if="capability" class="criteria-controls" role="group" :aria-label="filterLabel">
        <Select
            :label="filterLabel"
            :size="size"
            :multiple="capability.available.multiple"
            :model-value="draft"
            :failed="message || undefined"
            @update:model-value="edit"
        >
            <Option v-for="[token, value] in options" :key="token" :value="token">{{
                resolveControlLabel({ kind: 'option', field, filter, value }, controlLabel)
            }}</Option>
        </Select>
        <div class="criteria-actions">
            <Button type="button" :size="size" @click="apply"
                ><Icon slot="start" name="check" library="system" aria-hidden="true" />{{
                    t('apply')
                }}</Button
            >
            <Button type="button" :size="size" appearance="outlined" @click="clear"
                ><Icon slot="start" name="xmark" library="system" aria-hidden="true" />{{
                    t('clear')
                }}</Button
            >
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Scalar } from '@artisan-toolbox/dapter';
import Icon from '../components/WebAwesome/Icon.vue';
import Button from '../components/WebAwesome/Button.vue';
import Select from '../components/WebAwesome/Select.vue';
import Option from '../components/WebAwesome/Option.vue';
import type { DataViewHandle, DataViewSize } from './types';
import {
    useControlFeedback,
    resolveControlLabel,
    type ControlLabelFormatter,
} from './controlFeedback';
import { useDataViewText } from './messages';
import { useAcceptedCriteria } from './criteria';
const props = withDefaults(
    defineProps<{
        adapter: DataViewHandle;
        size?: DataViewSize;
        field?: string | null;
        filter: string;
        label?: string;
        controlLabel?: ControlLabelFormatter;
    }>(),
    { size: 'm', field: null },
);
const t = useDataViewText();
const accepted = useAcceptedCriteria(() => props.adapter);
const filterLabel = computed(
    () =>
        props.label ??
        resolveControlLabel(
            { kind: 'filter', field: props.field, filter: props.filter },
            props.controlLabel,
        ),
);
const capability = computed(
    () =>
        (props.field === null ? props.adapter.global : props.adapter.fields?.[props.field])
            ?.filters?.[props.filter],
);
function token(value: Scalar) {
    return encodeURIComponent(JSON.stringify(value));
}
const options = computed(
    () =>
        new Map(capability.value?.available.values.map((value) => [token(value), value] as const)),
);
const signature = () =>
    JSON.stringify([
        props.field,
        props.filter,
        capability.value?.available,
        capability.value?.current,
    ]);
const { message, invalidate, run } = useControlFeedback(() => props.adapter, signature);
const draft = ref<string | string[]>('');
function restore() {
    const live = capability.value;
    const scope =
        props.field === null ? accepted.value?.global : accepted.value?.fields[props.field];
    const selection =
        props.adapter.status === 'error' ? scope?.filters?.[props.filter] : live?.current;
    const value = selection?.value;
    draft.value = live?.available.multiple
        ? Array.isArray(value)
            ? value.map(token)
            : []
        : selection &&
            (value === null ||
                typeof value === 'number' ||
                typeof value === 'boolean' ||
                typeof value === 'string')
          ? token(value)
          : '';
}
watch(signature, restore, { immediate: true, flush: 'sync' });
function edit(value: unknown) {
    invalidate();
    if (value === null) {
        draft.value = capability.value?.available.multiple ? [] : '';
        return;
    }
    if (
        typeof value === 'string' ||
        (Array.isArray(value) && value.every((item) => typeof item === 'string'))
    )
        draft.value = value;
}
function apply() {
    const live = capability.value;
    if (!live) return;
    invalidate();
    const tokens = Array.isArray(draft.value)
        ? draft.value
        : draft.value === ''
          ? []
          : [draft.value];
    const values: Scalar[] = [];
    for (const key of tokens) {
        const value = options.value.get(key);
        if (value === undefined) {
            message.value = t('invalidChoice');
            return;
        }
        values.push(value);
    }
    if (live.available.multiple && (values.length || live.available.empty === 'clear')) {
        void run(() => live.call({ value: values }), true);
    } else if (!live.available.multiple && values.length === 1 && values[0] !== undefined) {
        const value = values[0];
        void run(() => live.call({ value }), true);
    } else message.value = t('chooseOption');
}
function clear() {
    const live = capability.value;
    if (!live) return;
    draft.value = live.available.multiple ? [] : '';
    void run(() => live.clear(), true);
}
</script>

<style scoped src="./criteria-controls.css"></style>
