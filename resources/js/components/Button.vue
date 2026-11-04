<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(async () => {
    await import('@awesome.me/webawesome/dist/components/button/button.js');
});
</script>

<template>
    <wa-button class="inline-flex"><slot /></wa-button>
</template>
