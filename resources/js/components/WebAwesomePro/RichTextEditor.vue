<template>
    <wa-rich-text-editor ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-rich-text-editor>
</template>

<script setup lang="ts" generic="T extends object">
import type { RichTextEditorNativeProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { richTextEditorDefinition } from '../../WebAwesome/proComponentDefinitions';
import type { RichTextEditorValue } from '../../WebAwesome/proComponentProps';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<RichTextEditorNativeProps, 'form'> {}
type Props = Attributes & ControlBindingProps<T, string | null, RichTextEditorValue, 'value'> & {};

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: RichTextEditorValue];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [richTextEditorDefinition],
    'wa-rich-text-editor',
    () => import('#front-awesome-webawesome-pro/components/rich-text-editor/rich-text-editor.js'),
    {
        props,
        models: [
            useWebAwesomeModel<string | null, RichTextEditorValue>(props, {
                name: 'modelValue',
                property: 'value',
                events: ['input'],
                form: true,
                componentName: 'RichTextEditor',
                acceptsWrite: modelDomains.nullableString,
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
