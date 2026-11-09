<template>
    <wa-icon
        :auto-width.attr="autoWidth ? '' : null"
        :swap-opacity.attr="swapOpacity ? '' : null"
    ></wa-icon>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { IconProps } from '../../WebAwesome/iconProps';

interface Props extends /* @vue-ignore */ IconProps {
    autoWidth?: boolean;
    swapOpacity?: boolean;
}

defineProps<Props>();

onMounted(async () => {
    await import('#front-awesome-webawesome/components/icon/icon.js');
});
</script>
