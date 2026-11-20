<template>
    <Dialog
        v-bind="$attrs"
        :open="visible"
        :label="text('title')"
        with-label
        with-footer
        :class="['permission-editor', { 'editor-saving': saving }]"
        @wa-hide="beforeHide"
        @wa-after-hide="afterHide"
    >
        <span slot="label" class="editor-heading">
            <span>{{ text('title') }}</span>
            <span v-if="target" class="editor-subject">{{ target.label || target.id }}</span>
        </span>

        <div v-scrollbar class="editor-content" :aria-busy="state.kind === 'loading' || saving">
            <div class="editor-pane">
                <div v-if="state.kind === 'loading'" class="editor-placeholder" role="status">
                    <Spinner />
                    <span>{{
                        text(
                            state.pending
                                ? state.pending.reason === 'saved'
                                    ? 'saved'
                                    : 'reloading'
                                : 'loading',
                        )
                    }}</span>
                </div>
                <div v-else-if="state.kind === 'error'" class="editor-status" role="alert">
                    <Callout variant="warning">
                        <div class="editor-message">
                            <strong v-if="state.pending?.reason === 'saved'">{{
                                text('savedReload')
                            }}</strong>
                            <span>{{ failureMessage }}</span>
                            <div
                                v-if="
                                    state.failure !== 'missing' &&
                                    state.failure !== 'invalidSubject'
                                "
                            >
                                <Button
                                    appearance="outlined"
                                    size="s"
                                    type="button"
                                    @click="session.retry"
                                >
                                    {{ text('retry') }}
                                </Button>
                            </div>
                        </div>
                    </Callout>
                </div>
                <div v-else-if="state.kind === 'review'" class="editor-review">
                    <Callout variant="warning" role="status">
                        {{ reviewMessage }}
                    </Callout>
                    <table class="editor-comparison">
                        <thead>
                            <tr>
                                <td></td>
                                <th scope="col">{{ text('current') }}</th>
                                <th scope="col">{{ text('draft') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in reviewRows.slice(0, reviewLimit)" :key="row.key">
                                <th scope="row">{{ row.name }}</th>
                                <td>{{ text(row.current) }}</td>
                                <td>{{ text(row.draft) }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <Button
                        v-if="reviewRows.length > reviewLimit"
                        type="button"
                        appearance="outlined"
                        size="s"
                        @click="reviewLimit += 40"
                    >
                        {{ text('showMore') }}
                    </Button>
                </div>
                <template v-else-if="state.kind === 'editing' || state.kind === 'saving'">
                    <div v-if="refresh === 'failed'" class="editor-notice" role="alert">
                        <Callout variant="warning">
                            <div class="editor-message">
                                <span>{{ text('refreshFailed') }}</span>
                                <div>
                                    <Button
                                        type="button"
                                        size="s"
                                        appearance="outlined"
                                        @click="session.refreshActor"
                                    >
                                        {{ text('refresh') }}
                                    </Button>
                                </div>
                            </div>
                        </Callout>
                    </div>
                    <div
                        v-else-if="state.kind === 'editing' && state.saved"
                        class="editor-notice"
                        role="status"
                    >
                        <Callout variant="success">{{ text('saved') }}</Callout>
                    </div>
                    <div
                        v-if="state.kind === 'editing' && !state.draft.snapshot.canUpdate"
                        class="editor-notice"
                    >
                        <Callout :variant="state.denied ? 'warning' : 'neutral'" role="status">
                            {{ text(state.denied ? 'forbidden' : 'readOnly') }}
                        </Callout>
                    </div>
                    <div
                        v-if="state.kind === 'editing' && state.errors"
                        class="editor-notice"
                        role="alert"
                    >
                        <Callout variant="danger">
                            <div class="editor-message">
                                <span>{{ text('validation') }}</span>
                                <div v-if="errorRows.length" class="wa-cluster">
                                    <Button
                                        v-for="error in errorRows"
                                        :key="error.key"
                                        type="button"
                                        size="s"
                                        appearance="plain"
                                        @click="catalog?.focusAbility(error.key)"
                                    >
                                        {{ error.name }}
                                    </Button>
                                </div>
                            </div>
                        </Callout>
                    </div>
                    <PermissionCatalog
                        ref="catalog"
                        :key="state.draft.snapshot.subject"
                        :sections="state.draft.snapshot.sections"
                        :icon-family="state.draft.snapshot.iconFamily"
                        :values="state.draft.snapshot.values"
                        :changes="state.draft.changes"
                        :can-update="state.draft.snapshot.canUpdate"
                        :busy="saving"
                        :errors="state.kind === 'editing' ? state.errors : undefined"
                        @change="session.toggle"
                    />
                </template>
            </div>
        </div>

        <div slot="footer" class="editor-footer">
            <span class="editor-footer-status" role="status">
                {{ saving ? text('saving') : changes ? text('changes', changes) : '' }}
            </span>
            <div class="editor-buttons">
                <template v-if="state.kind === 'review'">
                    <Button appearance="outlined" type="button" @click="session.review(false)">
                        {{ text('useCurrent') }}
                    </Button>
                    <Button variant="brand" type="button" @click="session.review(true)">
                        {{ text('applyDraft') }}
                    </Button>
                </template>
                <template v-else>
                    <Button
                        appearance="outlined"
                        type="button"
                        :disabled="saving"
                        @click="requestClose"
                    >
                        {{ text(changes ? 'cancel' : 'close') }}
                    </Button>
                    <Button
                        v-if="
                            (state.kind === 'editing' || state.kind === 'saving') &&
                            state.draft.snapshot.canUpdate
                        "
                        variant="brand"
                        type="button"
                        :disabled="saving || !changes"
                        @click="session.save"
                    >
                        {{ text('save') }}
                    </Button>
                </template>
            </div>
        </div>
    </Dialog>

    <Dialog
        class="editor-discard"
        :open="confirmation?.phase === 'asking'"
        :label="text('discardTitle')"
        with-footer
        @wa-after-hide="afterConfirmationHide"
    >
        <p class="editor-discard-message">{{ text('discardBody') }}</p>
        <div slot="footer" class="editor-buttons">
            <Button appearance="outlined" type="button" data-dialog="close" autofocus>
                {{ text('keepEditing') }}
            </Button>
            <Button variant="danger" type="button" @click="discard">
                {{ text('discard') }}
            </Button>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import { computed, shallowRef, useTemplateRef, watch } from 'vue';
import Button from '../components/WebAwesome/Button.vue';
import Callout from '../components/WebAwesome/Callout.vue';
import Dialog from '../components/WebAwesome/Dialog.vue';
import Spinner from '../components/WebAwesome/Spinner.vue';
import { useScrollbarDirective } from '../scrollbar';
import PermissionCatalog from './PermissionCatalog.vue';
import { useEditorText } from './messages';
import { normalizeSubject, subjectUrl } from './protocol';
import type { Subject, UserPermissionEditorHandle, UserPermissionEditorSubject } from './protocol';
import { usePermissionSession } from './usePermissionSession';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
    subjectId?: UserPermissionEditorSubject['subjectId'];
    subjectLabel?: string;
    unavailableMessage?: string;
}>();
const modelOpen = defineModel<boolean>('open', { default: false });
const vScrollbar = useScrollbarDirective();
const page = usePage();
const text = useEditorText();
const visible = shallowRef(false);
const catalog = useTemplateRef('catalog');
const session = usePermissionSession((subject) =>
    typeof window === 'undefined'
        ? undefined
        : subjectUrl(page.props?.userPermissionEditor, subject, new URL(window.location.href)),
);
const { changes, target, state, refresh } = session;
const saving = computed(() => state.value.kind === 'saving');
type Owner = 'model' | 'method';
let owner: Owner = 'model';
let closing = false;
type OpenAction = { kind: 'open'; subject?: Subject; owner: Owner };
type Action = OpenAction | { kind: 'close' };
let queuedOpen: OpenAction | undefined;
const confirmation = shallowRef<{ phase: 'asking' | 'discarding'; action: Action }>();
const reviewLimit = shallowRef(40);

const failureMessage = computed(() => {
    if (state.value.kind !== 'error') return '';
    return state.value.failure === 'unavailable'
        ? (props.unavailableMessage ?? text('unavailable'))
        : text(state.value.failure);
});
const reviewMessage = computed(() => {
    if (state.value.kind !== 'review') return '';
    switch (state.value.pending.reason) {
        case 'session':
            return text('reviewSession');
        case 'conflict':
            return text('reviewConflict');
        default:
            return text('reviewUncertain');
    }
});
const names = computed(() => {
    const current = state.value;
    if (current.kind !== 'editing' && current.kind !== 'review') return new Map<string, string>();
    return new Map(
        current.draft.snapshot.sections.flatMap((section) =>
            section.abilities.map(({ key, name }) => [key, name] as const),
        ),
    );
});
const errorRows = computed(() =>
    state.value.kind === 'editing'
        ? Object.keys(state.value.errors ?? {}).map((key) => ({
              key,
              name: names.value.get(key) ?? key,
          }))
        : [],
);
const reviewRows = computed(() => {
    const current = state.value;
    if (current.kind !== 'review') return [];
    const latest = current.draft.snapshot;
    const previous = current.pending.draft;
    const ordered = [
        ...latest.sections.flatMap((section) => section.abilities),
        ...previous.snapshot.sections.flatMap((section) =>
            section.abilities.filter(({ key }) => !Object.hasOwn(latest.values, key)),
        ),
    ];
    return ordered.flatMap(({ key, name }) => {
        const activeValue = Object.hasOwn(latest.values, key) ? latest.values[key] : undefined;
        const savedBefore = Object.hasOwn(previous.snapshot.values, key)
            ? previous.snapshot.values[key]
            : undefined;
        const wanted = previous.changes.get(key) ?? savedBefore;
        if (activeValue === wanted && !previous.changes.has(key)) return [];
        return [
            {
                key,
                name,
                current: activeValue === undefined ? 'removed' : activeValue ? 'allowed' : 'denied',
                draft: wanted === undefined ? 'notInDraft' : wanted ? 'allowed' : 'denied',
            } as const,
        ];
    });
});

function openSubject(action: OpenAction) {
    reviewLimit.value = 40;
    owner = action.owner;
    visible.value = true;
    modelOpen.value = true;
    session.open(action.subject);
}

function confirm(action: Action) {
    if (confirmation.value?.phase !== 'discarding') {
        confirmation.value = { phase: 'asking', action };
    }
}

function askToOpen(subject: Subject | undefined, source: Owner) {
    const action: OpenAction = { kind: 'open', subject, owner: source };
    if (closing) {
        queuedOpen = action;
        return;
    }
    if (visible.value && subject && subject.id === target.value?.id) {
        session.updateLabel(subject.label);
        return;
    }
    if (saving.value) return;
    if (visible.value && changes.value) {
        confirm(action);
        return;
    }
    openSubject(action);
}

function show(subject: UserPermissionEditorSubject) {
    askToOpen(subject && normalizeSubject(subject), 'method');
}

function propSubject() {
    if (props.subjectId === undefined) return;
    return normalizeSubject({ subjectId: props.subjectId, subjectLabel: props.subjectLabel });
}

function close() {
    closing = true;
    visible.value = false;
    modelOpen.value = false;
}

function requestClose() {
    if (saving.value || changes.value) {
        modelOpen.value = true;
        if (!saving.value) confirm({ kind: 'close' });
        return;
    }
    close();
}

function beforeHide(event: Event) {
    if (closing) return;
    if (saving.value || changes.value) {
        event.preventDefault();
        requestClose();
    } else {
        closing = true;
    }
}

function afterHide() {
    session.reset();
    confirmation.value = undefined;
    visible.value = false;
    modelOpen.value = false;
    closing = false;
    const next = queuedOpen;
    queuedOpen = undefined;
    if (next) openSubject(next);
}

function discard() {
    if (confirmation.value?.phase === 'asking') {
        confirmation.value = { phase: 'discarding', action: confirmation.value.action };
    }
}

function afterConfirmationHide() {
    const result = confirmation.value;
    confirmation.value = undefined;
    if (result?.phase !== 'discarding') return;
    if (result.action.kind === 'open') openSubject(result.action);
    else close();
}

watch(
    modelOpen,
    (open) => {
        if (open === visible.value) return;
        if (open) askToOpen(propSubject(), 'model');
        else requestClose();
    },
    { immediate: true },
);

watch(
    () => [props.subjectId, props.subjectLabel],
    () => {
        if (owner === 'model' && visible.value) askToOpen(propSubject(), 'model');
    },
);

defineExpose<UserPermissionEditorHandle>({ show });
</script>

<style scoped>
.permission-editor {
    --width: 64rem;
}
.permission-editor::part(dialog) {
    max-block-size: min(92dvh, 68rem);
}
.permission-editor::part(body) {
    display: flex;
    flex-direction: column;
    min-block-size: 0;
    padding: 0;
    overflow: hidden;
}
.permission-editor::part(footer) {
    padding-block-start: var(--wa-space-s);
    border-block-start: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
.permission-editor.editor-saving::part(close-button) {
    visibility: hidden;
}
.editor-heading {
    display: grid;
    gap: var(--wa-space-2xs);
    min-inline-size: 0;
    overflow-wrap: anywhere;
}
.editor-subject {
    color: var(--wa-color-text-quiet);
    font-size: var(--wa-font-size-s);
    font-weight: var(--wa-font-weight-normal);
}
.editor-content {
    display: flex;
    flex-direction: column;
    min-block-size: 0;
    overflow: auto;
}
.editor-pane {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-block-size: 0;
}
.editor-placeholder {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: var(--wa-space-s);
    min-block-size: 10rem;
    padding: var(--wa-space-l);
    color: var(--wa-color-text-quiet);
}
.editor-status,
.editor-review {
    padding: var(--wa-space-l);
}
.editor-notice {
    padding: var(--wa-space-xs) var(--wa-space-l) 0;
}
.editor-message {
    display: grid;
    gap: var(--wa-space-s);
}
.editor-comparison {
    inline-size: 100%;
    margin-block-start: var(--wa-space-s);
    margin-block-end: var(--wa-space-m);
    border-collapse: collapse;
    text-align: start;
}
.editor-comparison th,
.editor-comparison td {
    padding: var(--wa-space-s) var(--wa-space-xs);
    border-block-end: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    text-align: start;
    overflow-wrap: anywhere;
}
.editor-comparison td:last-child {
    color: var(--wa-color-brand-on-quiet);
}
.editor-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--wa-space-xs) var(--wa-space-s);
    inline-size: 100%;
}
.editor-footer-status {
    color: var(--wa-color-text-quiet);
    font-size: var(--wa-font-size-s);
}
.editor-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--wa-space-xs);
    margin-inline-start: auto;
}
.editor-discard {
    --width: 29rem;
}
.editor-discard-message {
    margin: 0;
    color: var(--wa-color-text-quiet);
}
@media (max-width: 35em) {
    .editor-footer-status:empty {
        display: none;
    }
}
</style>
