<template>
    <span class="sort-priority" aria-hidden="true">
        <span v-if="!loaded" class="priority-number">{{ priority }}</span>
        <Icon
            v-if="priority < 10"
            :name="'square-' + priority"
            family="classic"
            variant="solid"
            library="default"
            :class="{ loaded }"
            @wa-load="loaded = true"
            @wa-error="loaded = false"
        />
    </span>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Icon from '../components/WebAwesome/Icon.vue';

defineProps<{ priority: number }>();
const loaded = ref(false);
</script>

<style scoped>
.sort-priority {
    display: inline-grid;
    place-items: center;
    min-inline-size: 1.1em;
    block-size: 1.1em;
    font-size: max(0.875rem, 1em);
    line-height: 1;
    font-variant-numeric: tabular-nums;
}
.sort-priority > * {
    grid-area: 1 / 1;
}
.sort-priority wa-icon {
    font-size: 1.1em;
    opacity: 0;
}
.sort-priority wa-icon.loaded {
    opacity: 1;
}
.priority-number {
    display: grid;
    place-items: center;
    min-inline-size: 1.35em;
    block-size: 1.35em;
    padding-inline: 0.12em;
    border-radius: 0.22em;
    background: var(--wa-color-neutral-fill-normal);
    color: var(--wa-color-neutral-on-normal);
    font-size: 0.78em;
    font-weight: var(--wa-font-weight-bold);
}
@media (forced-colors: active) {
    .priority-number {
        outline: 1px solid currentColor;
    }
}
</style>
