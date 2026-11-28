<template>
    <Combobox />
    <Combobox :form="form" field="country" />
    <Combobox :form="form" field="channels" multiple />
    <DateInput :form="form" field="day" />
    <DatePicker :form="form" field="day" />
    <FileInput :form="form" field="attachments" />
    <RichTextEditor
        v-model="articleBody"
        format="markdown"
        default-value="**First draft**"
        :suggestions="[{ trigger: '@', dataSource: () => [{ label: 'Ada' }] }]"
        :image-provider="async (file) => (file ? { src: '/image.png', alt: file.name } : null)"
        :embed-provider="async (input) => ({ src: input, width: 320 })"
        :text-colors="[{ color: 'red', label: 'Red' }]"
        @input="(event) => event.inputType"
        @wa-suggestions-error="(event) => event.detail.request.query"
    />
    <RichTextEditor :form="form" field-name="article.body" />
    <DirectRichTextEditor :value="null" />
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
    <!-- @vue-expect-error RichTextEditor commits strings. -->
    <RichTextEditor :form="form" field="attachments" />
    <!-- @vue-expect-error Only one current value owner is supported. -->
    <RichTextEditor :form="form" field="article.body" value="Another draft" />
    <!-- @vue-expect-error Format is HTML or Markdown. -->
    <RichTextEditor format="plain-text" />
    <!-- @vue-expect-error Suggestion callbacks must return suggestion items. -->
    <RichTextEditor :suggestions="[{ trigger: '@', dataSource: () => ['Ada'] }]" />
    <!-- @vue-expect-error Sort state has id and desc entries. -->
    <DataGrid v-model:sort="page" />
</template>
<script setup lang="ts">
import { shallowRef } from 'vue';
import { useForm } from '@inertiajs/vue3';
import type { OptionGroup } from '@artisan-toolbox/front-awesome';
import DirectRichTextEditor from '@artisan-toolbox/front-awesome/components/RichTextEditor.vue';
import {
    Combobox,
    DateInput,
    DatePicker,
    FileInput,
    DataGrid,
    RichTextEditor,
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
    article: { body: string | null };
    dateOnly: Date;
    attachments: File[];
}
const form = useForm<FormData>({
    city: 1,
    country: 'br',
    channels: ['email'],
    day: '',
    article: { body: '**First draft**' },
    dateOnly: new Date(),
    attachments: [],
});
const page = shallowRef(0);
const articleBody = shallowRef<string | null>('**Draft**');
const sort = shallowRef<{ id: string; desc: boolean }[]>([]);
const playing = shallowRef(false);
const volume = shallowRef(0.5);
</script>
