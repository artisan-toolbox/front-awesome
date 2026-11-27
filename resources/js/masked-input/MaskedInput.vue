<template>
    <wa-input
        ref="element"
        v-bind="inputAttributes()"
        type="text"
        :form.attr="formId"
        :value.attr="initialDisplay"
        :placeholder="placeholder"
        :disabled.attr="disabled ? '' : null"
        :readonly.attr="readonly ? '' : null"
        :required.attr="required ? '' : null"
        :aria-invalid="bridge.invalid.value ? 'true' : attrs['aria-invalid']"
        @input="onHostInput"
        @change="onHostInput"
    >
        <component :is="slottedContent" :nodes="slotNodes()" />
        <span v-if="bridge.errors.value.length" slot="hint" role="alert">
            <span v-for="message in bridge.errors.value" :key="message" class="fa-masked-error">
                {{ message }}
            </span>
        </span>
    </wa-input>
</template>

<script setup lang="ts" generic="T extends object">
import {
    computed,
    inject,
    nextTick,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    useAttrs,
    useSlots,
    useTemplateRef,
    watch,
} from 'vue';
import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js';
import { localizationKey } from '../localization/context';
import type { InputAttributes } from '../WebAwesome/inputProps';
import { inputBooleanAttributes } from '../WebAwesome/inputProps';
import { projectNativeSlot } from '../WebAwesome/nativeSlots';
import { useFormBridge } from '../WebAwesome/useFormBridge';
import type { ControlBindingProps, FormBridgeValue } from '../WebAwesome/useFormBridge';
import { editMask, formatMask, withMaskFocus } from './mask';
import type { MaskEdit, MaskOptions, MaskState, MaskTemplate } from './mask';

interface NativeAttributes
    extends /* @vue-ignore */ Omit<
        InputAttributes,
        'type' | 'pattern' | 'minlength' | 'maxlength'
    > {}

type Props = NativeAttributes &
    Omit<MaskOptions, 'mask'> &
    ControlBindingProps<T, FormBridgeValue, string, 'value'> & {
        mask: MaskOptions['mask'] | MaskTemplate;
        defaultValue?: string;
        valueMode?: 'raw' | 'formatted';
        incompleteMessage?: string;
        clearIncompleteOnBlur?: boolean;
        placeholder?: string;
        disabled?: boolean;
        readonly?: boolean;
        required?: boolean;
    };

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<Props>(), { overwrite: undefined });
const emit = defineEmits<{
    'update:modelValue': [value: string];
    'mask-change': [value: Pick<MaskState, 'raw' | 'formatted' | 'complete'>];
}>();
const attrs = useAttrs();
const slots = useSlots();
const bridge = useFormBridge<FormBridgeValue, string>(props, {
    acceptsWrite: (value): value is FormBridgeValue =>
        value === null || value === undefined || typeof value === 'string',
    acceptsRead: (value): value is string => typeof value === 'string',
    componentName: 'MaskedInput',
    emitValue: (value) => emit('update:modelValue', value),
    nativeAliases: ['value'],
    optional: true,
});
const template = computed<MaskTemplate>(() => {
    const mask = props.mask;
    return typeof mask === 'object' && mask !== null && 'mask' in mask ? mask : { mask };
});
const options = computed<MaskOptions>(() => {
    const defaults = template.value;
    return {
        mask: typeof defaults.mask === 'function' ? defaults.mask.bind(defaults) : defaults.mask,
        tokens: props.tokens ?? defaults.tokens,
        guide: props.guide ?? defaults.guide,
        guideChar: props.guideChar ?? defaults.guideChar,
        overwrite: props.overwrite ?? defaults.overwrite,
        prefix: props.prefix ?? defaults.prefix,
        suffix: props.suffix ?? defaults.suffix,
        isComplete: props.isComplete ?? defaults.isComplete?.bind(defaults),
    };
});
const valueMode = computed(() => props.valueMode ?? template.value.valueMode ?? 'raw');
const localization = inject(localizationKey, undefined);
const incompleteMessage = computed(() => {
    const message = props.incompleteMessage ?? template.value.incompleteMessage;
    if (typeof message === 'string') return message;
    if (!message || !localization) return '';
    const translated = localization.t(message.key);
    return translated === message.key ? '' : translated;
});
const formId = computed(() => (typeof props.form === 'string' ? props.form : undefined));
const binding = computed(() => (bridge.isBound.value ? (bridge.value.value ?? '') : undefined));
const initialValue = props.defaultValue ?? binding.value ?? '';
const initialMode = valueMode.value;
const state = shallowRef(formatMask(binding.value ?? initialValue, options.value, valueMode.value));
const initialDisplay = state.value.formatted;
const focused = shallowRef(false);
const element = useTemplateRef<WaInput>('element');
const placeholder = computed(() =>
    state.value.raw === '' && state.value.display ? state.value.display : props.placeholder,
);
let host: WaInput | undefined;
let input: HTMLInputElement | undefined;
let controller: AbortController | undefined;
let active = true;
let lastEmitted: string | undefined;
let ownedMessage = '';

type Selection = MaskEdit['selection'];
interface RecordOfEdit {
    state: MaskState;
    selection: Selection;
}
let beforeInput: RecordOfEdit | undefined;
let composition: RecordOfEdit | undefined;
const undoStack: RecordOfEdit[] = [];
const redoStack: RecordOfEdit[] = [];

function inputAttributes() {
    const bindings: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(attrs)) {
        const name = key.startsWith('on')
            ? key
            : key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
        if (['value', 'type', 'pattern', 'maxlength', 'minlength'].includes(name)) continue;
        bindings[name] = value;
    }
    for (const name of inputBooleanAttributes) {
        if (Object.hasOwn(bindings, name)) {
            const value = bindings[name];
            delete bindings[name];
            bindings[`^${name}`] = value === false || value == null ? null : '';
        }
    }
    if (typeof bindings.spellcheck === 'boolean')
        bindings['^spellcheck'] = String(bindings.spellcheck);
    if (typeof bindings.autocorrect === 'boolean')
        bindings['^autocorrect'] = bindings.autocorrect ? 'on' : 'off';
    if (Object.hasOwn(bindings, '^spellcheck')) delete bindings.spellcheck;
    if (Object.hasOwn(bindings, '^autocorrect')) delete bindings.autocorrect;
    bindings.inputmode ??= template.value.inputMode;
    if (bridge.errors.value.length) bindings.hint = '';
    return bindings;
}

function slotNodes() {
    return Object.entries(slots).flatMap(([name, slot]) =>
        projectNativeSlot(
            slot?.() ?? [],
            name === 'default' ? undefined : name,
            bridge.errors.value.length ? ['hint'] : [],
        ),
    );
}

function slottedContent(props: { nodes?: ReturnType<typeof slotNodes> } = {}) {
    return props.nodes ?? slotNodes();
}
slottedContent.props = ['nodes'];

function editableText(current: MaskState) {
    return current.raw ? current.display : '';
}

function snapshot(): RecordOfEdit {
    return {
        state: state.value,
        selection: [input?.selectionStart ?? 0, input?.selectionEnd ?? 0],
    };
}

function synchronizeForm() {
    if (!host || !input) return;
    const { raw, formatted, complete } = state.value;
    host.setValue(state.value[valueMode.value], formatted);
    const message = raw && !complete && host.willValidate ? incompleteMessage.value : '';
    if (message && host.validationMessage !== message) host.setCustomValidity(message);
    else if (!message && ownedMessage && host.validationMessage === ownedMessage)
        host.setCustomValidity('');
    ownedMessage = message;
    const invalid = bridge.invalid.value ? 'true' : attrs['aria-invalid'];
    if (typeof invalid === 'string') input.setAttribute('aria-invalid', invalid);
    else input.removeAttribute('aria-invalid');
    const label = attrs['aria-label'] ?? (slots.label ? undefined : attrs.label);
    if (typeof label === 'string') input.setAttribute('aria-label', label);
    else input.removeAttribute('aria-label');
}

function renderText(current: MaskState, selection?: Selection) {
    if (!host || !input || composition) return;
    const text = editableText(current);
    if (input.value !== text) input.value = text;
    if (host.value !== text) host.value = text;
    if (selection) input.setSelectionRange(selection[0], selection[1]);
    synchronizeForm();
}

function update(next: MaskState, selection?: Selection, publish = false) {
    const previous = state.value;
    state.value = next;
    renderText(next, selection);
    if (!publish || (next.raw === previous.raw && next.formatted === previous.formatted)) return;
    const value = next[valueMode.value];
    if (bridge.isBound.value && binding.value !== value) {
        lastEmitted = value;
        bridge.value.value = value;
        void nextTick(() => {
            if (!active || lastEmitted !== value) return;
            lastEmitted = undefined;
            if (binding.value !== undefined && binding.value !== value) readBinding();
        });
    }
    emit('mask-change', { raw: next.raw, formatted: next.formatted, complete: next.complete });
}

function readBinding(preserveUnchanged = false) {
    const previous = state.value;
    const source = binding.value;
    const next = formatMask(
        source ?? previous.raw,
        options.value,
        source === undefined ? 'raw' : valueMode.value,
        focused.value,
    );
    if (
        !preserveUnchanged ||
        next.raw !== previous.raw ||
        next.formatted !== previous.formatted ||
        next.complete !== previous.complete
    ) {
        undoStack.length = 0;
        redoStack.length = 0;
    }
    update(next);
}

watch(binding, (value) => {
    if (value !== lastEmitted) readBinding();
});
watch([options, valueMode], () => readBinding(true), { deep: true });
watch([bridge.invalid, incompleteMessage], synchronizeForm, { flush: 'post' });

function remember(previous: RecordOfEdit) {
    if (undoStack.length === 100) undoStack.shift();
    undoStack.push(previous);
    redoStack.length = 0;
}

function replay(redo: boolean) {
    const entry = (redo ? redoStack : undoStack).pop();
    if (!entry) return;
    (redo ? undoStack : redoStack).push(snapshot());
    const current = formatMask(entry.state.raw, options.value, 'raw', focused.value);
    const selection: Selection =
        current.display === entry.state.display ? entry.selection : [current.end, current.end];
    update(current, selection, true);
    host?.dispatchEvent(
        new InputEvent('input', {
            bubbles: true,
            composed: true,
            inputType: redo ? 'historyRedo' : 'historyUndo',
        }),
    );
}

function changedRange(previous: string, next: string, startLimit: number) {
    let start = 0;
    while (start < startLimit && start < next.length && previous[start] === next[start]) start++;
    let stop = previous.length;
    let end = next.length;
    while (stop > start && end > start && previous[stop - 1] === next[end - 1]) {
        stop--;
        end--;
    }
    return { selection: [start, stop] satisfies Selection, data: next.slice(start, end) };
}

function applyEdit(previous: RecordOfEdit, edit: MaskEdit) {
    // An empty guide is rendered as a native placeholder.
    const selection: Selection = previous.state.raw
        ? edit.selection
        : [previous.state.end, previous.state.end];
    const { state: next, caret } = editMask(
        previous.state,
        { ...edit, selection },
        options.value,
        focused.value,
    );
    if (next.raw !== previous.state.raw || next.formatted !== previous.state.formatted)
        remember(previous);
    const cursor = next.raw ? caret : 0;
    update(next, [cursor, cursor], true);
}

function onBeforeInput(event: InputEvent) {
    if (event.inputType === 'historyUndo' || event.inputType === 'historyRedo') {
        if (event.cancelable) {
            event.preventDefault();
            replay(event.inputType === 'historyRedo');
        }
        return;
    }
    if (!event.isComposing && !composition) beforeInput = snapshot();
}

function onInput(event: Event) {
    if (!(event instanceof InputEvent) || !input || event.isComposing || composition) return;
    const previous = beforeInput;
    beforeInput = undefined;
    if (!previous) {
        adoptText(input.value);
        return;
    }
    const oldText = editableText(previous.state);
    const operation = event.inputType;
    if (
        operation.startsWith('delete') &&
        !['deleteContentBackward', 'deleteContentForward'].includes(operation)
    ) {
        const change = changedRange(oldText, input.value, previous.selection[0]);
        if (change.selection[0] !== change.selection[1])
            applyEdit(previous, { ...change, inputType: 'deleteContent' });
        return;
    }
    const lengthAfter = oldText.length - previous.selection[1];
    const inserted =
        event.data ?? input.value.slice(previous.selection[0], input.value.length - lengthAfter);
    applyEdit(previous, { selection: previous.selection, data: inserted, inputType: operation });
}

function adoptText(text: string) {
    if (text === editableText(state.value)) return;
    const previous = snapshot();
    const current = formatMask(text, options.value, 'formatted', focused.value);
    if (current.raw !== previous.state.raw || current.formatted !== previous.state.formatted)
        remember(previous);
    update(current, undefined, true);
}

function onHostInput(event: Event) {
    if (event.composedPath()[0] === host && host && !composition) adoptText(host.value ?? '');
}

function beforeHostUpdate() {
    if (active && host && input && !composition && host.value === editableText(state.value))
        adoptText(input.value);
}

function afterHostUpdate() {
    if (!active) return;
    if (host && !composition) adoptText(host.value ?? '');
    synchronizeForm();
}

function onCompositionStart() {
    composition = snapshot();
    beforeInput = undefined;
}

function onCompositionEnd() {
    const previous = composition;
    queueMicrotask(() => {
        if (!input || !previous || composition !== previous) return;
        composition = undefined;
        const change = changedRange(
            editableText(previous.state),
            input.value,
            previous.selection[0],
        );
        applyEdit(previous, { ...change, inputType: 'insertText' });
    });
}

function changeFocus(value: boolean) {
    if (input && !composition) adoptText(input.value);
    focused.value = value;
    const previous = snapshot();
    const next = withMaskFocus(previous.state, options.value, value);
    if (
        !value &&
        props.clearIncompleteOnBlur &&
        !input?.readOnly &&
        !input?.disabled &&
        next.raw &&
        !next.complete
    ) {
        remember(previous);
        update(formatMask('', options.value), undefined, true);
        return;
    }
    const position = (offset: number) => {
        const ordinal = previous.state.spans.filter((span) => span[1] <= offset).length;
        return next.spans[ordinal]?.[0] ?? next.end;
    };
    update(
        next,
        value && next.raw
            ? [position(previous.selection[0]), position(previous.selection[1])]
            : undefined,
    );
}

function onKeyDown(event: KeyboardEvent) {
    if (event.isComposing || event.altKey || (!event.ctrlKey && !event.metaKey) || input?.readOnly)
        return;
    const key = event.key.toLowerCase();
    if (key === 'z' || (key === 'y' && event.ctrlKey)) {
        event.preventDefault();
        replay(key === 'y' || event.shiftKey);
    }
}

function onReset(event: Event) {
    if (event.target !== host?.form) return;
    queueMicrotask(() => {
        if (!active || event.defaultPrevented) return;
        undoStack.length = 0;
        redoStack.length = 0;
        update(
            formatMask(initialValue, options.value, initialMode, focused.value),
            undefined,
            true,
        );
    });
}

onMounted(async () => {
    await import('#front-awesome-webawesome/components/input/input.js');
    const current = element.value;
    await current?.updateComplete;
    if (!active || !current || !(current.validationTarget instanceof HTMLInputElement)) return;
    host = current;
    input = current.validationTarget;
    controller = new AbortController();
    const { signal } = controller;
    input.addEventListener('beforeinput', onBeforeInput, { signal });
    input.addEventListener('input', onInput, { signal, capture: true });
    input.addEventListener('compositionstart', onCompositionStart, { signal });
    input.addEventListener('compositionend', onCompositionEnd, { signal });
    input.addEventListener('keydown', onKeyDown, { signal, capture: true });
    input.addEventListener('focus', () => changeFocus(true), { signal });
    input.addEventListener('blur', () => changeFocus(false), { signal });
    host.ownerDocument.addEventListener('reset', onReset, { signal, capture: true });
    host.addController({
        hostUpdate: beforeHostUpdate,
        hostUpdated: afterHostUpdate,
    });
    if (input.value !== state.value.formatted && input.value !== initialDisplay)
        adoptText(input.value);
    focused.value = input.matches(':focus');
    update(withMaskFocus(state.value, options.value, focused.value));
});

onBeforeUnmount(() => {
    active = false;
    controller?.abort();
});

defineExpose({
    errors: bridge.errors,
    invalid: bridge.invalid,
    complete: computed(() => state.value.complete),
    get $el() {
        return element.value;
    },
});
</script>

<style scoped>
.fa-masked-error {
    display: block;
}
</style>
