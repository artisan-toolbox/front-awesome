<template>
    <wa-slider ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-slider>
</template>

<script setup lang="ts" generic="T extends object">
import type { SliderNativeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { sliderDefinition } from '../../WebAwesome/componentDefinitions';
import type WaSlider from '@awesome.me/webawesome/dist/components/slider/slider.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<SliderNativeProps, 'form'> {}
type Props = Attributes &
    ControlBindingProps<T, number | null, WaSlider['value'], 'value'> & {
        minValue?: WaSlider['minValue'];
        maxValue?: WaSlider['maxValue'];
    };

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaSlider['value']];
    'update:minValue': [value: WaSlider['minValue']];
    'update:maxValue': [value: WaSlider['maxValue']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [sliderDefinition],
    'wa-slider',
    () => import('#front-awesome-webawesome/components/slider/slider.js'),
    {
        props,
        models: [
            useWebAwesomeModel<number | null, WaSlider['value']>(props, {
                name: 'modelValue',
                property: 'value',
                events: ['input'],
                form: true,
                componentName: 'Slider',
                acceptsWrite: modelDomains.nullableNumber,
                acceptsRead: modelDomains.number,
                emitValue: (value) => emit('update:modelValue', value),
            }),
            useWebAwesomeModel<WaSlider['minValue'], WaSlider['minValue']>(props, {
                name: 'minValue',
                property: 'minValue',
                events: ['input'],
                form: false,
                componentName: 'Slider',
                acceptsWrite: modelDomains.number,
                acceptsRead: modelDomains.number,
                emitValue: (value) => emit('update:minValue', value),
            }),
            useWebAwesomeModel<WaSlider['maxValue'], WaSlider['maxValue']>(props, {
                name: 'maxValue',
                property: 'maxValue',
                events: ['input'],
                form: false,
                componentName: 'Slider',
                acceptsWrite: modelDomains.number,
                acceptsRead: modelDomains.number,
                emitValue: (value) => emit('update:maxValue', value),
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
