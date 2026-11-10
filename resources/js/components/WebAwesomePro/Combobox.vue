<template>
    <wa-combobox ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-combobox>
</template>

<script setup lang="ts" generic="T extends object, M extends boolean = false">
import type { ComboboxNativeProps } from '../../WebAwesome/proComponentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { comboboxDefinition } from '../../WebAwesome/proComponentDefinitions';
import type WaCombobox from '@web.awesome.me/webawesome-pro/dist/components/combobox/combobox.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<ComboboxNativeProps, 'form' | 'multiple'> {}
type Props = Attributes &
    ControlBindingProps<
        T,
        string | string[] | null,
        Extract<WaCombobox['value'], M extends true ? string[] | null : string | null>,
        'value'
    > & {
        multiple?: M;

        open?: WaCombobox['open'];
    };

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [
        value: Extract<WaCombobox['value'], M extends true ? string[] | null : string | null>,
    ];
    'update:open': [value: WaCombobox['open']];
}>();
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [comboboxDefinition],
    'wa-combobox',
    () => import('#front-awesome-webawesome-pro/components/combobox/combobox.js'),
    {
        props,
        models: [
            useWebAwesomeModel<
                string | string[] | null,
                Extract<WaCombobox['value'], M extends true ? string[] | null : string | null>
            >(props, {
                name: 'modelValue',
                property: 'value',
                events: ['input'],
                writer: { kind: 'nullable-selection' },
                form: true,
                componentName: 'Combobox',
                acceptsWrite: modelDomains.selection,
                acceptsRead: (
                    value,
                ): value is Extract<
                    WaCombobox['value'],
                    M extends true ? string[] | null : string | null
                > =>
                    props.multiple == null || props.multiple === false
                        ? modelDomains.nullableString(value)
                        : value === null || modelDomains.strings(value),
                emitValue: (value) => emit('update:modelValue', value),
            }),
            useWebAwesomeModel<WaCombobox['open'], WaCombobox['open']>(props, {
                name: 'open',
                property: 'open',
                events: ['wa-after-show', 'wa-after-hide'],
                form: false,
                componentName: 'Combobox',
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
