<template>
    <wa-date-input ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-date-input>
</template>

<script setup lang="ts" generic="T extends object">
import type { DateInputNativeProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { dateInputDefinition } from '../../WebAwesome/proComponentDefinitions';
import type WaDateInput from '@web.awesome.me/webawesome-pro/dist/components/date-input/date-input.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<DateInputNativeProps, 'form'> {}
type Props = Attributes &
    ControlBindingProps<
        T,
        | string
        | Date
        | {
              from?: Date | null;
              to?: Date | null;
          }
        | null,
        WaDateInput['value'],
        'value'
    > & {
        open?: WaDateInput['open'];
    };

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaDateInput['value']];
    'update:open': [value: WaDateInput['open']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [dateInputDefinition],
    'wa-date-input',
    () => import('#front-awesome-webawesome-pro/components/date-input/date-input.js'),
    {
        props,
        models: [
            useWebAwesomeModel<
                | string
                | Date
                | {
                      from?: Date | null;
                      to?: Date | null;
                  }
                | null,
                WaDateInput['value']
            >(props, {
                name: 'modelValue',
                property: 'value',
                events: ['input'],
                form: true,
                componentName: 'DateInput',
                acceptsWrite: modelDomains.dateInput,
                acceptsRead: modelDomains.string,
                emitValue: (value) => emit('update:modelValue', value),
            }),
            useWebAwesomeModel<WaDateInput['open'], WaDateInput['open']>(props, {
                name: 'open',
                property: 'open',
                events: ['wa-after-show', 'wa-after-hide'],
                form: false,
                componentName: 'DateInput',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:open', value),
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
