<template>
    <Combobox
        v-if="control === 'Combobox'"
        :form="form"
        field="combobox"
        :failed="failed"
        v-bind="{ ...attributes, ...(emptySelectionDefault ? { defaultValue: null } : {}) }"
    >
        <Option value="one">One</Option><Option value="two">Two</Option>
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </Combobox>
    <DateInput
        v-else-if="control === 'DateInput'"
        :form="form"
        field="dateInput"
        :failed="failed"
        v-bind="attributes"
    >
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </DateInput>
    <DatePicker
        v-else-if="control === 'DatePicker'"
        :form="form"
        field="datePicker"
        :failed="failed"
        v-bind="attributes"
    >
    </DatePicker>
    <FileInput
        v-else-if="control === 'FileInput'"
        :form="form"
        field="fileInput"
        :failed="failed"
        v-bind="attributes"
    >
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </FileInput>
</template>

<script setup lang="ts">
import {
    Combobox,
    DateInput,
    DatePicker,
    FileInput,
} from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
import { Option } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import type { HTMLAttributes } from 'vue';
import type { InertiaForm } from '@inertiajs/vue3';
import type { MatrixData } from './data';

defineProps<{
    control: 'Combobox' | 'DateInput' | 'DatePicker' | 'FileInput';
    emptySelectionDefault?: boolean;
    form: InertiaForm<MatrixData>;
    failed: boolean | string | readonly string[];
}>();

const attributes = {
    label: 'Matrix label',
    hint: 'Caller attribute hint',
    name: 'matrix-value',
    'data-testid': 'matrix-control',
    'aria-invalid': 'grammar',
    'aria-errormessage': 'application-error',
    'aria-describedby': 'application-description',
} satisfies HTMLAttributes & Record<string, string>;
</script>
