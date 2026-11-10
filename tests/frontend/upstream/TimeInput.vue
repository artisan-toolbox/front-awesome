<template>
    <div>
        <template v-if="scenario === 'time-input-1'">
            <TimeInput data-upstream-index="0" label="Pick a time"></TimeInput>
        </template>
        <template v-if="scenario === 'time-input-2'">
            <TimeInput
                data-upstream-index="0"
                label="Meeting time"
                hint="Choose a time that works for you."
                value="14:30"
            >
                <Icon data-upstream-index="1" slot="start" name="clock"></Icon>
            </TimeInput>
        </template>
        <template v-if="scenario === 'time-input-3'">
            <form id="tp-form-demo">
                <TimeInput
                    data-upstream-index="0"
                    name="meeting_time"
                    label="Meeting time"
                    required
                    value="14:30"
                ></TimeInput>
                <br />
                <Button data-upstream-index="1" type="submit" appearance="filled" variant="neutral"
                    >Submit</Button
                >
            </form>
            <pre id="tp-form-demo-output"></pre>
        </template>
        <template v-if="scenario === 'time-input-4'">
            <TimeInput data-upstream-index="0" label="Meeting time" value="14:30"></TimeInput>
        </template>
        <template v-if="scenario === 'time-input-5'">
            <TimeInput data-upstream-index="0" label="What time works for you?"></TimeInput>
        </template>
        <template v-if="scenario === 'time-input-6'">
            <TimeInput
                data-upstream-index="0"
                label="Wake up"
                hint="Set the time your alarm should go off."
            ></TimeInput>
        </template>
        <template v-if="scenario === 'time-input-7'">
            <div class="wa-stack">
                <TimeInput data-upstream-index="0" label="Start">
                    <Icon data-upstream-index="1" name="hourglass-start" slot="start"></Icon>
                </TimeInput>
                <TimeInput data-upstream-index="2" label="End">
                    <Icon data-upstream-index="3" name="hourglass-end" slot="end"></Icon>
                </TimeInput>
            </div>
        </template>
        <template v-if="scenario === 'time-input-8'">
            <TimeInput data-upstream-index="0" label="Alarm" with-clear value="07:00"></TimeInput>
        </template>
        <template v-if="scenario === 'time-input-9'">
            <TimeInput
                data-upstream-index="0"
                label="Office hours"
                min="09:00"
                max="17:00"
            ></TimeInput>
        </template>
        <template v-if="scenario === 'time-input-10'">
            <div class="wa-stack">
                <TimeInput data-upstream-index="0" label="Every 5 minutes" :step="300"></TimeInput>
                <TimeInput data-upstream-index="1" label="With seconds" :step="1"></TimeInput>
            </div>
        </template>
        <template v-if="scenario === 'time-input-11'">
            <div class="wa-stack">
                <TimeInput
                    data-upstream-index="0"
                    label="12-hour"
                    hour-format="12"
                    value="09:00"
                ></TimeInput>
                <TimeInput
                    data-upstream-index="1"
                    label="24-hour"
                    hour-format="24"
                    value="09:00"
                ></TimeInput>
            </div>
        </template>
        <template v-if="scenario === 'time-input-12'">
            <div class="wa-stack">
                <TimeInput
                    data-upstream-index="0"
                    lang="en-US"
                    label="English (US)"
                    value="14:30"
                ></TimeInput>
                <TimeInput
                    data-upstream-index="1"
                    lang="en-GB"
                    label="English (UK)"
                    value="14:30"
                ></TimeInput>
                <TimeInput
                    data-upstream-index="2"
                    lang="de-DE"
                    label="German"
                    value="14:30"
                ></TimeInput>
            </div>
        </template>
        <template v-if="scenario === 'time-input-13'">
            <TimeInput data-upstream-index="0" label="When?" with-now></TimeInput>
        </template>
        <template v-if="scenario === 'time-input-14'">
            <div class="wa-stack">
                <TimeInput data-upstream-index="0" size="xs" label="Extra small"></TimeInput>
                <TimeInput data-upstream-index="1" size="s" label="Small"></TimeInput>
                <TimeInput data-upstream-index="2" size="m" label="Medium"></TimeInput>
                <TimeInput data-upstream-index="3" size="l" label="Large"></TimeInput>
                <TimeInput data-upstream-index="4" size="xl" label="Extra large"></TimeInput>
            </div>
        </template>
        <template v-if="scenario === 'time-input-15'">
            <div class="wa-stack">
                <TimeInput
                    data-upstream-index="0"
                    appearance="outlined"
                    label="Outlined"
                ></TimeInput>
                <TimeInput data-upstream-index="1" appearance="filled" label="Filled"></TimeInput>
                <TimeInput
                    data-upstream-index="2"
                    appearance="filled-outlined"
                    label="Filled outlined"
                ></TimeInput>
            </div>
        </template>
        <template v-if="scenario === 'time-input-16'">
            <TimeInput data-upstream-index="0" pill label="Pill"></TimeInput>
        </template>
        <template v-if="scenario === 'time-input-17'">
            <TimeInput data-upstream-index="0" label="Disabled" value="09:00" disabled></TimeInput>
        </template>
        <template v-if="scenario === 'time-input-18'">
            <TimeInput data-upstream-index="0" label="Read-only" value="09:00" readonly></TimeInput>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, Icon, TimeInput } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
