<template>
    <div
        v-if="capability"
        class="criteria-controls"
        :role="field === undefined ? undefined : 'group'"
        :aria-label="field === undefined ? undefined : label"
    >
        <Input
            :label="label"
            :size="size"
            :hint="hint"
            :model-value="draft"
            :failed="message || undefined"
            @update:model-value="edit"
            @keydown.enter="applyOnEnter"
        />
        <template v-if="field !== undefined">
            <Select
                :label="t('operator')"
                :size="size"
                :model-value="operator ?? ''"
                @update:model-value="chooseOperator"
            >
                <Option
                    v-for="match in fieldCapability?.available.matchTypes"
                    :key="match"
                    :value="match"
                    >{{ t(match) }}</Option
                >
            </Select>
            <Button :size="size" @click="submit()">{{ t('apply') }}</Button>
            <Button :size="size" @click="clear">{{ t('clear') }}</Button>
        </template>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { MatchType } from '@artisan-toolbox/dapter';
import Input from '../components/WebAwesome/Input.vue';
import Button from '../components/WebAwesome/Button.vue';
import Select from '../components/WebAwesome/Select.vue';
import Option from '../components/WebAwesome/Option.vue';
import type { DataViewHandle, DataViewSize } from './types';
import { useControlFeedback } from './controlFeedback';
import { useDataViewText } from './messages';
import { parseSearchNumber } from './searchNumber';
const props = defineProps<{
    adapter: DataViewHandle;
    size: DataViewSize;
    field?: string;
    label: string;
}>();
const t = useDataViewText();
const fieldCapability = computed(() =>
    props.field === undefined ? null : props.adapter.fields?.[props.field]?.search,
);
const capability = computed(() =>
    props.field === undefined ? props.adapter.global?.search : fieldCapability.value,
);
const vectorPolicy = computed(() => fieldCapability.value?.available.vector);
const hint = computed(() =>
    vectorPolicy.value
        ? t('vectorHint', {
              dimensions: vectorPolicy.value.dimensions,
              distance: vectorPolicy.value.maxDistance,
          })
        : maxBytes.value
          ? t('fullTextLimit', { bytes: maxBytes.value })
          : undefined,
);
const signature = () => JSON.stringify([capability.value?.available, capability.value?.current]);
const { message, invalidate, run } = useControlFeedback(() => props.adapter, signature);
const draft = ref('');
const operator = ref<MatchType>();
const maxBytes = computed(() => {
    if (props.field !== undefined)
        return operator.value === 'full_text'
            ? fieldCapability.value?.available.fullText?.maxBytes
            : undefined;
    const targets = Object.values(props.adapter.global?.search?.available.targets ?? {});
    return targets.find((target) => target.matchType === 'full_text')?.fullText?.maxBytes;
});
watch(
    signature,
    () => {
        const current = capability.value?.current?.value;
        draft.value = Array.isArray(current) ? JSON.stringify(current) : String(current ?? '');
        operator.value =
            fieldCapability.value?.current?.matchType ??
            fieldCapability.value?.available.matchTypes[0];
    },
    { immediate: true, flush: 'sync' },
);
function edit(value: unknown) {
    if (typeof value !== 'string') return;
    invalidate();
    draft.value = value;
    if (props.field === undefined) submit();
}
function chooseOperator(value: unknown) {
    const match = fieldCapability.value?.available.matchTypes.find((match) => match === value);
    if (match) {
        invalidate();
        operator.value = match;
    }
}
function clear() {
    const live = capability.value;
    if (!live) return;
    draft.value = '';
    void run(() => live.clear());
}
function applyOnEnter(event: KeyboardEvent) {
    if (event.isComposing) return;
    event.preventDefault();
    if (props.field !== undefined) submit();
}
function submit() {
    const raw = draft.value;
    if (raw === '') return clear();
    if (props.field === undefined) {
        const live = props.adapter.global?.search;
        if (live) void run(() => live.call({ value: raw }));
        return;
    }
    const live = fieldCapability.value;
    const matchType = operator.value;
    if (
        !live ||
        !matchType ||
        !live.available.matchTypes.some((available) => available === matchType)
    )
        return;
    if (matchType === 'vector') {
        const policy = live.available.vector;
        let value: unknown;
        try {
            value = JSON.parse(raw);
        } catch {
            value = null;
        }
        if (
            !policy ||
            !Array.isArray(value) ||
            value.length !== policy.dimensions ||
            !value.every(
                (coordinate: unknown) =>
                    typeof coordinate === 'number' &&
                    Number.isFinite(coordinate) &&
                    Math.abs(coordinate) <= policy.maxCoordinateMagnitude,
            )
        ) {
            invalidate();
            message.value = t('invalidVector', { dimensions: policy?.dimensions ?? 0 });
            return;
        }
        const coordinates: number[] = value.filter(
            (coordinate): coordinate is number => typeof coordinate === 'number',
        );
        void run(() => live.call({ value: coordinates, matchType: 'vector' }));
        return;
    }
    const type = live.available.valueType;
    if (type === 'vector') return;
    const value = type === 'string' ? raw : parseSearchNumber(raw, type);
    if (value === null) {
        invalidate();
        message.value = t(type === 'integer' ? 'invalidInteger' : 'invalidNumber');
        return;
    }
    void run(() => live.call({ value, matchType }));
}
</script>
