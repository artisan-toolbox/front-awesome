<template>
    <wa-tag :pill.attr="pill ? '' : null" :with-remove.attr="withRemove ? '' : null">
        <slot />
    </wa-tag>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { TagProps } from '../../WebAwesome/tagProps';

interface Props extends /* @vue-ignore */ TagProps {
    pill?: boolean;
    withRemove?: boolean;
}

defineProps<Props>();

onMounted(async () => {
    await import('#front-awesome-webawesome/components/tag/tag.js');
});
</script>
