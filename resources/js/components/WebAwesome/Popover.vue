<template>
    <wa-popover :open.attr="open ? '' : null" :without-arrow.attr="withoutArrow ? '' : null">
        <slot />
    </wa-popover>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { PopoverProps } from '../../WebAwesome/popoverProps';

interface Props extends /* @vue-ignore */ PopoverProps {
    open?: boolean;
    withoutArrow?: boolean;
}

defineProps<Props>();

onMounted(async () => {
    await import('#front-awesome-webawesome/components/popover/popover.js');
});
</script>
