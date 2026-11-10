<template>
    <wa-stepper ref="element" v-bind="bindings()">
        <component :is="slotContent" :nodes="slotNodes()" />
    </wa-stepper>
</template>

<script setup lang="ts">
import type { StepperProps } from '../../WebAwesome/componentProps';
import { useWebAwesome } from '../../WebAwesome/useWebAwesome';
import { stepperDefinition } from '../../WebAwesome/componentDefinitions';
import type WaStepper from '@awesome.me/webawesome/dist/components/stepper/stepper.js';
import { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../WebAwesome/modelDomains';

interface Props extends /* @vue-ignore */ StepperProps {
    active?: WaStepper['active'];
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{
    'update:active': [value: WaStepper['active']];
}>();
const { bindings, slotContent, slotNodes } = useWebAwesome(
    [stepperDefinition],
    'wa-stepper',
    () => import('#front-awesome-webawesome/components/stepper/stepper.js'),
    {
        props,
        models: [
            useWebAwesomeModel<WaStepper['active'], WaStepper['active']>(props, {
                name: 'active',
                property: 'active',
                events: ['wa-step-change'],
                form: false,
                componentName: 'Stepper',
                acceptsWrite: modelDomains.string,
                acceptsRead: modelDomains.string,
                emitValue: (value) => emit('update:active', value),
            }),
        ],
    },
);
</script>
