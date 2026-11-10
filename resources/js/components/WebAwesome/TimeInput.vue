<template>
    <wa-time-input ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-time-input>
</template>

<script setup lang="ts" generic="T extends object">
import type { TimeInputNativeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { timeInputDefinition } from '../../WebAwesome/componentDefinitions';
import type WaTimeInput from '@awesome.me/webawesome/dist/components/time-input/time-input.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<TimeInputNativeProps, 'form'> {}
type Props = Attributes &
    ControlBindingProps<T, string | Date | null, WaTimeInput['value'], 'value'> & {
        open?: WaTimeInput['open'];
    };

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaTimeInput['value']];
    'update:open': [value: WaTimeInput['open']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [timeInputDefinition],
    'wa-time-input',
    () => import('#front-awesome-webawesome/components/time-input/time-input.js'),
    {
        props,
        models: [
            useWebAwesomeModel<string | Date | null, WaTimeInput['value']>(props, {
                name: 'modelValue',
                property: 'value',
                events: ['input'],
                form: true,
                componentName: 'TimeInput',
                acceptsWrite: modelDomains.date,
                acceptsRead: modelDomains.string,
                emitValue: (value) => emit('update:modelValue', value),
            }),
            useWebAwesomeModel<WaTimeInput['open'], WaTimeInput['open']>(props, {
                name: 'open',
                property: 'open',
                events: ['wa-after-show', 'wa-after-hide'],
                form: false,
                componentName: 'TimeInput',
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
