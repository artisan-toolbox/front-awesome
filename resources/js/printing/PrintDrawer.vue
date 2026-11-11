<template>
    <Drawer
        class="front-awesome-print-drawer"
        :class="{ 'print-drawer-summary': job?.status === 'complete' && job.showSummary }"
        :open="state.visible"
        :label="messages.title"
        @update:open="(open) => (open ? service.show() : service.hide())"
    >
        <template #label>
            <div class="wa-stack wa-gap-xs">
                <span class="print-heading">{{ job?.title ?? messages.title }}</span>
                <span class="print-subtitle">{{ messages.subtitle }}</span>
            </div>
        </template>
        <template v-if="job && step">
            <div class="wa-stack wa-gap-m print-content">
                <div class="wa-split wa-gap-m print-progress" aria-live="polite">
                    <span
                        >{{ messages.step }} {{ job.stepIndex + 1 }} {{ messages.of }}
                        {{ job.steps.length }}
                        <span class="print-quiet">{{ step.title }}</span></span
                    >
                    <Tag size="s"
                        >{{ Math.max(0, state.jobs.length - 1) }} {{ messages.queued }}</Tag
                    >
                </div>
                <slot v-if="job.status === 'complete' && job.showSummary" name="summary" :job="job">
                    <section class="wa-stack wa-gap-m" :aria-label="messages.summary">
                        <h2>{{ messages.summary }}</h2>
                        <ul class="wa-stack wa-gap-0 print-results">
                            <li
                                v-for="result in job.steps"
                                :key="result.id"
                                class="wa-stack wa-gap-xs"
                            >
                                <div class="wa-split wa-gap-s">
                                    <strong>{{ result.title }}</strong
                                    ><Tag :variant="variant(result.status)">{{
                                        status(result.status)
                                    }}</Tag>
                                </div>
                                <p v-if="result.message" class="print-quiet">
                                    {{ result.message }}
                                </p>
                            </li>
                        </ul>
                    </section>
                </slot>
                <template v-else>
                    <div class="wa-split wa-gap-m print-connection">
                        <span role="status" class="print-quiet">{{ connectionText }}</span>
                        <Button
                            size="s"
                            :loading="state.connection === 'connecting'"
                            @click="service.connect()"
                            >{{
                                state.connection === 'idle' ? messages.connect : messages.reconnect
                            }}</Button
                        >
                    </div>
                    <Callout v-if="state.connectionError" variant="warning">{{
                        state.connectionError
                    }}</Callout>
                    <Callout
                        v-else-if="state.connection === 'ready' && !state.printers.length"
                        variant="warning"
                        >{{ messages.noPrinters }}</Callout
                    >
                    <Callout
                        v-if="
                            state.connection === 'ready' &&
                            step.printer &&
                            !state.printers.includes(step.printer)
                        "
                        variant="warning"
                        >{{ messages.unavailablePrinter }}</Callout
                    >
                    <Callout
                        v-if="step.message"
                        :variant="variant(step.status)"
                        aria-live="polite"
                        >{{ step.message }}</Callout
                    >
                    <div class="print-workspace">
                        <slot name="preview" :step="step" :retry="service.preview">
                            <PrintPreview
                                :step="step"
                                :messages="messages"
                                :status-text="status(step.status)"
                                @retry="service.preview()"
                            />
                        </slot>
                        <slot
                            name="settings"
                            :step="step"
                            :printers="state.printers"
                            :configure="service.configure"
                        >
                            <PrintSettings
                                :step="step"
                                :messages="messages"
                                :printers="state.printers"
                                :connection="state.connection"
                                :disabled="step.status !== 'ready'"
                                @configure="service.configure"
                            >
                                <slot
                                    name="settings-extra"
                                    :step="step"
                                    :configure="service.configure"
                                />
                            </PrintSettings>
                        </slot>
                    </div>
                </template>
            </div>
        </template>
        <template #footer>
            <slot name="footer" :service="service" :job="job" :step="step">
                <div
                    v-if="job && step"
                    class="wa-split wa-gap-m print-footer"
                    @click.capture="preventRepeatedAction"
                    @keydown.capture="preventRepeatedAction"
                >
                    <Button
                        v-if="job.status !== 'complete'"
                        appearance="plain"
                        @click="cancelJob"
                        >{{ messages.cancel }}</Button
                    >
                    <div class="wa-cluster wa-gap-s">
                        <Button
                            v-if="step.status === 'ready' || step.status === 'loading'"
                            appearance="plain"
                            @click="service.skip()"
                            >{{ messages.skip }}</Button
                        >
                        <Button
                            v-if="
                                step.status === 'ready' ||
                                step.status === 'submitting' ||
                                step.status === 'loading'
                            "
                            variant="brand"
                            :loading="step.status === 'submitting'"
                            :disabled="!canSubmit"
                            @click="service.submit()"
                            >{{
                                step.status === 'submitting' ? messages.submitting : messages.submit
                            }}</Button
                        >
                        <Button v-else variant="brand" @click="service.next()">{{
                            job.status === 'complete' && !hasMoreOutcomes
                                ? messages.finish
                                : messages.next
                        }}</Button>
                    </div>
                </div>
                <Button v-else @click="service.hide()">{{ messages.close }}</Button>
            </slot>
        </template>
    </Drawer>
</template>

<script setup lang="ts">
import { computed, inject, watch } from 'vue';
import Drawer from '../components/WebAwesome/Drawer.vue';
import Button from '../components/WebAwesome/Button.vue';
import Tag from '../components/WebAwesome/Tag.vue';
import Callout from '../components/WebAwesome/Callout.vue';
import PrintPreview from './PrintPreview.vue';
import PrintSettings from './PrintSettings.vue';
import { printingKey } from './context';
import type { PrintingMessages } from './messages';
import type { PrintingService, PrintStepStatus } from './types';
const props = defineProps<{ service?: PrintingService; messages?: Partial<PrintingMessages> }>();
const injected = inject(printingKey, undefined);
function missingService(): never {
    throw new Error(
        'PrintDrawer requires a printing service prop or createFrontAwesome({ printing }).',
    );
}
const service = props.service ?? injected ?? missingService();
const state = service.state;
const job = service.currentJob;
const step = service.currentStep;
const messages = computed(() => ({ ...service.messages, ...props.messages }));
const connectionText = computed(() =>
    state.value.connection === 'connecting'
        ? messages.value.connecting
        : state.value.connection === 'ready'
          ? messages.value.connected
          : state.value.connection === 'failed'
            ? messages.value.connectionFailed
            : messages.value.connect,
);
const canSubmit = computed(
    () =>
        step.value?.status === 'ready' &&
        step.value.preview.status === 'ready' &&
        state.value.connection === 'ready' &&
        state.value.printers.includes(step.value.printer) &&
        Number.isInteger(step.value.document?.options?.copies ?? 1) &&
        (step.value.document?.options?.copies ?? 1) >= 1 &&
        (step.value.document?.options?.copies ?? 1) <= 999,
);
watch(
    () => (state.value.visible ? job.value?.id : undefined),
    (id, previousId) => {
        if (id && (!previousId || state.value.connection === 'idle')) void service.connect();
    },
    { immediate: true },
);
const hasMoreOutcomes = computed(
    () =>
        job.value &&
        !job.value.showSummary &&
        job.value.steps
            .slice(job.value.stepIndex + 1)
            .some((step) => step.status === 'failed' || step.status === 'unknown'),
);
function status(value: PrintStepStatus) {
    const labels: Record<PrintStepStatus, string> = {
        loading: messages.value.statusLoading,
        ready: messages.value.statusReady,
        submitting: messages.value.statusSubmitting,
        submitted: messages.value.statusSubmitted,
        skipped: messages.value.statusSkipped,
        cancelled: messages.value.statusCancelled,
        failed: messages.value.statusFailed,
        unknown: messages.value.statusUnknown,
    };
    return labels[value];
}
function variant(value: PrintStepStatus) {
    return value === 'submitted'
        ? 'success'
        : value === 'failed'
          ? 'danger'
          : value === 'unknown'
            ? 'warning'
            : 'neutral';
}
function cancelJob() {
    const current = job.value;
    if (!current) return;
    service.cancel(current.id);
}
function preventRepeatedAction(event: MouseEvent | KeyboardEvent) {
    const repeated =
        event instanceof KeyboardEvent
            ? event.repeat && (event.key === 'Enter' || event.key === ' ')
            : event.detail > 1;
    if (repeated) {
        event.preventDefault();
        event.stopPropagation();
    }
}
</script>

<style scoped>
.front-awesome-print-drawer {
    --size: min(100vw, 96ch);
    --spacing: var(--wa-space-m);
    font-size: var(--wa-font-size-s);
    line-height: var(--wa-line-height-normal);
}
.print-drawer-summary {
    --size: min(100vw, 64ch);
}
.front-awesome-print-drawer::part(body) {
    overflow-y: auto;
}
.print-heading {
    font-size: var(--wa-font-size-l);
    font-weight: var(--wa-font-weight-semibold);
}
.print-subtitle,
.print-quiet {
    color: var(--wa-color-text-quiet);
    font-size: var(--wa-font-size-s);
}
.print-subtitle {
    font-weight: var(--wa-font-weight-normal);
}
.print-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(24ch, 30ch);
    gap: var(--wa-space-m);
    align-items: start;
}
.print-progress {
    padding-block-end: var(--wa-space-m);
    border-block-end: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
.print-progress .print-quiet {
    margin-inline-start: var(--wa-space-s);
}
.print-results {
    list-style: none;
    padding: 0;
}
.print-results > li {
    padding-block: var(--wa-space-s);
}
.print-results > li:not(:last-child) {
    border-block-end: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
h2 {
    font-size: var(--wa-font-size-m);
}
h2,
p {
    margin: 0;
}
.print-footer {
    width: 100%;
}
.print-footer > :last-child {
    margin-inline-start: auto;
}
@media (max-width: 700px) {
    .front-awesome-print-drawer {
        --size: 100vw;
        --spacing: var(--wa-space-m);
    }
    .print-workspace {
        grid-template-columns: minmax(0, 1fr);
    }
    .print-footer {
        flex-wrap: wrap;
    }
}
</style>
