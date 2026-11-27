<template>
    <form>
        <button type="button">Before</button>
        <Select
            :form="form"
            field="destination"
            name="destination"
            label="Destination"
            :options="rows"
            option-value="id"
            option-label="name"
            default-value="3"
            with-clear
            :strict-search="strict"
        >
            <template #option="{ value, label, option }">
                <span :data-option-id="value">{{ label }}</span>
                <span slot="end" aria-hidden="true">{{ option.code }}</span>
            </template>
        </Select>
        <button type="button">After</button>
        <output>{{ JSON.stringify(form.destination) }}</output>
    </form>
    <Select
        v-model="destinations"
        label="Destinations"
        :options="rows"
        option-value="id"
        option-label="name"
        multiple
    />
    <button type="button" @click="destinations = [2, 3]">Update destinations</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { Select } from '@artisan-toolbox/front-awesome/components/WebAwesome';

defineProps<{ strict?: boolean }>();
const form = useForm<{ destination: number | null }>({ destination: 3 });
const destinations = ref<number[] | null>([1]);
const rows = [
    { id: 0, name: 'Café indisponível', code: 'X', disabled: true },
    { id: 1, name: 'Café com leite', code: 'A' },
    { id: 2, name: 'Cafezinho', code: 'B' },
    { id: 3, name: 'Chá', code: 'C' },
];
</script>
