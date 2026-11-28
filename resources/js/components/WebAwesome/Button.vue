<template>
    <wa-button
        :disabled.attr="disabled ? '' : null"
        :loading.attr="loading ? '' : null"
        :pill.attr="pill ? '' : null"
        :with-caret.attr="withCaret ? '' : null"
        :with-start.attr="withStart ? '' : null"
        :with-end.attr="withEnd ? '' : null"
        :formnovalidate.attr="formnovalidate ? '' : null"
    >
        <NamedSlot v-if="$slots.start" name="start" :nodes="$slots.start()" />
        <slot />
        <NamedSlot v-if="$slots.end" name="end" :nodes="$slots.end()" />
    </wa-button>
</template>

<script setup lang="ts">
import { onMounted, type VNode } from 'vue';
import type { ButtonProps } from '../../WebAwesome/buttonProps';
import { projectNativeSlot } from '../../WebAwesome/nativeSlots';

interface Props extends /* @vue-ignore */ ButtonProps {
    disabled?: boolean;
    loading?: boolean;
    pill?: boolean;
    withCaret?: boolean;
    withStart?: boolean;
    withEnd?: boolean;
    formnovalidate?: boolean;
}

defineProps<Props>();

function NamedSlot(props: { name: string; nodes: VNode[] }) {
    return projectNativeSlot(props.nodes, props.name);
}
NamedSlot.props = ['name', 'nodes'];

onMounted(async () => {
    await import('#front-awesome-webawesome/components/button/button.js');
});
</script>
