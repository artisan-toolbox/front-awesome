<template>
    <wa-combobox ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
        <template v-for="(group, index) in displayedGroups" :key="index">
            <Divider v-if="index > 0" v-show="group.divider" aria-hidden="true" />
            <small v-if="group.label" v-show="group.visible">{{ group.label }}</small>
            <wa-option
                v-for="row in group.options"
                :key="JSON.stringify([row.nativeValue, row.label, row.disabled])"
                :value.attr="row.nativeValue"
                :label.prop="row.label"
                :disabled.attr="row.disabled ? '' : null"
            >
                <slot name="option" :value="row.value" :label="row.label" :option="row.option">{{
                    row.label
                }}</slot>
            </wa-option>
        </template>
    </wa-combobox>
</template>

<script
    setup
    lang="ts"
    generic="
        T extends object,
        M extends boolean = false,
        O = string,
        K extends string | null | undefined = undefined,
        G extends boolean = false
    "
>
import { useMutationObserver } from '@vueuse/core';
import { computed, shallowRef, useAttrs } from 'vue';
import type WaCombobox from '@web.awesome.me/webawesome-pro/dist/components/combobox/combobox.js';
import type { ComboboxNativeProps } from '../../WebAwesome/proComponentProps';
import { comboboxDefinition } from '../../WebAwesome/proComponentDefinitions';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';
import {
    optionGroupVisibility,
    useOptionSelection,
    type OptionSelectionProps,
    type OptionValue,
    type OptionModel,
} from '../../WebAwesome/optionSelection';

import Divider from '../WebAwesome/Divider.vue';

type Value = OptionValue<O, K>;
type Model = OptionModel<Value, M>;
interface Attributes extends /* @vue-ignore */ Omit<ComboboxNativeProps, 'form' | 'multiple'> {}
type Props = Attributes &
    ControlBindingProps<T, Model, Model, 'value'> &
    OptionSelectionProps<O, K, G> & {
        multiple?: M;
        open?: boolean;
    };

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: Model];
    'update:open': [value: boolean];
}>();
defineSlots<{
    option?: (props: { value: Value; label: string; option: O }) => unknown;
    label?: () => unknown;
    hint?: () => unknown;
    start?: () => unknown;
    end?: () => unknown;
    'clear-icon'?: () => unknown;
    'expand-icon'?: () => unknown;
    empty?: () => unknown;
    'no-results'?: () => unknown;
    error?: () => unknown;
    loading?: () => unknown;
}>();

const { groups, choices, accepts, codec } = useOptionSelection<O, K, M, G>(props);
const attrs = useAttrs();

function syncInputValue(element: HTMLElement, value: string | string[]) {
    const root = element as WaCombobox;
    if (
        root.multiple ||
        ['inputValue', 'input-value', '.inputValue', '.input-value', '^input-value'].some((key) =>
            Object.hasOwn(attrs, key),
        )
    )
        return;

    // After native editing, Pro can retain the previous text when its bound selection changes.
    if (typeof value === 'string') {
        const row = choices.value.find((option) => option.nativeValue === value);
        if (row && !row.disabled) root.inputValue = row.label;
    } else if (value.length === 0) root.inputValue = '';
}
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [comboboxDefinition],
    'wa-combobox',
    () => import('#front-awesome-webawesome-pro/components/combobox/combobox.js'),
    {
        props,
        handledProps: ['grouped', 'options', 'optionValue', 'optionLabel'],
        handledSlots: ['default', 'option'],
        models: [
            useWebAwesomeModel<Model, Model>(props, {
                name: 'modelValue',
                property: 'value',
                events: ['change'],
                form: true,
                componentName: 'Combobox',
                codec: { ...codec, afterWrite: syncInputValue },
                acceptsWrite: accepts,
                acceptsRead: accepts,
                emitValue: (value) => emit('update:modelValue', value),
            }),
            useWebAwesomeModel<boolean, boolean>(props, {
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

const matching = shallowRef<ReadonlySet<string>>();
const displayedGroups = computed(() => optionGroupVisibility(groups.value, matching.value));
const groupedElement = computed(() =>
    props.grouped != null && props.grouped !== false ? element.value : null,
);
useMutationObserver(
    groupedElement,
    () => {
        const root = groupedElement.value;
        if (!root) return;
        // Keep the native query, including custom filters, as the source of visible options.
        matching.value = new Set(
            Array.from(
                root.querySelectorAll<HTMLElementTagNameMap['wa-option']>(
                    ':scope > wa-option:not([hidden])',
                ),
                (option) => option.value,
            ),
        );
    },
    { attributes: true, attributeFilter: ['hidden'], childList: true, subtree: true },
);

defineExpose({
    errors,
    invalid,
    get $el() {
        return element.value as WaCombobox | null;
    },
});
</script>
