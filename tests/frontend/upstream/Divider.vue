<template>
    <div>
        <template v-if="scenario === 'divider-1'">
            <Divider data-upstream-index="0"></Divider>
        </template>
        <template v-if="scenario === 'divider-2'">
            <Divider data-upstream-index="0">or</Divider>
        </template>
        <template v-if="scenario === 'divider-3'">
            <Divider data-upstream-index="0" style="--width: 4px"></Divider>
        </template>
        <template v-if="scenario === 'divider-4'">
            <Divider
                data-upstream-index="0"
                style="--color: var(--wa-color-brand-fill-loud)"
            ></Divider>
        </template>
        <template v-if="scenario === 'divider-5'">
            <div class="wa-text-center">
                Above
                <Divider data-upstream-index="0" style="--spacing: 2rem"></Divider>
                Below
            </div>
        </template>
        <template v-if="scenario === 'divider-6'">
            <div style="display: flex; align-items: center">
                First
                <Divider data-upstream-index="0" orientation="vertical"></Divider>
                Middle
                <Divider data-upstream-index="1" orientation="vertical"></Divider>
                Last
            </div>
        </template>
        <template v-if="scenario === 'divider-7'">
            <div class="wa-stack" style="max-width: 20rem">
                <Button data-upstream-index="0" appearance="filled" variant="brand">
                    <Icon data-upstream-index="1" slot="start" name="envelope"></Icon>
                    Sign In with Email
                </Button>
                <Divider data-upstream-index="2">or</Divider>
                <Button data-upstream-index="3" appearance="outlined">
                    <Icon data-upstream-index="4" slot="start" name="key"></Icon>
                    Use a Passkey
                </Button>
            </div>
        </template>
        <template v-if="scenario === 'divider-8'">
            <div class="wa-cluster wa-flex-nowrap">
                <Card data-upstream-index="0" class="wa-text-center">
                    <strong>Tabs</strong><br />
                    One keystroke
                </Card>
                <Divider data-upstream-index="1" orientation="vertical">vs</Divider>
                <Card data-upstream-index="2" class="wa-text-center">
                    <strong>Spaces</strong><br />
                    Same everywhere
                </Card>
            </div>
        </template>
        <template v-if="scenario === 'divider-9'">
            <Divider data-upstream-index="0" label-placement="start">Start</Divider>
            <Divider data-upstream-index="1" label-placement="center">Center</Divider>
            <Divider data-upstream-index="2" label-placement="end">End</Divider>
            <Divider data-upstream-index="3" label-placement="start" style="--label-offset: 4rem"
                >Start, offset 4rem</Divider
            >
        </template>
        <template v-if="scenario === 'divider-10'">
            <Divider data-upstream-index="0">Default</Divider>
            <Divider data-upstream-index="1" style="--label-spacing: var(--wa-space-xl)"
                >Custom --label-spacing (xl)</Divider
            >
        </template>
        <template v-if="scenario === 'divider-11'">
            <div class="wa-stack">
                <Divider data-upstream-index="0" class="divider-flourish">
                    <Icon data-upstream-index="1" family="brands" name="web-awesome"></Icon>
                </Divider>

                <Divider data-upstream-index="2" class="divider-flourish divider-nature">
                    <Icon data-upstream-index="3" name="seedling" variant="solid"></Icon>
                    <Icon data-upstream-index="4" name="leaf" variant="solid"></Icon>
                    <Icon data-upstream-index="5" name="tree" variant="solid"></Icon>
                </Divider>

                <Divider data-upstream-index="6" class="divider-flourish" label-placement="start">
                    <Icon data-upstream-index="7" name="quote-left" variant="solid"></Icon>
                </Divider>

                <Divider data-upstream-index="8" class="divider-flourish" label-placement="end">
                    <Icon data-upstream-index="9" name="quote-right" variant="solid"></Icon>
                </Divider>
            </div>
        </template>
        <template v-if="scenario === 'divider-12'">
            <Dropdown data-upstream-index="0" style="max-width: 200px">
                <Button data-upstream-index="1" appearance="filled" slot="trigger" with-caret
                    >Menu</Button
                >
                <DropdownItem data-upstream-index="2" value="1">Option 1</DropdownItem>
                <DropdownItem data-upstream-index="3" value="2">Option 2</DropdownItem>
                <DropdownItem data-upstream-index="4" value="3">Option 3</DropdownItem>
                <Divider data-upstream-index="5"></Divider>
                <DropdownItem data-upstream-index="6" value="4">Option 4</DropdownItem>
                <DropdownItem data-upstream-index="7" value="5">Option 5</DropdownItem>
                <DropdownItem data-upstream-index="8" value="6">Option 6</DropdownItem>
            </Dropdown>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Card,
    Divider,
    Dropdown,
    DropdownItem,
    Icon,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
