<template>
    <wa-checkbox ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-checkbox>
</template>

<script setup lang="ts" generic="T extends object">
import type { CheckboxNativeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { checkboxDefinition } from '../../WebAwesome/componentDefinitions';
import type WaCheckbox from '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<CheckboxNativeProps, 'form'> {}
type Props = Attributes &
    ControlBindingProps<T, boolean, WaCheckbox['checked'], 'checked'> & {
        indeterminate?: WaCheckbox['indeterminate'];
    };

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaCheckbox['checked']];
    'update:indeterminate': [value: WaCheckbox['indeterminate']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [checkboxDefinition],
    'wa-checkbox',
    () => import('#front-awesome-webawesome/components/checkbox/checkbox.js'),
    {
        props,
        models: [
            useWebAwesomeModel<boolean, WaCheckbox['checked']>(props, {
                name: 'modelValue',
                property: 'checked',
                events: ['change'],
                form: true,
                componentName: 'Checkbox',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:modelValue', value),
            }),
            useWebAwesomeModel<WaCheckbox['indeterminate'], WaCheckbox['indeterminate']>(props, {
                name: 'indeterminate',
                property: 'indeterminate',
                events: ['change'],
                form: false,
                componentName: 'Checkbox',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:indeterminate', value),
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
