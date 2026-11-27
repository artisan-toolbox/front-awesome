<template>
    <wa-select ref="element" v-bind="bindings()" class="fa-searchable-select">
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
                :hidden="!matching.has(row.nativeValue)"
            >
                <slot name="option" :value="row.value" :label="row.label" :option="row.option">{{
                    row.label
                }}</slot>
            </wa-option>
        </template>
    </wa-select>
    <SelectSearch :select="select" v-model:query="query" :matches="matching" />
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
import { computed, ref } from 'vue';
import type WaSelect from '@awesome.me/webawesome/dist/components/select/select.js';
import type { SelectNativeProps } from '../../WebAwesome/componentProps';
import { selectDefinition } from '../../WebAwesome/componentDefinitions';
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
import Divider from './Divider.vue';
import SelectSearch from '../../WebAwesome/SelectSearch.vue';

type Value = OptionValue<O, K>;
type Model = OptionModel<Value, M>;
interface Attributes extends /* @vue-ignore */ Omit<SelectNativeProps, 'form' | 'multiple'> {}
type Props = Attributes &
    ControlBindingProps<T, Model, Model, 'value'> &
    OptionSelectionProps<O, K, G> & {
        multiple?: M;
        open?: boolean;
        strictSearch?: boolean;
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
}>();

const { groups, choices, accepts, codec } = useOptionSelection<O, K, M, G>(props);
const { bindings, slotContent, slotNodes, errors, invalid, element } = useWebAwesome(
    [selectDefinition],
    'wa-select',
    () => import('#front-awesome-webawesome/components/select/select.js'),
    {
        props,
        handledProps: ['grouped', 'options', 'optionValue', 'optionLabel', 'strictSearch'],
        handledSlots: ['default', 'option'],
        models: [
            useWebAwesomeModel<Model, Model>(props, {
                name: 'modelValue',
                property: 'value',
                events: ['input'],
                form: true,
                componentName: 'Select',
                codec,
                acceptsWrite: accepts,
                acceptsRead: accepts,
                emitValue: (value) => emit('update:modelValue', value),
            }),
            useWebAwesomeModel<boolean, boolean>(props, {
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

const query = ref('');
const matching = computed(() => {
    const normalize = (text: string) =>
        props.strictSearch
            ? text.normalize()
            : text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    const search = normalize(query.value);
    return new Set(
        choices.value
            .filter((row) => normalize(row.label).includes(search))
            .map((row) => row.nativeValue),
    );
});
const displayedGroups = computed(() => optionGroupVisibility(groups.value, matching.value));
const select = computed(() =>
    element.value?.localName === 'wa-select' ? (element.value as WaSelect) : null,
);

defineExpose({
    errors,
    invalid,
    get $el() {
        return element.value as WaSelect | null;
    },
});
</script>

<style scoped>
.fa-searchable-select[open]::part(listbox) {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
    border-block-start: 0;
    max-block-size: max(
        2.5em,
        calc(var(--auto-size-available-height) - var(--fa-select-search-height, 0px))
    );
}
</style>
