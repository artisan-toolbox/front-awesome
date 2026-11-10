<template>
    <Combobox />
    <Combobox :form="form" field="country" />
    <Combobox :form="form" field="channels" multiple />
    <DateInput :form="form" field="day" />
    <DatePicker :form="form" field="day" />
    <FileInput :form="form" field="attachments" />
    <DataGrid v-model:page="page" v-model:sort="sort" />
    <Video v-model:playing="playing" v-model:volume="volume" />
    <!-- @vue-expect-error Native file setters cannot compete with an Inertia field. -->
    <FileInput :form="form" field="attachments" :files="[]" />
    <!-- @vue-expect-error Single comboboxes commit scalar strings or null. -->
    <Combobox :form="form" field="channels" />
    <!-- @vue-expect-error File inputs require File arrays. -->
    <FileInput :form="form" field="day" />
    <!-- @vue-expect-error DateInput commits wire strings. -->
    <DateInput :form="form" field="dateOnly" />
    <!-- @vue-expect-error Sort state has id and desc entries. -->
    <DataGrid v-model:sort="page" />
</template>
<script setup lang="ts">
import { shallowRef } from 'vue';
import { useForm } from '@inertiajs/vue3';
import {
    Combobox,
    DateInput,
    DatePicker,
    FileInput,
    DataGrid,
    Video,
} from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
interface FormData {
    country: string | null;
    channels: string[] | null;
    day: string;
    dateOnly: Date;
    attachments: File[];
}
const form = useForm<FormData>({
    country: 'br',
    channels: ['email'],
    day: '',
    dateOnly: new Date(),
    attachments: [],
});
const page = shallowRef(0);
const sort = shallowRef<{ id: string; desc: boolean }[]>([]);
const playing = shallowRef(false);
const volume = shallowRef(0.5);
</script>
