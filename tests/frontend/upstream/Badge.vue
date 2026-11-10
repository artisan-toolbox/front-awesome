<template>
    <div>
        <template v-if="scenario === 'badge-1'">
            <Badge data-upstream-index="0">New</Badge>
        </template>
        <template v-if="scenario === 'badge-2'">
            <Badge data-upstream-index="0" variant="brand">
                <Icon data-upstream-index="1" slot="start" name="star"></Icon>
                Featured
                <Icon data-upstream-index="2" slot="end" name="arrow-right"></Icon>
            </Badge>
        </template>
        <template v-if="scenario === 'badge-3'">
            <Badge data-upstream-index="0" variant="brand">Brand</Badge>
            <Badge data-upstream-index="1" variant="success">Success</Badge>
            <Badge data-upstream-index="2" variant="neutral">Neutral</Badge>
            <Badge data-upstream-index="3" variant="warning">Warning</Badge>
            <Badge data-upstream-index="4" variant="danger">Danger</Badge>
        </template>
        <template v-if="scenario === 'badge-4'">
            <div style="margin-block-end: 1rem">
                <Badge data-upstream-index="0" appearance="accent" variant="neutral">Accent</Badge>
                <Badge data-upstream-index="1" appearance="filled-outlined" variant="neutral"
                    >Filled-Outlined</Badge
                >
                <Badge data-upstream-index="2" appearance="filled" variant="neutral">Filled</Badge>
                <Badge data-upstream-index="3" appearance="outlined" variant="neutral"
                    >Outlined</Badge
                >
            </div>
            <div style="margin-block-end: 1rem">
                <Badge data-upstream-index="4" appearance="accent" variant="brand">Accent</Badge>
                <Badge data-upstream-index="5" appearance="filled-outlined" variant="brand"
                    >Filled-Outlined</Badge
                >
                <Badge data-upstream-index="6" appearance="filled" variant="brand">Filled</Badge>
                <Badge data-upstream-index="7" appearance="outlined" variant="brand"
                    >Outlined</Badge
                >
            </div>
            <div style="margin-block-end: 1rem">
                <Badge data-upstream-index="8" appearance="accent" variant="success">Accent</Badge>
                <Badge data-upstream-index="9" appearance="filled-outlined" variant="success"
                    >Filled-Outlined</Badge
                >
                <Badge data-upstream-index="10" appearance="filled" variant="success">Filled</Badge>
                <Badge data-upstream-index="11" appearance="outlined" variant="success"
                    >Outlined</Badge
                >
            </div>
            <div style="margin-block-end: 1rem">
                <Badge data-upstream-index="12" appearance="accent" variant="warning">Accent</Badge>
                <Badge data-upstream-index="13" appearance="filled-outlined" variant="warning"
                    >Filled-Outlined</Badge
                >
                <Badge data-upstream-index="14" appearance="filled" variant="warning">Filled</Badge>
                <Badge data-upstream-index="15" appearance="outlined" variant="warning"
                    >Outlined</Badge
                >
            </div>
            <div>
                <Badge data-upstream-index="16" appearance="accent" variant="danger">Accent</Badge>
                <Badge data-upstream-index="17" appearance="filled-outlined" variant="danger"
                    >Filled-Outlined</Badge
                >
                <Badge data-upstream-index="18" appearance="filled" variant="danger">Filled</Badge>
                <Badge data-upstream-index="19" appearance="outlined" variant="danger"
                    >Outlined</Badge
                >
            </div>
        </template>
        <template v-if="scenario === 'badge-5'">
            <Badge data-upstream-index="0" variant="brand" style="font-size: var(--wa-font-size-xs)"
                >Extra Small</Badge
            >
            <Badge data-upstream-index="1" variant="brand" style="font-size: var(--wa-font-size-s)"
                >Small</Badge
            >
            <Badge data-upstream-index="2" variant="brand" style="font-size: var(--wa-font-size-m)"
                >Medium</Badge
            >
            <Badge data-upstream-index="3" variant="brand" style="font-size: var(--wa-font-size-l)"
                >Large</Badge
            >
            <Badge data-upstream-index="4" variant="brand" style="font-size: var(--wa-font-size-xl)"
                >Extra Large</Badge
            >
        </template>
        <template v-if="scenario === 'badge-6'">
            <Badge data-upstream-index="0" variant="brand" pill>Brand</Badge>
            <Badge data-upstream-index="1" variant="success" pill>Success</Badge>
            <Badge data-upstream-index="2" variant="neutral" pill>Neutral</Badge>
            <Badge data-upstream-index="3" variant="warning" pill>Warning</Badge>
            <Badge data-upstream-index="4" variant="danger" pill>Danger</Badge>
        </template>
        <template v-if="scenario === 'badge-7'">
            <div class="badge-attention">
                <Badge data-upstream-index="0" variant="brand" attention="pulse" pill>1</Badge>
                <Badge data-upstream-index="1" variant="success" attention="pulse" pill>1</Badge>
                <Badge data-upstream-index="2" variant="neutral" attention="pulse" pill>1</Badge>
                <Badge data-upstream-index="3" variant="warning" attention="pulse" pill>1</Badge>
                <Badge data-upstream-index="4" variant="danger" attention="pulse" pill>1</Badge>
            </div>

            <div class="badge-attention">
                <Badge data-upstream-index="5" variant="brand" attention="bounce" pill>1</Badge>
                <Badge data-upstream-index="6" variant="success" attention="bounce" pill>1</Badge>
                <Badge data-upstream-index="7" variant="neutral" attention="bounce" pill>1</Badge>
                <Badge data-upstream-index="8" variant="warning" attention="bounce" pill>1</Badge>
                <Badge data-upstream-index="9" variant="danger" attention="bounce" pill>1</Badge>
            </div>
        </template>
        <template v-if="scenario === 'badge-8'">
            <Badge
                data-upstream-index="0"
                variant="neutral"
                attention="pulse"
                pill
                style="--pulse-color: var(--wa-color-brand-fill-loud)"
                >1</Badge
            >
        </template>
        <template v-if="scenario === 'badge-9'">
            <Badge data-upstream-index="0">
                <Icon data-upstream-index="1" slot="start" name="seedling"></Icon>
                Start
            </Badge>
            <Badge data-upstream-index="2">
                <Icon data-upstream-index="3" slot="end" name="tree"></Icon>
                End
            </Badge>
            <Badge data-upstream-index="4">
                <Icon data-upstream-index="5" slot="start" name="cow"></Icon>
                <Icon data-upstream-index="6" slot="end" name="meteor"></Icon>
                Both
            </Badge>
        </template>
        <template v-if="scenario === 'badge-10'">
            <Button data-upstream-index="0" appearance="filled">
                Requests
                <Badge data-upstream-index="1" pill>30</Badge>
            </Button>

            <Button data-upstream-index="2" appearance="filled" style="margin-inline-start: 1rem">
                Warnings
                <Badge data-upstream-index="3" variant="warning" pill>8</Badge>
            </Button>

            <Button data-upstream-index="4" appearance="filled" style="margin-inline-start: 1rem">
                Errors
                <Badge data-upstream-index="5" variant="danger" pill>6</Badge>
            </Button>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Badge, Button, Icon } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
