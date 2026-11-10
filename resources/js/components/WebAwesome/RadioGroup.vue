<template>
    <wa-radio-group ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-radio-group>
</template>

<script setup lang="ts" generic="T extends object">
import type { RadioGroupNativeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { radioGroupDefinition } from '../../WebAwesome/componentDefinitions';
import type WaRadioGroup from '@awesome.me/webawesome/dist/components/radio-group/radio-group.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<RadioGroupNativeProps, 'form'> {}
type Props = Attributes &
    ControlBindingProps<T, string | number | null, WaRadioGroup['value'], 'value'> & {};

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaRadioGroup['value']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [radioGroupDefinition],
    'wa-radio-group',
    () => import('#front-awesome-webawesome/components/radio-group/radio-group.js'),
    {
        props,
        models: [
            useWebAwesomeModel<string | number | null, WaRadioGroup['value']>(props, {
                name: 'modelValue',
                property: 'value',
                events: ['input'],
                form: true,
                componentName: 'RadioGroup',
                acceptsWrite: modelDomains.radio,
                acceptsRead: modelDomains.radio,
                emitValue: (value) => emit('update:modelValue', value),
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
