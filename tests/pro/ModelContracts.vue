<template>
    <Combobox />
    <Combobox :form="form" field="country" />
    <Combobox :form="form" field="channels" multiple />
    <DateInput :form="form" field="day" />
    <DatePicker :form="form" field="day" />
    <FileInput :form="form" field="attachments" />
    <DataGrid v-model:page="page" v-model:sort="sort" />
    <Video v-model:playing="playing" v-model:volume="volume" />
    <Combobox grouped :options="cities" option-value="id" option-label="name" v-model="city">
        <template #option="{ value, option }">{{ value.toFixed() }} {{ option.name }}</template>
    </Combobox>
    <Combobox grouped :options="cities" option-value="id" :form="form" field="city" />
    <!-- @vue-expect-error Grouped mode requires group objects. -->
    <Combobox grouped :options="['Vue']" />
    <!-- @vue-expect-error Groups require an options array. -->
    <Combobox grouped :options="[{ label: 'Cities' }]" />
    <!-- @vue-expect-error The grouped flag is boolean. -->
    <Combobox grouped="true" :options="cities" />
    <!-- @vue-expect-error A grouped numeric ID cannot be bound to a string field. -->
    <Combobox grouped :options="cities" option-value="id" :form="form" field="country" />
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
import type { OptionGroup } from '@artisan-toolbox/front-awesome';
import {
    Combobox,
    DateInput,
    DatePicker,
    FileInput,
    DataGrid,
    Video,
} from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
const city = shallowRef<number | null>(1);
const cities: OptionGroup<{ id?: number; name: string }>[] = [
    { label: 'Northeast', options: [{ id: 1, name: 'Recife' }] },
];
interface FormData {
    city: number | null;
    country: string | null;
    channels: string[] | null;
    day: string;
    dateOnly: Date;
    attachments: File[];
}
const form = useForm<FormData>({
    city: 1,
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
