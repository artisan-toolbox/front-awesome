<template>
    <Input
        v-model="name"
        disabled
        required
        readonly
        pill
        autofocus
        with-clear
        password-toggle
        password-visible
        without-spin-buttons
        with-label
        with-hint
    />
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import Input from '@artisan-toolbox/front-awesome/components/Input.vue';

const name = shallowRef('Ada');
</script>
