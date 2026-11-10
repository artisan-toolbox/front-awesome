<template>
    <wa-switch ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-switch>
</template>

<script setup lang="ts" generic="T extends object">
import type { SwitchNativeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { switchDefinition } from '../../WebAwesome/componentDefinitions';
import type WaSwitch from '@awesome.me/webawesome/dist/components/switch/switch.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<SwitchNativeProps, 'form'> {}
type Props = Attributes & ControlBindingProps<T, boolean, WaSwitch['checked'], 'checked'> & {};

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaSwitch['checked']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [switchDefinition],
    'wa-switch',
    () => import('#front-awesome-webawesome/components/switch/switch.js'),
    {
        props,
        models: [
            useWebAwesomeModel<boolean, WaSwitch['checked']>(props, {
                name: 'modelValue',
                property: 'checked',
                events: ['change'],
                form: true,
                componentName: 'Switch',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
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
