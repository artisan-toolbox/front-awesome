<template>
    <div>
        <template v-if="scenario === 'tag-1'">
            <Tag data-upstream-index="0">Featured</Tag>
        </template>
        <template v-if="scenario === 'tag-2'">
            <Tag data-upstream-index="0"
                ><Icon data-upstream-index="1" name="star"></Icon> Featured</Tag
            >
        </template>
        <template v-if="scenario === 'tag-3'">
            <Tag data-upstream-index="0" variant="brand">Brand</Tag>
            <Tag data-upstream-index="1" variant="success">Success</Tag>
            <Tag data-upstream-index="2" variant="neutral">Neutral</Tag>
            <Tag data-upstream-index="3" variant="warning">Warning</Tag>
            <Tag data-upstream-index="4" variant="danger">Danger</Tag>
        </template>
        <template v-if="scenario === 'tag-4'">
            <div class="wa-stack">
                <p>
                    <Tag data-upstream-index="0" variant="brand" appearance="accent">Accent</Tag>
                    <Tag data-upstream-index="1" variant="brand" appearance="filled-outlined"
                        >Filled-Outlined</Tag
                    >
                    <Tag data-upstream-index="2" variant="brand" appearance="filled">Filled</Tag>
                    <Tag data-upstream-index="3" variant="brand" appearance="outlined"
                        >Outlined</Tag
                    >
                </p>
                <p>
                    <Tag data-upstream-index="4" variant="success" appearance="accent">Accent</Tag>
                    <Tag data-upstream-index="5" variant="success" appearance="filled-outlined"
                        >Filled-Outlined</Tag
                    >
                    <Tag data-upstream-index="6" variant="success" appearance="filled">Filled</Tag>
                    <Tag data-upstream-index="7" variant="success" appearance="outlined"
                        >Outlined</Tag
                    >
                </p>
                <p>
                    <Tag data-upstream-index="8" variant="neutral" appearance="accent">Accent</Tag>
                    <Tag data-upstream-index="9" variant="neutral" appearance="filled-outlined"
                        >Filled-Outlined</Tag
                    >
                    <Tag data-upstream-index="10" variant="neutral" appearance="filled">Filled</Tag>
                    <Tag data-upstream-index="11" variant="neutral" appearance="outlined"
                        >Outlined</Tag
                    >
                </p>
                <p>
                    <Tag data-upstream-index="12" variant="warning" appearance="accent">Accent</Tag>
                    <Tag data-upstream-index="13" variant="warning" appearance="filled-outlined"
                        >Filled-Outlined</Tag
                    >
                    <Tag data-upstream-index="14" variant="warning" appearance="filled">Filled</Tag>
                    <Tag data-upstream-index="15" variant="warning" appearance="outlined"
                        >Outlined</Tag
                    >
                </p>
                <p>
                    <Tag data-upstream-index="16" variant="danger" appearance="accent">Accent</Tag>
                    <Tag data-upstream-index="17" variant="danger" appearance="filled-outlined"
                        >Filled-Outlined</Tag
                    >
                    <Tag data-upstream-index="18" variant="danger" appearance="filled">Filled</Tag>
                    <Tag data-upstream-index="19" variant="danger" appearance="outlined"
                        >Outlined</Tag
                    >
                </p>
            </div>
        </template>
        <template v-if="scenario === 'tag-5'">
            <Tag data-upstream-index="0" size="xs">Extra Small</Tag>
            <Tag data-upstream-index="1" size="s">Small</Tag>
            <Tag data-upstream-index="2" size="m">Medium</Tag>
            <Tag data-upstream-index="3" size="l">Large</Tag>
            <Tag data-upstream-index="4" size="xl">Extra Large</Tag>
        </template>
        <template v-if="scenario === 'tag-6'">
            <Tag data-upstream-index="0" size="xs" pill>Extra Small</Tag>
            <Tag data-upstream-index="1" size="s" pill>Small</Tag>
            <Tag data-upstream-index="2" size="m" pill>Medium</Tag>
            <Tag data-upstream-index="3" size="l" pill>Large</Tag>
            <Tag data-upstream-index="4" size="xl" pill>Extra Large</Tag>
        </template>
        <template v-if="scenario === 'tag-7'">
            <div class="tags-removable">
                <Tag data-upstream-index="0" size="xs" with-remove>Extra Small</Tag>
                <Tag data-upstream-index="1" size="s" with-remove>Small</Tag>
                <Tag data-upstream-index="2" size="m" with-remove>Medium</Tag>
                <Tag data-upstream-index="3" size="l" with-remove>Large</Tag>
                <Tag data-upstream-index="4" size="xl" with-remove>Extra Large</Tag>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Icon, Tag } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
