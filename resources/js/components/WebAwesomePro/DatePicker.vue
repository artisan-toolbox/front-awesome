<template>
    <FormFieldFrame
        :active="validationFrame"
        :invalid="invalid"
        :errors="errors"
        :message-id="messageId"
        :native-slot="nativeSlot"
        layout="block"
    >
        <wa-date-picker ref="element" v-bind="bindings()">
            <component :is="slotContent" :nodes="slotNodes()" />
        </wa-date-picker>
    </FormFieldFrame>
</template>

<script setup lang="ts" generic="T extends object">
import type { DatePickerNativeProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import FormFieldFrame from '../../WebAwesome/FormFieldFrame.vue';
import { datePickerDefinition } from '../../WebAwesome/proComponentDefinitions';
import type WaDatePicker from '@web.awesome.me/webawesome-pro/dist/components/date-picker/date-picker.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';
import type { DatePickerModelValue } from '../../WebAwesome/modelDomains';

interface Attributes extends /* @vue-ignore */ Omit<DatePickerNativeProps, 'form'> {}
type Props = Attributes &
    ControlBindingProps<T, DatePickerModelValue, WaDatePicker['value'], 'value'> & {
        view?: WaDatePicker['view'];
        focusedDate?: WaDatePicker['focusedDate'];
    };

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaDatePicker['value']];
    'update:view': [value: WaDatePicker['view']];
    'update:focusedDate': [value: WaDatePicker['focusedDate']];
}>();
const {
    bindings,
    slotContent,
    slotNodes,
    errors,
    invalid,
    element,
    messageId,
    validationFrame,
    nativeSlot,
} = useWebAwesome(
    [datePickerDefinition],
    'wa-date-picker',
    () => import('#front-awesome-webawesome-pro/components/date-picker/date-picker.js'),
    {
        props,
        models: [
            useWebAwesomeModel<DatePickerModelValue, WaDatePicker['value']>(props, {
                name: 'modelValue',
                property: 'value',
                events: ['input'],
                form: true,
                componentName: 'DatePicker',
                acceptsWrite: modelDomains.datePicker,
                acceptsRead: modelDomains.string,
                emitValue: (value) => emit('update:modelValue', value),
            }),
            useWebAwesomeModel<WaDatePicker['view'], WaDatePicker['view']>(props, {
                name: 'view',
                property: 'view',
                events: ['wa-view-change'],
                form: false,
                componentName: 'DatePicker',
                acceptsWrite: modelDomains.dateView,
                acceptsRead: modelDomains.dateView,
                emitValue: (value) => emit('update:view', value),
            }),
            useWebAwesomeModel<WaDatePicker['focusedDate'], WaDatePicker['focusedDate']>(props, {
                name: 'focusedDate',
                property: 'focusedDate',
                events: ['wa-focus-day'],
                reader: { kind: 'local-date-detail', key: 'date' },
                form: false,
                componentName: 'DatePicker',
                acceptsWrite: modelDomains.string,
                acceptsRead: modelDomains.string,
                emitValue: (value) => emit('update:focusedDate', value),
            }),
        ],
    },
);
defineExpose({
    errors,
    invalid,
    get $el() {
        return element.value;
    },
});
</script>
