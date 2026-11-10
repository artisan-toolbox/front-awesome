<template>
    <wa-tag-input ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-tag-input>
</template>

<script setup lang="ts" generic="T extends object">
import type { TagInputNativeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { tagInputDefinition } from '../../WebAwesome/componentDefinitions';
import type WaTagInput from '@awesome.me/webawesome/dist/components/tag-input/tag-input.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<TagInputNativeProps, 'form'> {}
type Props = Attributes &
    ControlBindingProps<T, string[] | string | FormData | null, WaTagInput['value'], 'value'> & {
        inputValue?: WaTagInput['inputValue'];
    };

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaTagInput['value']];
    'update:inputValue': [value: WaTagInput['inputValue']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [tagInputDefinition],
    'wa-tag-input',
    () => import('#front-awesome-webawesome/components/tag-input/tag-input.js'),
    {
        props,
        models: [
            useWebAwesomeModel<string[] | string | FormData | null, WaTagInput['value']>(props, {
                name: 'modelValue',
                property: 'value',
                events: ['change'],
                form: true,
                componentName: 'TagInput',
                acceptsWrite: modelDomains.tags,
                acceptsRead: modelDomains.strings,
                emitValue: (value) => emit('update:modelValue', value),
            }),
            useWebAwesomeModel<WaTagInput['inputValue'], WaTagInput['inputValue']>(props, {
                name: 'inputValue',
                property: 'inputValue',
                events: ['input'],
                form: false,
                componentName: 'TagInput',
                acceptsWrite: modelDomains.string,
                acceptsRead: modelDomains.string,
                emitValue: (value) => emit('update:inputValue', value),
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
