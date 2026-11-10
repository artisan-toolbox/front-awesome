<template>
    <wa-file-input ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-file-input>
</template>

<script setup lang="ts" generic="T extends object">
import type { FileInputNativeProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { fileInputDefinition } from '../../WebAwesome/proComponentDefinitions';
import type WaFileInput from '@web.awesome.me/webawesome-pro/dist/components/file-input/file-input.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<FileInputNativeProps, 'form'> {}
type Props = Attributes &
    ControlBindingProps<T, WaFileInput['files'], WaFileInput['files'], 'files'> & {};

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaFileInput['files']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [fileInputDefinition],
    'wa-file-input',
    () => import('#front-awesome-webawesome-pro/components/file-input/file-input.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaFileInput['files'], WaFileInput['files']>(props, {
                name: 'modelValue',
                property: 'files',
                events: ['change'],
                form: true,
                componentName: 'FileInput',
                acceptsWrite: modelDomains.files,
                acceptsRead: modelDomains.files,
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
