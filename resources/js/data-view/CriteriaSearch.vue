<template>
    <div
        v-if="capability"
        class="criteria-controls"
        :role="field === undefined ? undefined : 'group'"
        :aria-label="field === undefined ? undefined : searchLabel"
    >
        <Input
            :label="searchLabel"
            :placeholder="field === undefined ? t('search') : undefined"
            :size="size"
            :hint="hint"
            :model-value="draft"
            :failed="message || undefined"
            @update:model-value="edit"
            @keydown.enter="applyOnEnter"
        >
            <Icon
                v-if="field === undefined"
                slot="start"
                library="system"
                name="magnifying-glass"
                aria-hidden="true"
            />
        </Input>
        <template v-if="field !== undefined">
            <Select
                :label="t('operator')"
                :size="size"
                :model-value="operator ?? null"
                :options="
                    fieldCapability?.available.matchTypes.map((match) => ({
                        value: match,
                        label: t(match),
                    }))
                "
                option-value="value"
                option-label="label"
                @update:model-value="chooseOperator"
            />
            <div class="criteria-actions">
                <Button type="button" :size="size" @click="submit()"
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
        </template>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { MatchType } from '@artisan-toolbox/dapter';
import Icon from '../components/WebAwesome/Icon.vue';
import Input from '../components/WebAwesome/Input.vue';
import Button from '../components/WebAwesome/Button.vue';
import Select from '../components/WebAwesome/Select.vue';
import type { DataViewHandle, DataViewSize } from './types';
import { useControlFeedback } from './controlFeedback';
import { useDataViewText } from './messages';
import { useAcceptedCriteria } from './criteria';
import { parseSearchNumber } from './searchNumber';
const props = withDefaults(
    defineProps<{
        adapter: DataViewHandle;
        size?: DataViewSize;
        field?: string;
        label?: string;
    }>(),
    { size: 'm' },
);
const t = useDataViewText();
const accepted = useAcceptedCriteria(() => props.adapter);
const searchLabel = computed(
    () =>
        props.label ??
        (props.field === undefined ? t('searchResults') : t('searchField', { field: props.field })),
);
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
const signature = () =>
    JSON.stringify([props.field, capability.value?.available, capability.value?.current]);
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
        const scope =
            props.field === undefined
                ? accepted.value?.global
                : accepted.value?.fields[props.field];
        const selection =
            props.adapter.status === 'error' ? scope?.search : capability.value?.current;
        const current = selection?.value;
        draft.value = Array.isArray(current) ? JSON.stringify(current) : String(current ?? '');
        operator.value =
            (selection && 'matchType' in selection ? selection.matchType : undefined) ??
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
    void run(() => live.clear(), true);
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
        if (live) void run(() => live.call({ value: raw }), true);
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
        void run(() => live.call({ value: coordinates, matchType: 'vector' }), true);
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
    void run(() => live.call({ value, matchType }), true);
}
</script>

<style scoped src="./criteria-controls.css"></style>
