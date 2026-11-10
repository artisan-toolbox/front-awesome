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
        <slot />
    </wa-button>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { ButtonProps } from '../../WebAwesome/buttonProps';

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

onMounted(async () => {
    await import('#front-awesome-webawesome/components/button/button.js');
});
</script>
