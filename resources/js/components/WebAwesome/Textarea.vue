<template>
    <wa-textarea ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-textarea>
</template>

<script setup lang="ts" generic="T extends object">
import type { TextareaNativeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { textareaDefinition } from '../../WebAwesome/componentDefinitions';
import type WaTextarea from '@awesome.me/webawesome/dist/components/textarea/textarea.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<TextareaNativeProps, 'form'> {}
type Props = Attributes & ControlBindingProps<T, string | null, WaTextarea['value'], 'value'> & {};

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaTextarea['value']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [textareaDefinition],
    'wa-textarea',
    () => import('#front-awesome-webawesome/components/textarea/textarea.js'),
    {
        props,
        models: [
            useWebAwesomeModel<string | null, WaTextarea['value']>(props, {
                name: 'modelValue',
                property: 'value',
                events: ['input'],
                form: true,
                componentName: 'Textarea',
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
