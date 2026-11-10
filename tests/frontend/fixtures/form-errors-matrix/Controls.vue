<template>
    <Input
        v-if="control === 'Input'"
        :form="form"
        field="input"
        :failed="failed"
        v-bind="attributes"
    >
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </Input>
    <Checkbox
        v-else-if="control === 'Checkbox'"
        :form="form"
        field="checkbox"
        :failed="failed"
        v-bind="attributes"
    >
        Matrix label
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </Checkbox>
    <Switch
        v-else-if="control === 'Switch'"
        :form="form"
        field="switch"
        :failed="failed"
        v-bind="attributes"
    >
        Matrix label
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </Switch>
    <Textarea
        v-else-if="control === 'Textarea'"
        :form="form"
        field="textarea"
        :failed="failed"
        v-bind="attributes"
    >
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </Textarea>
    <NumberInput
        v-else-if="control === 'NumberInput'"
        :form="form"
        field="numberInput"
        :failed="failed"
        v-bind="attributes"
    >
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </NumberInput>
    <RadioGroup
        v-else-if="control === 'RadioGroup'"
        :form="form"
        field="radioGroup"
        :failed="failed"
        v-bind="attributes"
    >
        <Radio value="one">One</Radio><Radio value="two">Two</Radio>
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </RadioGroup>
    <Slider
        v-else-if="control === 'Slider'"
        :form="form"
        field="slider"
        :failed="failed"
        v-bind="attributes"
    >
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </Slider>
    <Rating
        v-else-if="control === 'Rating'"
        :form="form"
        field="rating"
        :failed="failed"
        v-bind="attributes"
    >
    </Rating>
    <OtpInput
        v-else-if="control === 'OtpInput'"
        :form="form"
        field="otpInput"
        :failed="failed"
        v-bind="attributes"
        :length="4"
    >
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </OtpInput>
    <ColorPicker
        v-else-if="control === 'ColorPicker'"
        :form="form"
        field="colorPicker"
        :failed="failed"
        v-bind="attributes"
        :swatches="['#112233', '#445566']"
    >
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </ColorPicker>
    <Select
        v-else-if="control === 'Select'"
        :form="form"
        field="select"
        :failed="failed"
        v-bind="{ ...attributes, ...(emptySelectionDefault ? { defaultValue: null } : {}) }"
    >
        <Option value="one">One</Option><Option value="two">Two</Option>
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </Select>
    <TagInput
        v-else-if="control === 'TagInput'"
        :form="form"
        field="tagInput"
        :failed="failed"
        v-bind="attributes"
    >
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </TagInput>
    <KnownDate
        v-else-if="control === 'KnownDate'"
        :form="form"
        field="knownDate"
        :failed="failed"
        v-bind="attributes"
    >
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </KnownDate>
    <TimeInput
        v-else-if="control === 'TimeInput'"
        :form="form"
        field="timeInput"
        :failed="failed"
        v-bind="attributes"
        hour-format="24"
    >
        <span slot="hint" data-testid="caller-hint">Caller slot hint</span>
    </TimeInput>
</template>

<script setup lang="ts">
import {
    Input,
    Checkbox,
    Switch,
    Textarea,
    NumberInput,
    RadioGroup,
    Slider,
    Rating,
    OtpInput,
    ColorPicker,
    Select,
    TagInput,
    KnownDate,
    TimeInput,
    Radio,
    Option,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
import type { HTMLAttributes } from 'vue';
import type { InertiaForm } from '@inertiajs/vue3';
import type { MatrixData } from './data';

defineProps<{
    control:
        | 'Input'
        | 'Checkbox'
        | 'Switch'
        | 'Textarea'
        | 'NumberInput'
        | 'RadioGroup'
        | 'Slider'
        | 'Rating'
        | 'OtpInput'
        | 'ColorPicker'
        | 'Select'
        | 'TagInput'
        | 'KnownDate'
        | 'TimeInput';
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
