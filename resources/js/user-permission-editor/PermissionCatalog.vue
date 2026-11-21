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
            <span v-if="needle && resultCount" class="catalog-result-count" role="status">
                {{ text('matching', resultCount) }}
            </span>
        </div>

        <div v-if="categories.length" class="catalog-layout">
            <nav
                v-if="visibleSections.length > 1"
                v-scrollbar
                class="catalog-index"
                :aria-label="text('sections')"
            >
                <div v-for="category in categories" :key="category.kind" class="index-category">
                    <p>{{ text(category.title) }}</p>
                    <ul>
                        <li v-for="section in category.sections" :key="section.key">
                            <Button
                                class="catalog-index-button"
                                type="button"
                                appearance="plain"
                                size="s"
                                :aria-controls="sectionId(section.key)"
                                :aria-current="selected === section.key ? 'location' : undefined"
                                @click="visitSection(section.key)"
                            >
                                <Icon
                                    v-if="section.icon && iconFamily"
                                    slot="start"
                                    :name="section.icon"
                                    :family="iconFamily"
                                    aria-hidden="true"
                                />
                                <span class="index-label">{{ section.name }}</span>
                            </Button>
                        </li>
                    </ul>
                </div>
            </nav>

            <div v-scrollbar ref="list" class="catalog-groups">
                <section
                    v-for="category in categories"
                    :key="category.kind"
                    :aria-labelledby="`${id}-${category.kind}`"
                    class="catalog-category"
                >
                    <h2 :id="`${id}-${category.kind}`">{{ text(category.title) }}</h2>
                    <Accordion mode="multiple" appearance="plain">
                        <AccordionItem
                            v-for="section in category.sections"
                            :id="sectionId(section.key)"
                            :key="section.key"
                            class="catalog-section"
                            :expanded="expanded.has(section.key)"
                            @update:expanded="setExpanded(section.key, $event)"
                        >
                            <span slot="label" class="section-heading">
                                <strong class="section-name">
                                    <Icon
                                        v-if="section.icon && iconFamily"
                                        :name="section.icon"
                                        :family="iconFamily"
                                        aria-hidden="true"
                                    />
                                    {{ section.name }}
                                </strong>
                                <small>{{ section.summary }}</small>
                            </span>
                            <template v-if="expanded.has(section.key)">
                                <p v-if="section.description" class="section-description">
                                    {{ section.description }}
                                </p>

                                <ul class="abilities">
                                    <li
                                        v-for="(ability, abilityIndex) in section.abilities.slice(
                                            0,
                                            limit(section.key),
                                        )"
                                        :key="ability.key"
                                    >
                                        <component
                                            :is="canUpdate ? 'label' : 'div'"
                                            class="ability"
                                            :class="{ 'is-allowed': allowed(ability.key) }"
                                        >
                                            <input
                                                v-if="canUpdate"
                                                type="checkbox"
                                                class="wa-visually-hidden-force"
                                                :data-ability="ability.key"
                                                :checked="allowed(ability.key)"
                                                :disabled="busy"
                                                :aria-label="ability.name"
                                                :aria-describedby="`${sectionId(section.key)}-hint-${abilityIndex}`"
                                                :aria-invalid="
                                                    errorFor(ability.key) ? true : undefined
                                                "
                                                @change="changeAbility(ability.key, $event)"
                                            />
                                            <Icon
                                                v-if="ability.icon && iconFamily"
                                                class="ability-icon"
                                                :name="ability.icon"
                                                :family="iconFamily"
                                                aria-hidden="true"
                                            />
                                            <span class="ability-copy">
                                                <strong class="ability-name">{{
                                                    ability.name
                                                }}</strong>
                                                <span
                                                    :id="`${sectionId(section.key)}-hint-${abilityIndex}`"
                                                >
                                                    <span
                                                        v-if="ability.description"
                                                        class="ability-description"
                                                    >
                                                        {{ ability.description }}
                                                    </span>
                                                    <span
                                                        v-if="errorFor(ability.key)"
                                                        class="ability-error"
                                                    >
                                                        {{ errorFor(ability.key) }}
                                                    </span>
                                                </span>
                                            </span>
                                            <span
                                                class="ability-value"
                                                :aria-hidden="canUpdate || undefined"
                                            >
                                                <Icon
                                                    library="system"
                                                    :name="allowed(ability.key) ? 'check' : 'xmark'"
                                                    aria-hidden="true"
                                                />
                                                {{
                                                    text(
                                                        allowed(ability.key)
                                                            ? category.on
                                                            : category.off,
                                                    )
                                                }}
                                            </span>
                                        </component>
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
                </section>
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
import Icon from '../components/WebAwesome/Icon.vue';
import Input from '../components/WebAwesome/Input.vue';
import { useScrollbarDirective } from '../scrollbar';
import { useEditorText } from './messages';
import { sectionKey } from './protocol';
import type { Section, Values } from './protocol';

const props = defineProps<{
    sections: Section[];
    iconFamily?: string;
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
const categoryLabels = [
    {
        kind: 'permissions',
        title: 'permissionGroups',
        summary: 'permissionSummary',
        on: 'allowed',
        off: 'denied',
    },
    {
        kind: 'roles',
        title: 'roleAssignments',
        summary: 'roleSummary',
        on: 'assigned',
        off: 'unassigned',
    },
] as const;

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
const categories = computed(() =>
    categoryLabels.flatMap((category) => {
        const sections = visibleSections.value
            .filter(({ kind }) => kind === category.kind)
            .map((section) => ({
                ...section,
                summary: text(category.summary, {
                    enabled: section.abilities.filter(({ key }) => allowed(key)).length,
                    total: section.abilities.length,
                }),
            }));
        return sections.length ? [{ ...category, sections }] : [];
    }),
);

const resultCount = computed(() =>
    visibleSections.value.reduce((total, section) => total + section.abilities.length, 0),
);

watch(
    [needle, () => props.sections],
    () => {
        const first = categories.value[0]?.sections[0]?.key;
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

function changeAbility(key: string, event: Event): void {
    if (event.currentTarget instanceof HTMLInputElement) {
        emit('change', key, event.currentTarget.checked);
    }
}

function setExpanded(key: string, open: boolean) {
    if (expanded.value.has(key) === open) return;
    const next = new Set(expanded.value);
    if (open) {
        next.add(key);
        selected.value = key;
    } else {
        next.delete(key);
        if (selected.value === key) selected.value = Array.from(next).at(-1) ?? '';
    }
    expanded.value = next;
}

function setLimit(key: string, count: number) {
    limits.value = new Map(limits.value).set(key, count);
}

function limit(key: string) {
    return limits.value.get(key) ?? pageSize;
}

async function visitSection(key: string) {
    selected.value = key;
    expanded.value = new Set([key]);
    await nextTick();

    const container = list.value;
    if (!container) return;
    const items = Array.from(container.querySelectorAll('wa-accordion-item'));
    const item = items.find((element) => element.id === sectionId(key));
    if (!item) return;
    await Promise.all(items.map((element) => element.updateComplete));
    if (selected.value !== key) return;

    item.focus({ preventScroll: true });
    container.scrollTop += item.getBoundingClientRect().top - container.getBoundingClientRect().top;
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
.index-category + .index-category {
    margin-block-start: var(--wa-space-m);
    padding-block-start: var(--wa-space-s);
    border-block-start: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
.index-category p {
    margin: 0;
    padding: var(--wa-space-2xs) var(--wa-space-s);
    color: var(--wa-color-text-quiet);
    font-size: var(--wa-font-size-s);
    font-weight: var(--wa-font-weight-semibold);
}
.index-category ul,
.abilities {
    margin: 0;
    padding: 0;
    list-style: none;
}
.catalog-index-button {
    display: block;
    inline-size: 100%;
}
.catalog-index-button::part(base) {
    justify-content: flex-start;
    inline-size: 100%;
    min-block-size: 2.5rem;
}
.catalog-index [aria-current='location'] {
    background: var(--wa-color-brand-fill-quiet);
    border-radius: var(--wa-border-radius-s);
    color: var(--wa-color-brand-on-quiet);
    font-weight: var(--wa-font-weight-semibold);
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
    padding: var(--wa-space-s) var(--wa-space-l) var(--wa-space-m);
}
.catalog-category + .catalog-category {
    margin-block-start: var(--wa-space-l);
}
.catalog-category h2 {
    margin: 0 0 var(--wa-space-xs);
    color: var(--wa-color-text-quiet);
    font-size: var(--wa-font-size-s);
    font-weight: var(--wa-font-weight-semibold);
}
.catalog-category wa-accordion {
    border: 0;
    overflow: visible;
}
.catalog-section {
    --spacing: var(--wa-space-s);
    --show-duration: 0ms;
    --hide-duration: 0ms;
    margin-block-end: var(--wa-space-xs);
    border: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    border-radius: var(--wa-border-radius-m);
}
.catalog-section::part(button) {
    min-block-size: 2.75rem;
    border-radius: var(--wa-border-radius-m);
}
.catalog-section[expanded]::part(button) {
    background: var(--wa-color-surface-lowered);
    border-end-start-radius: 0;
    border-end-end-radius: 0;
}
.catalog-section[expanded]::part(content) {
    border-block-start: var(--wa-border-width-s) solid var(--wa-color-surface-border);
}
.section-heading {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--wa-space-2xs) var(--wa-space-m);
    text-align: start;
}
.section-name,
.ability {
    overflow-wrap: anywhere;
}
.ability-name {
    color: var(--wa-color-text-normal);
}
.section-name wa-icon {
    margin-inline-end: var(--wa-space-2xs);
    color: var(--wa-color-text-quiet);
}
.section-heading small,
.section-description,
.ability-description {
    color: var(--wa-color-text-quiet);
}
.section-heading small {
    white-space: nowrap;
    font-size: var(--wa-font-size-s);
    font-weight: var(--wa-font-weight-normal);
}
.section-description,
.ability-description {
    margin: 0;
    font-size: var(--wa-font-size-s);
}
.section-description {
    margin-block-end: var(--wa-space-s);
}
.abilities {
    display: grid;
    gap: var(--wa-space-2xs);
}
.ability {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--wa-space-s);
    min-block-size: 2.75rem;
    padding: var(--wa-space-s);
    border: var(--wa-border-width-s) solid var(--wa-color-surface-border);
    border-radius: var(--wa-border-radius-m);
    background: var(--wa-color-surface-default);
}
label.ability {
    cursor: pointer;
}
label.ability:hover {
    border-color: var(--wa-color-neutral-border-normal);
}
.ability.is-allowed {
    border-color: var(--wa-color-brand-border-normal);
    background: var(--wa-color-brand-fill-quiet);
}
label.ability.is-allowed:hover {
    border-color: var(--wa-color-brand-border-loud);
}
.ability:has(input:focus-visible) {
    outline: var(--wa-focus-ring);
    outline-offset: var(--wa-focus-ring-offset);
}
.ability:has(input:disabled) {
    cursor: default;
    opacity: 0.5;
}
.ability-icon {
    flex: none;
    color: var(--wa-color-text-quiet);
    font-size: var(--wa-font-size-l);
}
.is-allowed .ability-icon,
.is-allowed .ability-name {
    color: var(--wa-color-brand-on-quiet);
}
.ability-copy {
    flex: 1;
    min-inline-size: 0;
}
.ability-description,
.ability-error {
    display: block;
    margin-block-start: var(--wa-space-3xs);
    font-size: var(--wa-font-size-s);
}
.ability-error {
    color: var(--wa-color-danger-on-quiet);
}
.ability-value {
    display: inline-flex;
    align-items: center;
    gap: var(--wa-space-2xs);
    max-inline-size: 45%;
    padding: var(--wa-space-3xs) var(--wa-space-xs);
    border-radius: var(--wa-border-radius-pill);
    background: var(--wa-color-neutral-fill-quiet);
    color: var(--wa-color-neutral-on-quiet);
    font-size: var(--wa-font-size-xs);
    font-weight: var(--wa-font-weight-semibold);
    line-height: 1.5;
}
.is-allowed .ability-value {
    background: var(--wa-color-brand-fill-loud);
    color: var(--wa-color-brand-on-loud);
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
