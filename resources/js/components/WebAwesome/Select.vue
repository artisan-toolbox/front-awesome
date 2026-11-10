<template>
    <wa-select ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-select>
</template>

<script setup lang="ts" generic="T extends object, M extends boolean = false">
import type { SelectNativeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { selectDefinition } from '../../WebAwesome/componentDefinitions';
import type WaSelect from '@awesome.me/webawesome/dist/components/select/select.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<SelectNativeProps, 'form' | 'multiple'> {}
type Props = Attributes &
    ControlBindingProps<
        T,
        string | string[] | null,
        Extract<WaSelect['value'], M extends true ? string[] | null : string | null>,
        'value'
    > & {
        multiple?: M;

        open?: WaSelect['open'];
    };

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [
        value: Extract<WaSelect['value'], M extends true ? string[] | null : string | null>,
    ];
    'update:open': [value: WaSelect['open']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [selectDefinition],
    'wa-select',
    () => import('#front-awesome-webawesome/components/select/select.js'),
    {
        props,
        models: [
            useWebAwesomeModel<
                string | string[] | null,
                Extract<WaSelect['value'], M extends true ? string[] | null : string | null>
            >(props, {
                name: 'modelValue',
                property: 'value',
                events: ['input'],
                writer: { kind: 'nullable-selection' },
                form: true,
                componentName: 'Select',
                acceptsWrite: modelDomains.selection,
                acceptsRead: (
                    value,
                ): value is Extract<
                    WaSelect['value'],
                    M extends true ? string[] | null : string | null
                > =>
                    props.multiple == null || props.multiple === false
                        ? modelDomains.nullableString(value)
                        : value === null || modelDomains.strings(value),
                emitValue: (value) => emit('update:modelValue', value),
            }),
            useWebAwesomeModel<WaSelect['open'], WaSelect['open']>(props, {
                name: 'open',
                property: 'open',
                events: ['wa-after-show', 'wa-after-hide'],
                form: false,
                componentName: 'Select',
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
