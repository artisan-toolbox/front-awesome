<template>
    <div class="control-panel" :class="'wa-size-' + size">
        <button
            ref="trigger"
            type="button"
            data-view-options-trigger
            class="panel-trigger"
            :class="{ 'icon-only': iconOnly }"
            :title="iconOnly ? label : undefined"
            :aria-label="label"
            aria-haspopup="dialog"
            :aria-expanded="open"
            :aria-controls="panelId"
            @click="activate"
        >
            <Icon :name="icon" library="system" aria-hidden="true" />
            <span v-if="!iconOnly">{{ label }}</span>
        </button>
        <Dialog
            :id="panelId"
            :label="label"
            :open="open"
            :class="{ 'options-dialog': iconOnly }"
            @wa-hide.self="beginHide"
            @wa-after-hide.self="finishHide"
        >
            <span slot="label" class="panel-title">
                <span class="panel-emblem"
                    ><Icon :name="icon" library="system" aria-hidden="true"
                /></span>
                {{ label }}
            </span>
            <div v-if="open" class="panel-shell">
                <div
                    v-scrollbar="{ shadows: true }"
                    class="panel-scroll"
                    tabindex="0"
                    role="region"
                    :aria-label="label"
                >
                    <div class="panel-body"><slot /></div>
                </div>
                <footer class="panel-footer">
                    <slot name="actions" />
                    <Button type="button" :size="size" @click="dismiss"
                        ><Icon slot="start" name="check" library="system" aria-hidden="true" />{{
                            t('done')
                        }}</Button
                    >
                </footer>
            </div>
        </Dialog>
    </div>
</template>
<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import Button from '../components/WebAwesome/Button.vue';
import Dialog from '../components/WebAwesome/Dialog.vue';
import Icon from '../components/WebAwesome/Icon.vue';
import { useScrollbarDirective } from '../scrollbar';
import { useDocumentId } from './documentId';
import { useDataViewText } from './messages';
import type { DataViewSize } from './types';

withDefaults(
    defineProps<{ label: string; size: DataViewSize; icon?: string; iconOnly?: boolean }>(),
    { icon: 'gear' },
);
const t = useDataViewText();
const vScrollbar = useScrollbarDirective();
const panelId = useDocumentId();
const trigger = useTemplateRef('trigger');
const open = ref(false);
let closing = false;
let reopen = false;
function activate() {
    if (closing) {
        reopen = true;
        return;
    }
    if (!open.value) {
        open.value = true;
    }
}
function beginHide() {
    open.value = false;
    closing = true;
}
function finishHide() {
    closing = false;
    if (reopen) {
        reopen = false;
        activate();
    } else trigger.value?.focus({ preventScroll: true });
}
function dismiss() {
    open.value = false;
}
defineExpose({ dismiss });
</script>
<style scoped>
.control-panel {
    min-inline-size: 0;
    max-inline-size: 100%;
}
.panel-trigger {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--wa-space-xs);
    max-inline-size: 100%;
    min-block-size: var(--wa-form-control-height);
    padding: var(--wa-space-xs) var(--wa-space-m);
    border: var(--wa-border-width-s) solid var(--wa-color-neutral-border-normal);
    border-radius: var(--wa-border-radius-m);
    background: var(--wa-color-surface-default);
    color: var(--wa-color-text-normal);
    font: inherit;
    cursor: pointer;
}
.panel-trigger.icon-only {
    inline-size: var(--wa-form-control-height);
    padding: 0;
}
.panel-trigger:hover,
.panel-trigger[aria-expanded='true'] {
    background: var(--wa-color-neutral-fill-quiet);
    border-color: var(--wa-color-neutral-border-loud);
}
.panel-trigger:focus-visible,
.panel-scroll:focus-visible {
    outline: var(--wa-focus-ring);
    outline-offset: var(--wa-focus-ring-offset);
}
.panel-scroll:focus-visible {
    outline-offset: calc(-1 * var(--wa-focus-ring-width));
}
wa-dialog {
    --width: min(27rem, calc(100vw - 1rem));
}
wa-dialog.options-dialog {
    --width: min(44rem, calc(100vw - 1rem));
}
wa-dialog::part(header) {
    align-items: center;
    padding: var(--wa-space-m);
    border-block-end: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
wa-dialog::part(body) {
    display: flex;
    min-block-size: 0;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
}
.panel-title,
.panel-emblem {
    display: inline-flex;
    align-items: center;
}
.panel-title {
    gap: var(--wa-space-s);
    color: var(--wa-color-text-normal);
    font-size: var(--wa-font-size-l);
    font-weight: var(--wa-font-weight-semibold);
}
.panel-emblem {
    justify-content: center;
    width: 2.15em;
    height: 2.15em;
    border-radius: var(--wa-border-radius-m);
    background: var(--wa-color-brand-fill-quiet);
    color: var(--wa-color-brand-on-quiet);
    font-size: var(--wa-font-size-m);
}
.panel-shell {
    display: flex;
    flex-direction: column;
    min-block-size: 0;
    max-block-size: 70dvh;
}
.panel-scroll {
    container: options-dialog / inline-size;
    min-block-size: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
}
.panel-body {
    padding: var(--wa-space-m);
    overflow-wrap: anywhere;
}
.options-dialog .panel-body {
    padding: 0;
}
.panel-footer {
    display: flex;
    flex-wrap: wrap;
    gap: var(--wa-space-s);
    align-items: center;
    justify-content: end;
    flex: none;
    border-block-start: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    padding: var(--wa-space-s) var(--wa-space-m);
}
.panel-footer > wa-button:last-child {
    margin-inline-start: auto;
}
@media (max-width: 36rem) {
    .panel-footer:has(> :nth-child(2)) {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: var(--wa-space-xs);
        padding-inline: var(--wa-space-s);
    }
    .panel-footer > wa-button::part(base) {
        min-block-size: var(--wa-form-control-height);
        block-size: auto;
        padding-inline: var(--wa-space-s);
    }
    .panel-footer > wa-button::part(label) {
        line-height: var(--wa-line-height-condensed);
        white-space: normal;
    }
}
@media (pointer: coarse) {
    .panel-trigger {
        min-block-size: max(44px, var(--wa-form-control-height));
    }
    .panel-trigger.icon-only {
        inline-size: max(44px, var(--wa-form-control-height));
    }
}
</style>
