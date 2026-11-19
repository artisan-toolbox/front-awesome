<template>
    <div class="catalog">
        <div class="catalog-search">
            <Input
                :label="text('search')"
                :model-value="query"
                type="search"
                with-clear
                @update:model-value="setQuery"
            />
            <span class="catalog-result-count" role="status">
                {{ text(needle ? 'matching' : 'results', resultCount) }}
            </span>
        </div>

        <div v-if="visibleSections.length" class="catalog-layout">
            <nav
                v-if="visibleSections.length > 1"
                v-scrollbar
                class="catalog-index"
                :aria-label="text('sections')"
            >
                <Button
                    v-for="section in visibleSections"
                    :key="section.key"
                    class="catalog-index-button"
                    type="button"
                    appearance="plain"
                    size="s"
                    :aria-current="selected === section.key ? 'location' : undefined"
                    @click="visitSection(section.key)"
                >
                    <span class="index-label">{{ section.name }}</span>
                </Button>
            </nav>

            <div v-scrollbar ref="list" class="catalog-groups">
                <Accordion mode="multiple" appearance="plain">
                    <AccordionItem
                        v-for="section in visibleSections"
                        :id="sectionId(section.key)"
                        :key="section.key"
                        :expanded="expanded.has(section.key)"
                        @update:expanded="setExpanded(section.key, $event)"
                    >
                        <span slot="label" class="section-heading">
                            <strong class="section-name">{{ section.name }}</strong>
                            <small>{{ text('results', section.abilities.length) }}</small>
                        </span>
                        <template v-if="expanded.has(section.key)">
                            <p v-if="section.description" class="section-description">
                                {{ section.description }}
                            </p>

                            <ul class="abilities">
                                <li
                                    v-for="ability in section.abilities.slice(
                                        0,
                                        limit(section.key),
                                    )"
                                    :key="ability.key"
                                    class="ability"
                                >
                                    <Checkbox
                                        v-if="canUpdate"
                                        :data-ability="ability.key"
                                        :model-value="allowed(ability.key)"
                                        :disabled="busy"
                                        :hint="ability.description"
                                        :failed="errorFor(ability.key)"
                                        @update:model-value="emit('change', ability.key, $event)"
                                    >
                                        {{ ability.name }}
                                    </Checkbox>
                                    <div v-else>
                                        <strong>{{ ability.name }}</strong>
                                        <p v-if="ability.description" class="ability-description">
                                            {{ ability.description }}
                                        </p>
                                    </div>
                                    <span
                                        :class="[
                                            'ability-value',
                                            { 'is-allowed': allowed(ability.key) },
                                        ]"
                                    >
                                        {{ text(allowed(ability.key) ? 'allowed' : 'denied') }}
                                    </span>
                                </li>
                            </ul>

                            <Button
                                v-if="section.abilities.length > limit(section.key)"
                                class="catalog-more"
                                size="s"
                                appearance="outlined"
                                type="button"
                                @click="setLimit(section.key, limit(section.key) + pageSize)"
                            >
                                {{ text('showMore') }}
                            </Button>
                        </template>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
        <div v-else class="catalog-empty" role="status">
            <p>{{ text(needle ? 'noResults' : 'empty') }}</p>
            <Button v-if="needle" appearance="plain" type="button" @click="setQuery('')">
                {{ text('clearSearch') }}
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, shallowRef, useId, useTemplateRef, watch } from 'vue';
import Accordion from '../components/WebAwesome/Accordion.vue';
import AccordionItem from '../components/WebAwesome/AccordionItem.vue';
import Button from '../components/WebAwesome/Button.vue';
import Checkbox from '../components/WebAwesome/Checkbox.vue';
import Input from '../components/WebAwesome/Input.vue';
import { useScrollbarDirective } from '../scrollbar';
import { useEditorText } from './messages';
import { sectionKey } from './protocol';
import type { Section, Values } from './protocol';

const props = defineProps<{
    sections: Section[];
    values: Values;
    changes: ReadonlyMap<string, boolean>;
    canUpdate: boolean;
    busy: boolean;
    errors?: Readonly<Record<string, string>>;
}>();
const emit = defineEmits<{ change: [key: string, allowed: boolean] }>();
const vScrollbar = useScrollbarDirective();
const text = useEditorText();
const query = shallowRef('');
const needle = computed(() => normalize(query.value.trim()));
const selected = shallowRef('');
const expanded = shallowRef<ReadonlySet<string>>(new Set());
const limits = shallowRef<ReadonlyMap<string, number>>(new Map());
const list = useTemplateRef<HTMLDivElement>('list');
const id = useId();
const pageSize = 40;

function normalize(text: string) {
    return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

const index = computed(() =>
    props.sections.map((section) => ({
        key: sectionKey(section),
        section,
        name: normalize(section.name),
        abilities: section.abilities.map((ability) => ({
            ability,
            terms: normalize(`${ability.name} ${ability.description}`),
        })),
    })),
);

const visibleSections = computed(() =>
    index.value.flatMap(({ key, section, name, abilities }) => {
        if (!needle.value || name.includes(needle.value)) return [{ key, ...section }];
        const matches = abilities
            .filter(({ terms }) => terms.includes(needle.value))
            .map(({ ability }) => ability);
        return matches.length ? [{ key, ...section, abilities: matches }] : [];
    }),
);
const resultCount = computed(() =>
    visibleSections.value.reduce((total, section) => total + section.abilities.length, 0),
);

watch(
    [needle, () => props.sections],
    () => {
        const first = visibleSections.value[0]?.key;
        selected.value = first ?? '';
        expanded.value = new Set(first ? [first] : []);
        limits.value = new Map();
        if (list.value) list.value.scrollTop = 0;
    },
    { immediate: true },
);

const sectionPositions = computed(
    () => new Map(index.value.map(({ key }, position) => [key, position])),
);

function sectionId(key: string) {
    return `${id}-section-${sectionPositions.value.get(key)}`;
}

function setQuery(value: unknown) {
    query.value = typeof value === 'string' ? value : '';
}

function allowed(key: string) {
    return props.changes.get(key) ?? props.values[key] === true;
}

function setExpanded(key: string, open: boolean) {
    if (expanded.value.has(key) === open) return;
    const next = new Set(expanded.value);
    if (open) {
        next.add(key);
        selected.value = key;
    } else next.delete(key);
    expanded.value = next;
}

function setLimit(key: string, count: number) {
    limits.value = new Map(limits.value).set(key, count);
}

function limit(key: string) {
    return limits.value.get(key) ?? pageSize;
}

function visitSection(key: string) {
    selected.value = key;
    setExpanded(key, true);
    document.getElementById(sectionId(key))?.scrollIntoView({ block: 'nearest' });
}

function errorFor(key: string) {
    return props.errors && Object.hasOwn(props.errors, key) ? props.errors[key] : undefined;
}

async function focusAbility(key: string) {
    const section = props.sections.find((group) =>
        group.abilities.some((ability) => ability.key === key),
    );
    if (!section) return;
    setQuery('');
    await nextTick();
    const group = sectionKey(section);
    setLimit(
        group,
        Math.max(limit(group), section.abilities.findIndex((ability) => ability.key === key) + 1),
    );
    setExpanded(group, true);
    await nextTick();
    const control = Array.from(
        list.value?.querySelectorAll<HTMLElement>('[data-ability]') ?? [],
    ).find((element) => element.dataset.ability === key);
    control?.focus();
    control?.scrollIntoView({ block: 'nearest' });
}

defineExpose({ focusAbility });
</script>

<style scoped>
.catalog {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-block-size: 0;
}
.catalog-search {
    position: relative;
    z-index: 1;
    padding: var(--wa-space-s) var(--wa-space-l);
    border-block-end: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
.catalog-result-count {
    display: block;
    margin-block-start: var(--wa-space-xs);
    color: var(--wa-color-text-quiet);
    font-size: var(--wa-font-size-s);
}
.catalog-layout {
    display: grid;
    flex: 1;
    min-block-size: 0;
    grid-template-columns: minmax(0, 1fr);
    overflow: hidden;
}
.catalog-index {
    display: none;
    min-inline-size: 0;
    padding: var(--wa-space-s);
    border-inline-end: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    background: var(--wa-color-surface-lowered);
    overflow: auto;
}
.catalog-index-button {
    display: block;
}
.catalog-index-button::part(base) {
    justify-content: flex-start;
    inline-size: 100%;
}
.catalog-index [aria-current='location'] {
    background: var(--wa-color-brand-fill-quiet);
    border-radius: var(--wa-border-radius-s);
}
.index-label {
    display: block;
    white-space: normal;
    overflow-wrap: anywhere;
    text-align: start;
}
.catalog-groups {
    min-inline-size: 0;
    overflow: auto;
    overscroll-behavior: contain;
    padding: var(--wa-space-xs) var(--wa-space-l) var(--wa-space-m);
}
.section-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: var(--wa-space-m);
    row-gap: var(--wa-space-2xs);
}
.section-name,
.ability {
    overflow-wrap: anywhere;
}
.section-heading small,
.section-description,
.ability-description {
    color: var(--wa-color-text-quiet);
}
.section-description,
.ability-description {
    margin-block: 0;
}
.section-description {
    margin-block-end: var(--wa-space-xs);
    font-size: var(--wa-font-size-s);
}
.abilities {
    margin: 0;
    padding: 0;
    list-style: none;
}
.ability {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--wa-space-s);
    align-items: start;
    padding: var(--wa-space-s) 0;
    border-block-end: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
.ability:last-child {
    border-block-end: 0;
}
.ability-value {
    color: var(--wa-color-text-quiet);
    font-size: var(--wa-font-size-s);
}
.ability-value.is-allowed {
    color: var(--wa-color-success-on-quiet);
}
.ability-description {
    font-size: var(--wa-font-size-s);
    margin-block-start: var(--wa-space-2xs);
}
.catalog-more {
    margin-block-start: var(--wa-space-xs);
}
.catalog-empty {
    display: grid;
    align-content: center;
    justify-items: center;
    padding: var(--wa-space-l);
    color: var(--wa-color-text-quiet);
    text-align: center;
}
.catalog-empty p {
    margin-block-end: var(--wa-space-xs);
}
@media (min-width: 48em) {
    .catalog-layout:has(.catalog-index) {
        grid-template-columns: minmax(10em, 1fr) minmax(0, 3fr);
    }
    .catalog-index {
        display: block;
    }
}
</style>
