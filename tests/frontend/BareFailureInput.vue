<template>
    <Input v-model="value" failed hint="Caller hint" />
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { Input } from '@artisan-toolbox/front-awesome/components/WebAwesome';

const value = shallowRef('');
</script>
