<template>
    <div
        class="fa-theme"
        :class="dark ? 'wa-dark' : 'wa-light'"
        style="
            --color-brand-800: rgb(15 60 130);
            --color-brand-300: rgb(135 190 245);
            --color-gray-950: rgb(18 25 48);
        "
    >
        <label>
            Scrollbar variant
            <select v-model="variant">
                <option v-for="option in variants" :key="option">{{ option }}</option>
            </select>
        </label>
        <button type="button" @click="dark = !dark">Change theme</button>
        <button type="button" @click="horizontal = !horizontal">Change scroll axis</button>
        <button type="button" @click="alternative = !alternative">Replace scroll content</button>
        <button type="button" @click="toggleVisibility">Change scrollbar visibility</button>
        <section
            v-fa-scrollbar="variant"
            :class="
                horizontal
                    ? 'overflow-x-auto overflow-y-hidden'
                    : 'overflow-x-hidden overflow-y-auto'
            "
            class="sticky h-24"
            aria-label="Notifications"
            tabindex="0"
        >
            <div class="min-w-[3200px]">
                <p v-for="number in 12" :key="number">Notification {{ number }}</p>
            </div>
        </section>
        <div v-scrollbar data-testid="default-scrollbar" class="h-24 overflow-auto">
            <p v-for="number in 12" :key="number">Notification {{ number }}</p>
        </div>
        <div v-scrollbar.neutral data-testid="neutral-scrollbar" class="h-24 overflow-auto">
            <p v-for="number in 12" :key="number">Notification {{ number }}</p>
        </div>
        <div data-testid="brand-class" class="fa-scrollbar-brand h-24 overflow-auto">
            <p v-for="number in 12" :key="number">Notification {{ number }}</p>
        </div>
        <div data-testid="unmarked-scrollbar" class="h-24 overflow-auto">
            <p v-for="number in 12" :key="number">Notification {{ number }}</p>
        </div>
        <textarea v-scrollbar.brand class="h-12" aria-label="Native text control" />
        <div v-scrollbar data-testid="visible-content" class="h-12">
            <p v-for="number in 12" :key="number">Visible text {{ number }}</p>
        </div>
        <section
            v-scrollbar.brand="options"
            aria-label="Dynamic HTML"
            class="h-24 overflow-auto"
            tabindex="0"
            v-html="alternative ? nextMarkup : initialMarkup"
        />
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { ScrollbarOptions, ScrollbarVariant } from '@artisan-toolbox/front-awesome';

const variant = ref<ScrollbarVariant>('neutral');
const variants = ['neutral', 'brand', 'success', 'warning', 'danger'] satisfies ScrollbarVariant[];
const dark = ref(false);
const horizontal = ref(false);
const alternative = ref(false);
const initialMarkup = '<p>Original content</p>'.repeat(12);
const nextMarkup = '<p>Replacement content</p>'.repeat(12);
const scrollbars: NonNullable<ScrollbarOptions['scrollbars']> = reactive({});
const options: ScrollbarOptions = { scrollbars };

function toggleVisibility(): void {
    if (scrollbars.visibility === 'hidden') {
        delete scrollbars.visibility;
    } else {
        scrollbars.visibility = 'hidden';
    }
}
</script>
