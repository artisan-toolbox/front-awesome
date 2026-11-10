<template>
    <wa-color-picker ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-color-picker>
</template>

<script setup lang="ts" generic="T extends object">
import type { ColorPickerNativeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { colorPickerDefinition } from '../../WebAwesome/componentDefinitions';
import type WaColorPicker from '@awesome.me/webawesome/dist/components/color-picker/color-picker.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<ColorPickerNativeProps, 'form'> {}
type Props = Attributes &
    ControlBindingProps<T, string | null, WaColorPicker['value'], 'value'> & {
        open?: WaColorPicker['open'];
    };

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaColorPicker['value']];
    'update:open': [value: WaColorPicker['open']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [colorPickerDefinition],
    'wa-color-picker',
    () => import('#front-awesome-webawesome/components/color-picker/color-picker.js'),
    {
        props,
        models: [
            useWebAwesomeModel<string | null, WaColorPicker['value']>(props, {
                name: 'modelValue',
                property: 'value',
                events: ['input'],
                form: true,
                componentName: 'ColorPicker',
                acceptsWrite: modelDomains.nullableString,
                acceptsRead: modelDomains.nullableString,
                emitValue: (value) => emit('update:modelValue', value),
            }),
            useWebAwesomeModel<WaColorPicker['open'], WaColorPicker['open']>(props, {
                name: 'open',
                property: 'open',
                events: ['wa-after-show', 'wa-after-hide'],
                form: false,
                componentName: 'ColorPicker',
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
