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
            @update:model-value="(printer) => $emit('configure', { printer: printer ?? '' })"
        >
            <Option v-for="printer in printers" :key="printer" :value="printer">{{
                printer
            }}</Option>
        </Select>
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
                    @update:model-value="orientation"
                >
                    <Option value="automatic">{{ messages.automatic }}</Option
                    ><Option value="portrait">{{ messages.portrait }}</Option
                    ><Option value="landscape">{{ messages.landscape }}</Option>
                </Select>
                <Select
                    :model-value="step.document?.options?.colorType ?? 'color'"
                    :label="messages.color"
                    :disabled="disabled"
                    @update:model-value="color"
                >
                    <Option value="color">{{ messages.fullColor }}</Option
                    ><Option value="blackwhite">{{ messages.monochrome }}</Option>
                </Select>
                <Select
                    :model-value="duplexValue"
                    :label="messages.duplex"
                    :disabled="disabled"
                    @update:model-value="duplex"
                >
                    <Option value="false">{{ messages.singleSided }}</Option
                    ><Option value="long-edge">{{ messages.longEdge }}</Option
                    ><Option value="short-edge">{{ messages.shortEdge }}</Option>
                </Select>
            </div>
        </Details>
        <slot />
    </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Select from '../components/WebAwesome/Select.vue';
import Option from '../components/WebAwesome/Option.vue';
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
