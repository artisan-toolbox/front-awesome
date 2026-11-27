<template>
    <aside class="wa-stack wa-gap-l print-settings" :aria-label="messages.settings">
        <div class="wa-stack wa-gap-xs">
            <h3>{{ messages.settings }}</h3>
            <p class="print-quiet">{{ step.type.toUpperCase() }}</p>
        </div>
        <Select
            :model-value="step.printer || null"
            :label="messages.printer"
            :placeholder="messages.choosePrinter"
            :disabled="disabled || connection !== 'ready'"
            :options="printers"
            :option-value="null"
            :option-label="null"
            @update:model-value="(printer) => $emit('configure', { printer: printer ?? '' })"
        />
        <NumberInput
            :model-value="String(step.document?.options?.copies ?? 1)"
            :label="messages.copies"
            :min="1"
            :max="999"
            :step="1"
            :disabled="disabled"
            @update:model-value="
                (value) =>
                    $emit('configure', {
                        options: {
                            copies:
                                value === null || value.trim() === '' ? Number.NaN : Number(value),
                        },
                    })
            "
        />
        <Callout v-if="invalidCopies" variant="danger">{{ messages.invalidCopies }}</Callout>
        <Details :summary="messages.advanced">
            <div class="wa-stack wa-gap-m">
                <Select
                    :model-value="step.document?.options?.orientation ?? 'automatic'"
                    :label="messages.orientation"
                    :disabled="disabled"
                    :options="orientations"
                    option-value="value"
                    option-label="label"
                    @update:model-value="orientation"
                />
                <Select
                    :model-value="step.document?.options?.colorType ?? 'color'"
                    :label="messages.color"
                    :disabled="disabled"
                    :options="colors"
                    option-value="value"
                    option-label="label"
                    @update:model-value="color"
                />
                <Select
                    :model-value="duplexValue"
                    :label="messages.duplex"
                    :disabled="disabled"
                    :options="duplexModes"
                    option-value="value"
                    option-label="label"
                    @update:model-value="duplex"
                />
            </div>
        </Details>
        <slot />
    </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Select from '../components/WebAwesome/Select.vue';
import NumberInput from '../components/WebAwesome/NumberInput.vue';
import Details from '../components/WebAwesome/Details.vue';
import Callout from '../components/WebAwesome/Callout.vue';
import type { PrintPreference, PrintingState, PrintStepView } from './types';
import type { PrintingMessages } from './messages';
const props = defineProps<{
    step: PrintStepView;
    printers: readonly string[];
    connection: PrintingState['connection'];
    disabled: boolean;
    messages: PrintingMessages;
}>();
const emit = defineEmits<{ configure: [preference: PrintPreference] }>();
const orientations = computed(() => [
    { value: 'automatic', label: props.messages.automatic },
    { value: 'portrait', label: props.messages.portrait },
    { value: 'landscape', label: props.messages.landscape },
]);
const colors = computed(() => [
    { value: 'color', label: props.messages.fullColor },
    { value: 'blackwhite', label: props.messages.monochrome },
]);
const duplexModes = computed(() => [
    { value: 'false', label: props.messages.singleSided },
    { value: 'long-edge', label: props.messages.longEdge },
    { value: 'short-edge', label: props.messages.shortEdge },
]);
const invalidCopies = computed(() => {
    const copies = props.step.document?.options?.copies ?? 1;
    return !Number.isInteger(copies) || copies < 1 || copies > 999;
});
const duplexValue = computed(() => {
    const value = props.step.document?.options?.duplex;
    return value === true
        ? 'long-edge'
        : value === 'long-edge' || value === 'short-edge'
          ? value
          : 'false';
});
function orientation(value: string | null) {
    if (value === 'portrait' || value === 'landscape' || value === 'automatic')
        emit('configure', { options: { orientation: value === 'automatic' ? null : value } });
}
function color(value: string | null) {
    if (value === 'color' || value === 'blackwhite')
        emit('configure', { options: { colorType: value } });
}
function duplex(value: string | null) {
    if (value === 'false' || value === 'long-edge' || value === 'short-edge')
        emit('configure', { options: { duplex: value === 'false' ? false : value } });
}
</script>

<style scoped>
.print-settings {
    min-width: 0;
}
h3,
p {
    margin: 0;
}
h3 {
    font-size: var(--wa-font-size-l);
}
.print-quiet {
    color: var(--wa-color-text-quiet);
    font-size: var(--wa-font-size-s);
}
</style>
