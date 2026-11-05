<template>
    <wa-button-group><slot /></wa-button-group>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { ButtonGroupProps } from '../WebAwesome/buttonProps';

interface Props extends /* @vue-ignore */ ButtonGroupProps {}

defineProps<Props>();

onMounted(async () => {
    await import('#front-awesome-webawesome/components/button-group/button-group.js');
});
</script>
