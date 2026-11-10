<template>
    <Checkbox />
    <Checkbox checked />
    <Textarea value="Native input" />
    <Checkbox v-model="accepted" />
    <Checkbox :form="form" field="accepted" />
    <Textarea :form="form" field="notes" />
    <NumberInput :form="form" field-name="quantity" />
    <Select :form="form" field="country" />
    <Select :form="form" field="channels" multiple />
    <KnownDate :form="form" field="day" />
    <Pagination v-model:page="page" />
    <Dialog v-model:open="open" />
    <Select v-model="country" v-model:open="open" />
    <Select v-model="channels" multiple />
    <!-- @vue-expect-error Current native aliases cannot compete with a Vue model. -->
    <Checkbox v-model="accepted" :checked="false" />
    <!-- @vue-expect-error Current native aliases cannot compete with an Inertia field. -->
    <Textarea :form="form" field="notes" value="Conflict" />
    <!-- @vue-expect-error Checkbox fields must be boolean. -->
    <Checkbox :form="form" field="notes" />
    <!-- @vue-expect-error Numeric text fields do not accept number-only leaves. -->
    <NumberInput :form="form" field="count" />
    <!-- @vue-expect-error Native date commits wire strings, not Date objects. -->
    <KnownDate :form="form" field="dateOnly" />
    <!-- @vue-expect-error Single selects do not commit arrays. -->
    <Select :form="form" field="channels" />
    <!-- @vue-expect-error Multiple selects do not commit scalar strings. -->
    <Select :form="form" field="country" multiple />
    <!-- @vue-expect-error Native page state is numeric. -->
    <Pagination v-model:page="notes" />
    <!-- @vue-expect-error Native open state is boolean. -->
    <Dialog v-model:open="notes" />
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { useForm } from '@inertiajs/vue3';
import {
    Checkbox,
    Textarea,
    NumberInput,
    Select,
    KnownDate,
    Pagination,
    Dialog,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
const accepted = shallowRef(false);
const page = shallowRef(1);
const open = shallowRef(false);
const notes = shallowRef('');
const country = shallowRef<string | null>('br');
const channels = shallowRef<string[] | null>(['email']);
interface FormData {
    accepted: boolean;
    notes: string | null;
    quantity: string | null;
    country: string | null;
    channels: string[] | null;
    day: string;
    dateOnly: Date;
    count: number;
}
const form = useForm<FormData>({
    accepted: false,
    notes: '',
    quantity: '2',
    country: 'br',
    channels: ['email'],
    day: '',
    dateOnly: new Date(),
    count: 1,
});
</script>
