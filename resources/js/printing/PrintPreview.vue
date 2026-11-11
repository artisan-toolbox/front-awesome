<template>
    <section class="print-preview wa-stack wa-gap-m" :aria-label="messages.preview">
        <div class="wa-split wa-gap-s">
            <span>{{ messages.preview }}</span>
            <div v-if="step.preview.images.length" class="wa-cluster wa-gap-xs">
                <Button
                    size="s"
                    appearance="plain"
                    :aria-label="messages.zoomOut"
                    :disabled="zoom <= 50"
                    @click="zoom -= 25"
                    ><span aria-hidden="true">−</span
                    ><span class="wa-visually-hidden">{{ messages.zoomOut }}</span></Button
                >
                <output>{{ zoom }}%</output>
                <Button
                    size="s"
                    appearance="plain"
                    :aria-label="messages.zoomIn"
                    :disabled="zoom >= 200"
                    @click="zoom += 25"
                    ><span aria-hidden="true">+</span
                    ><span class="wa-visually-hidden">{{ messages.zoomIn }}</span></Button
                >
            </div>
        </div>
        <div class="print-paper-stage">
            <div
                v-if="step.status === 'loading' || step.preview.status === 'loading'"
                class="print-placeholder wa-stack wa-gap-m"
                role="status"
            >
                <Spinner />
                <p>
                    {{
                        step.status === 'loading'
                            ? messages.loadingDocument
                            : messages.loadingPreview
                    }}
                </p>
            </div>
            <div
                v-else-if="step.preview.status === 'failed'"
                class="print-placeholder wa-stack wa-gap-m"
            >
                <Callout variant="warning">{{ step.preview.message }}</Callout>
                <Button @click="$emit('retry')">{{ messages.retryPreview }}</Button>
            </div>
            <div v-else-if="step.type === 'raw' && step.document" class="wa-stack wa-gap-m">
                <Callout variant="warning">{{ messages.rawPreview }}</Callout>
                <pre class="print-raw">{{
                    Array.isArray(step.document.payload)
                        ? step.document.payload.join('\n')
                        : step.document.payload
                }}</pre>
            </div>
            <img
                v-else-if="image"
                :src="image"
                :alt="`${step.title}, ${messages.page} ${page + 1}`"
                class="print-paper"
                :style="paperStyle"
            />
            <p v-else class="print-placeholder">{{ statusText }}</p>
        </div>
        <nav
            v-if="step.preview.images.length > 1"
            class="wa-cluster wa-gap-s print-page-controls"
            :aria-label="messages.preview"
        >
            <Button size="s" :disabled="page === 0" @click="page--">{{
                messages.previousPage
            }}</Button>
            <output aria-live="polite"
                >{{ messages.page }} {{ page + 1 }} {{ messages.of }}
                {{ step.preview.images.length }}</output
            >
            <Button size="s" :disabled="page >= step.preview.images.length - 1" @click="page++">{{
                messages.nextPage
            }}</Button>
        </nav>
    </section>
</template>

<script setup lang="ts">
import { computed, ref, watch, type CSSProperties } from 'vue';
import Button from '../components/WebAwesome/Button.vue';
import Spinner from '../components/WebAwesome/Spinner.vue';
import Callout from '../components/WebAwesome/Callout.vue';
import type { PrintStepView } from './types';
import type { PrintingMessages } from './messages';
const props = defineProps<{
    step: PrintStepView;
    messages: PrintingMessages;
    statusText: string;
}>();
defineEmits<{ retry: [] }>();
const page = ref(0);
const zoom = ref(100);
watch(
    () => props.step.id,
    () => {
        page.value = 0;
        zoom.value = 100;
    },
);
watch(
    () => props.step.preview.images,
    () => {
        if (page.value >= props.step.preview.images.length) page.value = 0;
    },
);
const paperStyle = computed<CSSProperties>(() =>
    props.step.type === 'pdf'
        ? {
              height: `${zoom.value}%`,
              width: 'auto',
              maxWidth: zoom.value === 100 ? '100%' : 'none',
              objectFit: 'contain',
          }
        : { width: `${zoom.value}%` },
);
const image = computed(() => props.step.preview.images[page.value]);
</script>

<style scoped>
.print-preview {
    min-width: 0;
}
.print-paper-stage {
    overflow: auto;
    background: var(--wa-color-surface-lowered);
    border-radius: var(--wa-border-radius-m);
    padding: var(--wa-space-m);
    height: min(52vh, 32rem);
    box-sizing: border-box;
    text-align: center;
}
.print-paper {
    margin-inline: auto;
    max-width: none;
    height: auto;
    vertical-align: top;
    background: white;
    box-shadow: var(--wa-shadow-m);
}
.print-placeholder {
    min-height: 100%;
    justify-content: center;
    align-items: center;
    color: var(--wa-color-text-quiet);
    margin: 0;
}
.print-raw {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    text-align: start;
}
.print-page-controls {
    justify-content: center;
}
@media (max-width: 700px) {
    .print-paper-stage {
        padding: var(--wa-space-m);
        height: 45vh;
    }
    .print-placeholder {
        min-height: 100%;
    }
}
</style>
