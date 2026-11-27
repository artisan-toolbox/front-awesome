<template>
    <Teleport v-if="target" :to="target">
        <div
            v-if="open"
            ref="header"
            class="fa-select-search"
            @input.stop
            @change.stop
            @focusin.stop
            @focusout.stop
            @keydown="onSearchKey"
        >
            <Input
                :model-value="query"
                :label="text.search"
                :placeholder="text.search"
                type="search"
                size="s"
                autocomplete="off"
                :spellcheck="false"
                @update:model-value="emit('update:query', $event ?? '')"
            >
                <Icon slot="start" name="magnifying-glass" library="system" aria-hidden="true" />
            </Input>
            <div role="status" :class="{ 'fa-select-search-status': count > 0 }">
                {{ count > 0 ? text.results(count) : query ? text.noResults : text.noOptions }}
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
/// <reference types="vite/client" />
import type WaSelect from '@awesome.me/webawesome/dist/components/select/select.js';
import { useElementSize, useEventListener } from '@vueuse/core';
import {
    computed,
    inject,
    nextTick,
    onBeforeUnmount,
    ref,
    shallowRef,
    useTemplateRef,
    watch,
    watchEffect,
} from 'vue';
import Input from '../components/WebAwesome/Input.vue';
import Icon from '../components/WebAwesome/Icon.vue';
import { localizationKey } from '../localization/context';
import styles from './select-search.css?inline';

const props = defineProps<{
    select: WaSelect | null;
    query: string;
    matches: ReadonlySet<string>;
}>();
const emit = defineEmits<{ 'update:query': [value: string] }>();
const target = shallowRef<HTMLElement>();
const header = useTemplateRef<HTMLElement>('header');
const search = () => header.value?.querySelector('wa-input');
const { height } = useElementSize(header, undefined, { box: 'border-box' });
const open = ref(false);
let optionFocusedByKeyboard: HTMLElementTagNameMap['wa-option'] | undefined;
const localization = inject(localizationKey, undefined);
const messages = {
    en: {
        search: 'Search options',
        noOptions: 'No options',
        noResults: 'No matching results',
        results: (count: number) =>
            count === 1 ? '1 matching option' : `${count} matching options`,
    },
    es: {
        search: 'Buscar opciones',
        noOptions: 'No hay opciones disponibles',
        noResults: 'No hay coincidencias',
        results: (count: number) =>
            count === 1 ? '1 opción encontrada' : `${count} opciones encontradas`,
    },
    pt: {
        search: 'Buscar opções',
        noOptions: 'Nenhuma opção disponível',
        noResults: 'Nenhum resultado encontrado',
        results: (count: number) =>
            count === 1 ? '1 opção encontrada' : `${count} opções encontradas`,
    },
};
const text = computed(() => {
    const language =
        localization?.locale.value || props.select?.closest('[lang]')?.getAttribute('lang');
    const code = language?.toLowerCase().split(/[-_]/)[0];
    return code === 'es' || code === 'pt' ? messages[code] : messages.en;
});
const select = computed(() => props.select);
const count = computed(() => props.matches.size);

function focusSearch() {
    const input = search();
    if (!input?.input) return;
    input.input.tabIndex = -1;
    const listbox = target.value?.nextElementSibling;
    if (listbox) input.input.ariaControlsElements = [listbox];
    input.focus({ preventScroll: true });
}

useEventListener(select, 'wa-show', (event) => {
    const root = select.value;
    if (!root || event.target !== root) return;
    optionFocusedByKeyboard = undefined;
    // Select has no popup header slot. Keep search beside the published listbox part.
    const listbox = root.shadowRoot?.querySelector('[part~="listbox"]');
    if (!listbox?.parentElement) return;
    if (target.value?.nextElementSibling !== listbox) {
        target.value?.remove();
        const mount = root.ownerDocument.createElement('div');
        mount.style.display = 'contents';
        const stylesheet = root.ownerDocument.createElement('style');
        stylesheet.textContent = styles;
        mount.append(stylesheet);
        listbox.before(mount);
        target.value = mount;
    }
    open.value = true;
});

useEventListener(select, 'wa-after-show', async (event) => {
    const root = select.value;
    if (!root || event.target !== root) return;
    await nextTick();
    await root.ownerDocument.defaultView?.customElements.whenDefined('wa-input');
    await search()?.updateComplete;
    if (!root.open || optionFocusedByKeyboard?.matches(':focus')) return;
    if (root.currentOption) {
        root.currentOption.current = false;
        root.currentOption.tabIndex = -1;
    }
    focusSearch();
});

useEventListener(select, 'wa-after-hide', (event) => {
    if (event.target !== select.value || select.value?.open) return;
    open.value = false;
    emit('update:query', '');
});

watchEffect(() => {
    const listbox = target.value?.nextElementSibling;
    if (listbox && listbox instanceof HTMLElement)
        listbox.style.setProperty('--fa-select-search-height', `${height.value}px`);
});
watch(
    () => props.matches,
    () => {
        const root = select.value;
        const current = root?.currentOption;
        if (!root?.open || !current?.current) return;
        if (current.isConnected && !current.hidden && !current.disabled) return;
        current.current = false;
        focusSearch();
    },
    { flush: 'post' },
);
onBeforeUnmount(() => target.value?.remove());

function options() {
    return Array.from(select.value?.querySelectorAll('wa-option') ?? []).filter(
        (option) => !option.hidden && !option.disabled,
    );
}

function focusOption(option: HTMLElementTagNameMap['wa-option'] | undefined) {
    const root = select.value;
    if (!root || !option) return;
    const previous = root.currentOption;
    if (previous) {
        previous.current = false;
        previous.tabIndex = -1;
    }
    // Native Enter/Space reads the same option that receives focus.
    root.currentOption = option;
    option.current = true;
    option.tabIndex = -1;
    option.focus({ preventScroll: true });
    optionFocusedByKeyboard = option;
    const listbox = target.value?.nextElementSibling;
    if (listbox) {
        const bounds = listbox.getBoundingClientRect();
        const row = option.getBoundingClientRect();
        if (row.top < bounds.top) listbox.scrollBy(0, row.top - bounds.top);
        else if (row.bottom > bounds.bottom) listbox.scrollBy(0, row.bottom - bounds.bottom);
    }
}

function leaveWithTab() {
    const root = select.value;
    if (!root) return;
    if (root.currentOption) root.currentOption.tabIndex = -1;
    const input = search()?.input;
    if (input) input.tabIndex = -1;
    root.focus({ preventScroll: true });
    void root.hide();
}

function onSearchKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && !event.isComposing) return;
    event.stopPropagation();
    if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Tab') leaveWithTab();
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const available = options();
        focusOption(event.key === 'ArrowDown' ? available[0] : available.at(-1));
    }
    if (event.key === 'Enter') event.preventDefault();
}

useEventListener(select, 'input', (event) => {
    const root = select.value;
    if (
        root?.open &&
        root.multiple &&
        event.target === root &&
        root.shadowRoot?.activeElement === root.displayInput
    )
        focusSearch();
});

useEventListener(select, 'keydown', (event) => {
    const root = select.value;
    if (!root?.open || !open.value) return;
    const option = event.target;
    if (!(option instanceof HTMLElement) || option.localName !== 'wa-option') return;
    const available = options();
    const index = available.findIndex((candidate) => candidate === option);
    if (index < 0) return;
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') return;
    event.stopPropagation();
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Tab') leaveWithTab();
    if (
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'Home' ||
        event.key === 'End'
    ) {
        event.preventDefault();
        if (event.key === 'ArrowUp' && index === 0) {
            if (root.currentOption) root.currentOption.current = false;
            focusSearch();
        } else if (event.key === 'Home') focusOption(available[0]);
        else if (event.key === 'End') focusOption(available.at(-1));
        else focusOption(available[index + (event.key === 'ArrowUp' ? -1 : 1)]);
    }
});
</script>
