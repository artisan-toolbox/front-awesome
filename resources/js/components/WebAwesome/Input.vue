<template>
    <wa-input
        ref="element"
        v-bind="rootBindings()"
        :value.attr="resetValue()"
        :form.attr="typeof props.form === 'string' ? props.form : null"
        :aria-invalid="invalid ? 'true' : attrs['aria-invalid']"
        :aria-errormessage="errorMessage()"
        :data-fa-invalid="invalid ? '' : null"
        :class="{ 'fa-input-invalid': invalid }"
    >
        <component :is="slotContent" :nodes="slotNodes()" />
        <span v-if="errors.length" :id="messageId" slot="hint" role="alert">
            <span v-for="(message, index) in errors" :key="index" class="fa-input-error">{{
                message
            }}</span>
        </span>
    </wa-input>
</template>

<script setup lang="ts" generic="T extends object">
import {
    mergeProps,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    useAttrs,
    useId,
    useSlots,
    useTemplateRef,
    watchEffect,
} from 'vue';
import { projectNativeSlot } from '../../WebAwesome/nativeSlots';
import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js';
import type { InputAttributes } from '../../WebAwesome/inputProps';
import { inputBooleanAttributes } from '../../WebAwesome/inputProps';
import { useFormBridge } from '../../WebAwesome/useFormBridge';
import type { FormBindingProps, FormBridgeValue } from '../../WebAwesome/useFormBridge';

interface Attributes extends /* @vue-ignore */ InputAttributes {}
type Props = Attributes & FormBindingProps<T>;

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{ 'update:modelValue': [value: FormBridgeValue] }>();
const attrs = useAttrs();
const slots = useSlots();
const { value, errors, invalid } = useFormBridge(props, {
    emitValue: (next) => emit('update:modelValue', next),
});
const messageId = `fa-input-error-${useId()}`;
function errorMessage() {
    const caller = attrs['aria-errormessage'];
    return errors.value.length
        ? [...new Set([typeof caller === 'string' ? caller : '', messageId].filter(Boolean))].join(
              ' ',
          )
        : caller;
}
const element = useTemplateRef<WaInput>('element');
const registered = shallowRef(false);
const initialValue = value.value;
function resetValue() {
    if (Object.hasOwn(attrs, 'defaultValue')) return attrs.defaultValue;
    if (Object.hasOwn(attrs, 'default-value')) return attrs['default-value'];
    return initialValue === undefined ? '' : initialValue;
}
let active = true;

function normalizeName(key: string) {
    return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function rootBindings() {
    const modifiers = attrs.modelModifiers;
    if (modifiers && typeof modifiers === 'object' && Object.keys(modifiers).length > 0) {
        throw new Error('Front Awesome Input requires unmodified v-model.');
    }
    const bindings: Record<string, unknown> = {};
    for (const [key, next] of Object.entries(attrs)) {
        if (key === 'value' || key === '.value' || key === '^value') {
            throw new Error('Front Awesome Input uses v-model or form for its current value.');
        }
        if (key === 'defaultValue' || key === 'default-value' || key === 'modelModifiers') continue;
        const name = key.startsWith('on') ? key : normalizeName(key);
        if (Object.hasOwn(bindings, name) && bindings[name] !== next) {
            throw new Error(`Front Awesome Input received conflicting aliases for "${name}".`);
        }
        bindings[name] = next;
    }
    for (const name of inputBooleanAttributes) {
        if (Object.hasOwn(bindings, name)) {
            const next = bindings[name];
            delete bindings[name];
            bindings[`^${name}`] = next === false || next == null ? null : '';
        }
    }
    if (Object.hasOwn(bindings, 'autocorrect'))
        bindings['^autocorrect'] =
            bindings.autocorrect == null
                ? null
                : bindings.autocorrect === false || bindings.autocorrect === 'off'
                  ? 'off'
                  : 'on';
    if (Object.hasOwn(bindings, 'spellcheck'))
        bindings['^spellcheck'] =
            bindings.spellcheck == null
                ? null
                : bindings.spellcheck === false || bindings.spellcheck === 'false'
                  ? 'false'
                  : 'true';
    delete bindings.autocorrect;
    delete bindings.spellcheck;
    if (errors.value.length) bindings.hint = '';
    return mergeProps({ onInput: onInput }, bindings);
}

function onInput(event: Event) {
    if (event.currentTarget === element.value && element.value) value.value = element.value.value;
}

const slotNodes = () =>
    Object.entries(slots).flatMap(([name, slot]) =>
        projectNativeSlot(
            slot?.() ?? [],
            name === 'default' ? undefined : name,
            errors.value.length ? ['hint'] : [],
        ),
    );

function slotContent(props: { nodes?: ReturnType<typeof slotNodes> } = {}) {
    return props.nodes ?? slotNodes();
}
slotContent.props = ['nodes'];

watchEffect(() => {
    const input = element.value;
    if (!registered.value || !input) return;
    const next = value.value === undefined ? '' : value.value;
    input.value = next;
    if (next === null && input.value !== null) {
        input.value = '';
        input.value = null;
    }
});

function onReset(event: Event) {
    const input = element.value;
    if (!input || input.form !== event.target) return;
    queueMicrotask(() => {
        if (active && !event.defaultPrevented) value.value = input.value;
    });
}

onMounted(async () => {
    await import('#front-awesome-webawesome/components/input/input.js');
    if (!active || !element.value) return;
    registered.value = true;
    element.value.ownerDocument.addEventListener('reset', onReset, true);
});

onBeforeUnmount(() => {
    active = false;
    element.value?.ownerDocument.removeEventListener('reset', onReset, true);
});
</script>

<style scoped>
.fa-input-error {
    display: block;
}
.fa-input-invalid {
    --wa-form-control-label-color: var(--wa-color-danger-on-quiet);
    --wa-form-control-hint-color: var(--wa-color-danger-on-quiet);
    --wa-form-control-value-color: var(--wa-color-danger-on-quiet);
    --wa-form-control-placeholder-color: var(--wa-color-danger-on-quiet);
    --wa-form-control-border-color: var(--wa-color-danger-border-loud);
    --wa-color-focus: var(--wa-color-danger-border-loud);
}
.fa-input-invalid::part(input-wrapper) {
    border-color: var(--wa-color-danger-border-loud);
    background-color: var(--wa-color-danger-fill-quiet);
}
.fa-input-invalid::part(start),
.fa-input-invalid::part(end),
.fa-input-invalid::part(clear-button),
.fa-input-invalid::part(password-toggle-button) {
    color: var(--wa-color-danger-on-quiet);
}
</style>
