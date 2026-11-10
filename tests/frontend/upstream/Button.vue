<template>
    <div>
        <template v-if="scenario === 'button-1'">
            <Button data-upstream-index="0">Save</Button>
        </template>
        <template v-if="scenario === 'button-2'">
            <Button data-upstream-index="0">
                <Icon data-upstream-index="1" slot="start" name="gear"></Icon>
                Settings
                <Icon data-upstream-index="2" slot="end" name="chevron-right"></Icon>
            </Button>
        </template>
        <template v-if="scenario === 'button-3'">
            <div class="wa-cluster wa-gap-2xs">
                <Button data-upstream-index="0" variant="neutral">Neutral</Button>
                <Button data-upstream-index="1" variant="brand">Brand</Button>
                <Button data-upstream-index="2" variant="success">Success</Button>
                <Button data-upstream-index="3" variant="warning">Warning</Button>
                <Button data-upstream-index="4" variant="danger">Danger</Button>
            </div>
        </template>
        <template v-if="scenario === 'button-4'">
            <div class="wa-stack">
                <div class="wa-cluster wa-gap-2xs">
                    <Button data-upstream-index="0" appearance="accent" variant="neutral"
                        >Accent</Button
                    >
                    <Button data-upstream-index="1" appearance="filled-outlined" variant="neutral"
                        >Filled-Outlined</Button
                    >
                    <Button data-upstream-index="2" appearance="filled" variant="neutral"
                        >Filled</Button
                    >
                    <Button data-upstream-index="3" appearance="outlined" variant="neutral"
                        >Outlined</Button
                    >
                    <Button data-upstream-index="4" appearance="plain" variant="neutral"
                        >Plain</Button
                    >
                </div>
                <div class="wa-cluster wa-gap-2xs">
                    <Button data-upstream-index="5" appearance="accent" variant="brand"
                        >Accent</Button
                    >
                    <Button data-upstream-index="6" appearance="filled-outlined" variant="brand"
                        >Filled-Outlined</Button
                    >
                    <Button data-upstream-index="7" appearance="filled" variant="brand"
                        >Filled</Button
                    >
                    <Button data-upstream-index="8" appearance="outlined" variant="brand"
                        >Outlined</Button
                    >
                    <Button data-upstream-index="9" appearance="plain" variant="brand"
                        >Plain</Button
                    >
                </div>
                <div class="wa-cluster wa-gap-2xs">
                    <Button data-upstream-index="10" appearance="accent" variant="success"
                        >Accent</Button
                    >
                    <Button data-upstream-index="11" appearance="filled-outlined" variant="success"
                        >Filled-Outlined</Button
                    >
                    <Button data-upstream-index="12" appearance="filled" variant="success"
                        >Filled</Button
                    >
                    <Button data-upstream-index="13" appearance="outlined" variant="success"
                        >Outlined</Button
                    >
                    <Button data-upstream-index="14" appearance="plain" variant="success"
                        >Plain</Button
                    >
                </div>
                <div class="wa-cluster wa-gap-2xs">
                    <Button data-upstream-index="15" appearance="accent" variant="warning"
                        >Accent</Button
                    >
                    <Button data-upstream-index="16" appearance="filled-outlined" variant="warning"
                        >Filled-Outlined</Button
                    >
                    <Button data-upstream-index="17" appearance="filled" variant="warning"
                        >Filled</Button
                    >
                    <Button data-upstream-index="18" appearance="outlined" variant="warning"
                        >Outlined</Button
                    >
                    <Button data-upstream-index="19" appearance="plain" variant="warning"
                        >Plain</Button
                    >
                </div>
                <div class="wa-cluster wa-gap-2xs">
                    <Button data-upstream-index="20" appearance="accent" variant="danger"
                        >Accent</Button
                    >
                    <Button data-upstream-index="21" appearance="filled-outlined" variant="danger"
                        >Filled-Outlined</Button
                    >
                    <Button data-upstream-index="22" appearance="filled" variant="danger"
                        >Filled</Button
                    >
                    <Button data-upstream-index="23" appearance="outlined" variant="danger"
                        >Outlined</Button
                    >
                    <Button data-upstream-index="24" appearance="plain" variant="danger"
                        >Plain</Button
                    >
                </div>
            </div>
        </template>
        <template v-if="scenario === 'button-5'">
            <div class="wa-cluster wa-gap-2xs">
                <Button data-upstream-index="0" size="xs">Extra Small</Button>
                <Button data-upstream-index="1" size="s">Small</Button>
                <Button data-upstream-index="2" size="m">Medium</Button>
                <Button data-upstream-index="3" size="l">Large</Button>
                <Button data-upstream-index="4" size="xl">Extra Large</Button>
            </div>
        </template>
        <template v-if="scenario === 'button-6'">
            <Button data-upstream-index="0" pill>Pill Button</Button>
        </template>
        <template v-if="scenario === 'button-7'">
            <div class="wa-cluster wa-gap-2xs">
                <Button data-upstream-index="0" href="https://example.com/">Link</Button>
                <Button data-upstream-index="1" href="https://example.com/" target="_blank"
                    >New Window</Button
                >
                <Button
                    data-upstream-index="2"
                    href="/assets/images/logo.svg"
                    download="shoelace.svg"
                    >Download</Button
                >
            </div>
        </template>
        <template v-if="scenario === 'button-8'">
            <div class="wa-cluster wa-gap-2xs">
                <Button data-upstream-index="0" variant="neutral" appearance="accent"
                    ><Icon data-upstream-index="1" name="house" label="Home"></Icon
                ></Button>
                <Button data-upstream-index="2" variant="neutral" appearance="outlined"
                    ><Icon data-upstream-index="3" name="house" label="Home"></Icon
                ></Button>
                <Button data-upstream-index="4" variant="neutral" appearance="filled"
                    ><Icon data-upstream-index="5" name="house" label="Home"></Icon
                ></Button>
                <Button data-upstream-index="6" variant="neutral" appearance="plain"
                    ><Icon data-upstream-index="7" name="house" label="Home"></Icon
                ></Button>
            </div>
        </template>
        <template v-if="scenario === 'button-9'">
            <div class="wa-cluster wa-gap-2xs">
                <Button data-upstream-index="0">
                    <Icon data-upstream-index="1" slot="start" name="gear"></Icon>
                    Settings
                </Button>

                <Button data-upstream-index="2">
                    <Icon data-upstream-index="3" slot="end" name="undo"></Icon>
                    Refresh
                </Button>

                <Button data-upstream-index="4">
                    <Icon data-upstream-index="5" slot="start" name="link"></Icon>
                    <Icon
                        data-upstream-index="6"
                        slot="end"
                        name="arrow-up-right-from-square"
                    ></Icon>
                    Open
                </Button>
            </div>
        </template>
        <template v-if="scenario === 'button-10'">
            <Button data-upstream-index="0" with-caret>Options</Button>
        </template>
        <template v-if="scenario === 'button-11'">
            <div class="wa-cluster wa-gap-2xs">
                <Button data-upstream-index="0" variant="brand" loading>Brand</Button>
                <Button data-upstream-index="1" variant="success" loading>Success</Button>
                <Button data-upstream-index="2" variant="neutral" loading>Neutral</Button>
                <Button data-upstream-index="3" variant="warning" loading>Warning</Button>
                <Button data-upstream-index="4" variant="danger" loading>Danger</Button>
            </div>
        </template>
        <template v-if="scenario === 'button-12'">
            <div class="wa-stack">
                <div class="wa-cluster wa-gap-2xs">
                    <Button data-upstream-index="0" variant="brand" disabled>Brand</Button>
                    <Button data-upstream-index="1" variant="success" disabled>Success</Button>
                    <Button data-upstream-index="2" variant="neutral" disabled>Neutral</Button>
                    <Button data-upstream-index="3" variant="warning" disabled>Warning</Button>
                    <Button data-upstream-index="4" variant="danger" disabled>Danger</Button>
                </div>

                <div class="wa-cluster wa-gap-2xs">
                    <Button data-upstream-index="5" href="https://example.com/" disabled
                        >Link</Button
                    >
                    <Button
                        data-upstream-index="6"
                        href="https://example.com/"
                        target="_blank"
                        disabled
                        >New Window</Button
                    >
                    <Button
                        data-upstream-index="7"
                        href="/assets/images/logo.svg"
                        download="shoelace.svg"
                        disabled
                        >Download</Button
                    >
                </div>
            </div>
        </template>
        <template v-if="scenario === 'button-13'">
            <Button data-upstream-index="0" style="width: 100%">Save</Button>
        </template>
        <template v-if="scenario === 'button-14'">
            <Button data-upstream-index="0" class="pink">Pink Button</Button>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, Icon } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
