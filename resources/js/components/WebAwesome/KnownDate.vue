<template>
    <wa-known-date ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-known-date>
</template>

<script setup lang="ts" generic="T extends object">
import type { KnownDateNativeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { knownDateDefinition } from '../../WebAwesome/componentDefinitions';
import type WaKnownDate from '@awesome.me/webawesome/dist/components/known-date/known-date.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<KnownDateNativeProps, 'form'> {}
type Props = Attributes &
    ControlBindingProps<T, string | Date | null, WaKnownDate['value'], 'value'> & {};

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaKnownDate['value']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [knownDateDefinition],
    'wa-known-date',
    () => import('#front-awesome-webawesome/components/known-date/known-date.js'),
    {
        props,
        models: [
            useWebAwesomeModel<string | Date | null, WaKnownDate['value']>(props, {
                name: 'modelValue',
                property: 'value',
                events: ['input'],
                form: true,
                componentName: 'KnownDate',
                acceptsWrite: modelDomains.date,
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
