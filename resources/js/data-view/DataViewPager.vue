<template>
    <DataViewNavigation :adapter="adapter" :size="size" with-settings />
</template>
<script setup lang="ts">
import DataViewNavigation from './DataViewNavigation.vue';
import type { DataViewHandle, DataViewSize } from './types';
withDefaults(defineProps<{ adapter: DataViewHandle; size?: DataViewSize }>(), { size: 'm' });
</script>
