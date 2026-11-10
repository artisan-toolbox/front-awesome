<template>
    <div>
        <template v-if="scenario === 'radio-group-1'">
            <RadioGroup data-upstream-index="0" label="Coffee roast" name="roast" value="medium">
                <Radio data-upstream-index="1" value="light">Light roast</Radio>
                <Radio data-upstream-index="2" value="medium">Medium roast</Radio>
                <Radio data-upstream-index="3" value="dark">Dark roast</Radio>
            </RadioGroup>
        </template>
        <template v-if="scenario === 'radio-group-2'">
            <RadioGroup data-upstream-index="0" label="Coffee roast" name="roast" value="dark">
                <Radio data-upstream-index="1" value="light">Light roast</Radio>
                <Radio data-upstream-index="2" value="medium">Medium roast</Radio>
                <Radio data-upstream-index="3" value="dark">Dark roast</Radio>
            </RadioGroup>
        </template>
        <template v-if="scenario === 'radio-group-3'">
            <RadioGroup
                data-upstream-index="0"
                label="Coffee roast"
                hint="Pick the roast we'll grind for your order."
                name="roast"
                value="medium"
            >
                <Radio data-upstream-index="1" value="light">Light roast</Radio>
                <Radio data-upstream-index="2" value="medium">Medium roast</Radio>
                <Radio data-upstream-index="3" value="dark">Dark roast</Radio>
            </RadioGroup>
        </template>
        <template v-if="scenario === 'radio-group-4'">
            <div class="wa-stack">
                <RadioGroup
                    data-upstream-index="0"
                    label="Color scheme"
                    hint="Choose how the interface should appear."
                    orientation="horizontal"
                    name="scheme"
                    value="auto"
                >
                    <Radio data-upstream-index="1" appearance="button" value="light">Light</Radio>
                    <Radio data-upstream-index="2" appearance="button" value="dark">Dark</Radio>
                    <Radio data-upstream-index="3" appearance="button" value="auto">Auto</Radio>
                </RadioGroup>

                <RadioGroup
                    data-upstream-index="4"
                    label="Color scheme"
                    hint="Choose how the interface should appear."
                    orientation="vertical"
                    name="scheme"
                    value="auto"
                    style="max-width: 300px"
                >
                    <Radio data-upstream-index="5" appearance="button" value="light">Light</Radio>
                    <Radio data-upstream-index="6" appearance="button" value="dark">Dark</Radio>
                    <Radio data-upstream-index="7" appearance="button" value="auto">Auto</Radio>
                </RadioGroup>
            </div>
        </template>
        <template v-if="scenario === 'radio-group-5'">
            <RadioGroup data-upstream-index="0" label="Shipping speed" disabled>
                <Radio data-upstream-index="1" value="standard">Standard</Radio>
                <Radio data-upstream-index="2" value="express">Express</Radio>
                <Radio data-upstream-index="3" value="overnight">Overnight</Radio>
            </RadioGroup>
        </template>
        <template v-if="scenario === 'radio-group-6'">
            <RadioGroup data-upstream-index="0" label="Shipping speed">
                <Radio data-upstream-index="1" value="standard">Standard</Radio>
                <Radio data-upstream-index="2" value="express">Express</Radio>
                <Radio data-upstream-index="3" value="overnight" disabled>Overnight</Radio>
            </RadioGroup>
        </template>
        <template v-if="scenario === 'radio-group-7'">
            <RadioGroup
                data-upstream-index="0"
                label="Shipping speed"
                hint="Choose how fast you'd like your order."
                orientation="horizontal"
                name="shipping"
                value="standard"
            >
                <Radio data-upstream-index="1" value="standard">Standard</Radio>
                <Radio data-upstream-index="2" value="express">Express</Radio>
                <Radio data-upstream-index="3" value="overnight">Overnight</Radio>
            </RadioGroup>
        </template>
        <template v-if="scenario === 'radio-group-8'">
            <div class="wa-stack">
                <RadioGroup data-upstream-index="0" label="Extra small" size="xs" value="medium">
                    <Radio data-upstream-index="1" value="light">Light roast</Radio>
                    <Radio data-upstream-index="2" value="medium">Medium roast</Radio>
                    <Radio data-upstream-index="3" value="dark">Dark roast</Radio>
                </RadioGroup>
                <RadioGroup data-upstream-index="4" label="Small" size="s" value="medium">
                    <Radio data-upstream-index="5" value="light">Light roast</Radio>
                    <Radio data-upstream-index="6" value="medium">Medium roast</Radio>
                    <Radio data-upstream-index="7" value="dark">Dark roast</Radio>
                </RadioGroup>
                <RadioGroup data-upstream-index="8" label="Medium" size="m" value="medium">
                    <Radio data-upstream-index="9" value="light">Light roast</Radio>
                    <Radio data-upstream-index="10" value="medium">Medium roast</Radio>
                    <Radio data-upstream-index="11" value="dark">Dark roast</Radio>
                </RadioGroup>
                <RadioGroup data-upstream-index="12" label="Large" size="l" value="dark">
                    <Radio data-upstream-index="13" value="light">Light roast</Radio>
                    <Radio data-upstream-index="14" value="medium">Medium roast</Radio>
                    <Radio data-upstream-index="15" value="dark">Dark roast</Radio>
                </RadioGroup>
                <RadioGroup data-upstream-index="16" label="Extra large" size="xl" value="dark">
                    <Radio data-upstream-index="17" value="light">Light roast</Radio>
                    <Radio data-upstream-index="18" value="medium">Medium roast</Radio>
                    <Radio data-upstream-index="19" value="dark">Dark roast</Radio>
                </RadioGroup>
            </div>
        </template>
        <template v-if="scenario === 'radio-group-9'">
            <RadioGroup data-upstream-index="0" label="Mixed sizes" value="m">
                <Radio data-upstream-index="1" value="xs" size="xs">Extra Small</Radio>
                <Radio data-upstream-index="2" value="s" size="s">Small</Radio>
                <Radio data-upstream-index="3" value="m" size="m">Medium</Radio>
                <Radio data-upstream-index="4" value="l" size="l">Large</Radio>
                <Radio data-upstream-index="5" value="xl" size="xl">Extra Large</Radio>
            </RadioGroup>
        </template>
        <template v-if="scenario === 'radio-group-10'">
            <form class="validation">
                <RadioGroup data-upstream-index="0" label="Coffee roast" name="roast" required>
                    <Radio data-upstream-index="1" value="light">Light roast</Radio>
                    <Radio data-upstream-index="2" value="medium">Medium roast</Radio>
                    <Radio data-upstream-index="3" value="dark">Dark roast</Radio>
                </RadioGroup>
                <br />
                <Button data-upstream-index="4" appearance="filled" type="submit" variant="neutral"
                    >Submit</Button
                >
            </form>
        </template>
        <template v-if="scenario === 'radio-group-11'">
            <form class="custom-validity">
                <RadioGroup data-upstream-index="0" label="Coffee roast" name="roast" value="light">
                    <Radio data-upstream-index="1" value="light">Light roast</Radio>
                    <Radio data-upstream-index="2" value="medium">Medium roast</Radio>
                    <Radio data-upstream-index="3" value="dark">Dark roast</Radio>
                </RadioGroup>
                <br />
                <Button data-upstream-index="4" appearance="filled" type="submit" variant="neutral"
                    >Submit</Button
                >
            </form>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, Radio, RadioGroup } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
