<template>
    <wa-button class="inline-flex"><slot /></wa-button>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { ButtonProps } from '../WebAwesome/buttonProps';

interface Props extends /* @vue-ignore */ ButtonProps {}

defineProps<Props>();

onMounted(async () => {
    await import('#front-awesome-webawesome/components/button/button.js');
});
</script>
