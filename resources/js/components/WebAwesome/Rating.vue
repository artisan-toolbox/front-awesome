<template>
    <FormFieldFrame
        :active="validationFrame"
        :invalid="invalid"
        :errors="errors"
        :message-id="messageId"
        :native-slot="nativeSlot"
        layout="intrinsic"
    >
        <wa-rating ref="element" v-bind="bindings()">
            <component :is="slotContent" :nodes="slotNodes()" />
        </wa-rating>
    </FormFieldFrame>
</template>

<script setup lang="ts" generic="T extends object">
import type { RatingNativeProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import FormFieldFrame from '../../WebAwesome/FormFieldFrame.vue';
import { ratingDefinition } from '../../WebAwesome/componentDefinitions';
import type WaRating from '@awesome.me/webawesome/dist/components/rating/rating.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';
import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ Omit<RatingNativeProps, 'form'> {}
type Props = Attributes &
    ControlBindingProps<T, WaRating['value'], WaRating['value'], 'value'> & {};

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: WaRating['value']];
}>();
const {
    bindings,
    slotContent,
    slotNodes,
    errors,
    invalid,
    element,
    messageId,
    validationFrame,
    nativeSlot,
} = useWebAwesome(
    [ratingDefinition],
    'wa-rating',
    () => import('#front-awesome-webawesome/components/rating/rating.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaRating['value'], WaRating['value']>(props, {
                name: 'modelValue',
                property: 'value',
                events: ['change'],
                form: true,
                componentName: 'Rating',
                acceptsWrite: modelDomains.number,
                acceptsRead: modelDomains.number,
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
