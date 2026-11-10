<template>
    <wa-number-input ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-number-input>
</template>

<script setup lang="ts" generic="T extends object">
import type { NumberInputNativeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { numberInputDefinition } from '../../WebAwesome/componentDefinitions';
import type WaNumberInput from '@awesome.me/webawesome/dist/components/number-input/number-input.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<NumberInputNativeProps, 'form'> {}
type Props = Attributes &
    ControlBindingProps<T, string | null, WaNumberInput['value'], 'value'> & {};

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaNumberInput['value']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [numberInputDefinition],
    'wa-number-input',
    () => import('#front-awesome-webawesome/components/number-input/number-input.js'),
    {
        props,
        models: [
            useWebAwesomeModel<string | null, WaNumberInput['value']>(props, {
                name: 'modelValue',
                property: 'value',
                events: ['input'],
                form: true,
                componentName: 'NumberInput',
                acceptsWrite: modelDomains.nullableString,
                acceptsRead: modelDomains.nullableString,
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
