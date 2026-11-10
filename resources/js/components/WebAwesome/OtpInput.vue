<template>
    <wa-otp-input ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-otp-input>
</template>

<script setup lang="ts" generic="T extends object">
import type { OtpInputNativeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { otpInputDefinition } from '../../WebAwesome/componentDefinitions';
import type WaOtpInput from '@awesome.me/webawesome/dist/components/otp-input/otp-input.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<OtpInputNativeProps, 'form'> {}
type Props = Attributes & ControlBindingProps<T, string, WaOtpInput['value'], 'value'> & {};

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaOtpInput['value']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [otpInputDefinition],
    'wa-otp-input',
    () => import('#front-awesome-webawesome/components/otp-input/otp-input.js'),
    {
        props,
        models: [
            useWebAwesomeModel<string, WaOtpInput['value']>(props, {
                name: 'modelValue',
                property: 'value',
                events: ['input'],
                form: true,
                componentName: 'OtpInput',
                acceptsWrite: modelDomains.string,
                acceptsRead: modelDomains.string,
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
