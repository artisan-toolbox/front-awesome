<template>
    <div>
        <template v-if="scenario === 'callout-1'">
            <Callout data-upstream-index="0">
                <Icon data-upstream-index="1" slot="icon" name="circle-info"></Icon>
                This is a standard callout. You can customize its content and even the icon.
            </Callout>
        </template>
        <template v-if="scenario === 'callout-2'">
            <div class="wa-stack">
                <Callout data-upstream-index="0" variant="brand">
                    <Icon data-upstream-index="1" slot="icon" name="circle-info"></Icon>
                    <strong>A new theme is available</strong><br />
                    Try it from Settings whenever you're ready.
                </Callout>

                <Callout data-upstream-index="2" variant="success">
                    <Icon data-upstream-index="3" slot="icon" name="circle-check"></Icon>
                    <strong>Your changes have been saved</strong><br />
                    You can safely close this tab now.
                </Callout>

                <Callout data-upstream-index="4" variant="neutral">
                    <Icon data-upstream-index="5" slot="icon" name="gear"></Icon>
                    <strong>Your settings have been updated</strong><br />
                    Changes take effect on your next login.
                </Callout>

                <Callout data-upstream-index="6" variant="warning">
                    <Icon data-upstream-index="7" slot="icon" name="triangle-exclamation"></Icon>
                    <strong>Your session is about to expire</strong><br />
                    Save your work to avoid losing it.
                </Callout>

                <Callout data-upstream-index="8" variant="danger">
                    <Icon data-upstream-index="9" slot="icon" name="circle-exclamation"></Icon>
                    <strong>This action can't be undone</strong><br />
                    Deleting a project removes it for everyone on the team.
                </Callout>
            </div>
        </template>
        <template v-if="scenario === 'callout-3'">
            <div class="wa-stack">
                <Callout data-upstream-index="0" variant="brand" appearance="accent">
                    <Icon data-upstream-index="1" slot="icon" name="square-check"></Icon>
                    This <strong>accent</strong> callout draws the most attention.
                </Callout>

                <Callout data-upstream-index="2" variant="brand" appearance="filled-outlined">
                    <Icon data-upstream-index="3" slot="icon" name="fill-drip"></Icon>
                    This callout is both <strong>filled</strong> and <strong>outlined</strong>.
                </Callout>

                <Callout data-upstream-index="4" variant="brand" appearance="filled">
                    <Icon data-upstream-index="5" slot="icon" name="fill"></Icon>
                    This callout is only <strong>filled</strong>.
                </Callout>

                <Callout data-upstream-index="6" variant="brand" appearance="outlined">
                    <Icon data-upstream-index="7" slot="icon" name="lines-leaning"></Icon>
                    Here's an <strong>outlined</strong> callout.
                </Callout>

                <Callout data-upstream-index="8" variant="brand" appearance="plain">
                    <Icon data-upstream-index="9" slot="icon" name="font"></Icon>
                    No fill or border on this <strong>plain</strong> callout.
                </Callout>
            </div>
        </template>
        <template v-if="scenario === 'callout-4'">
            <div class="wa-stack">
                <Callout data-upstream-index="0" size="xs">
                    <Icon data-upstream-index="1" slot="icon" name="circle-info"></Icon>
                    Extra-small callout for minimal emphasis.
                </Callout>

                <Callout data-upstream-index="2" size="s">
                    <Icon data-upstream-index="3" slot="icon" name="circle-info"></Icon>
                    Small callout for a bit of emphasis.
                </Callout>

                <Callout data-upstream-index="4" size="m">
                    <Icon data-upstream-index="5" slot="icon" name="circle-info"></Icon>
                    Medium callout, the default size.
                </Callout>

                <Callout data-upstream-index="6" size="l">
                    <Icon data-upstream-index="7" slot="icon" name="circle-info"></Icon>
                    Large callout for more emphasis.
                </Callout>

                <Callout data-upstream-index="8" size="xl">
                    <Icon data-upstream-index="9" slot="icon" name="circle-info"></Icon>
                    Extra-large callout for maximum emphasis.
                </Callout>
            </div>
        </template>
        <template v-if="scenario === 'callout-5'">
            <Callout data-upstream-index="0" variant="brand"
                >All times are shown in your local timezone.</Callout
            >
        </template>
        <template v-if="scenario === 'callout-6'">
            <Callout
                data-upstream-index="0"
                variant="brand"
                style="
                    background: var(--wa-color-brand-fill-quiet);
                    border-radius: var(--wa-border-radius-pill);
                    border-style: dashed;
                "
            >
                <Icon data-upstream-index="1" slot="icon" name="wand-magic-sparkles"></Icon>
                A pinch of CSS goes a long way.
            </Callout>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Callout, Icon } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
