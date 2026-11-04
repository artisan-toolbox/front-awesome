<template>
    <wa-button class="inline-flex"><slot /></wa-button>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(async () => {
    await import('#front-awesome-webawesome/components/button/button.js');
});
</script>
