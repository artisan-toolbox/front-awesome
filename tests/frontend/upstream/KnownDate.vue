<template>
    <div>
        <template v-if="scenario === 'known-date-1'">
            <KnownDate data-upstream-index="0" label="When was your passport issued?"></KnownDate>
        </template>
        <template v-if="scenario === 'known-date-2'">
            <form id="kd-form-demo">
                <KnownDate
                    data-upstream-index="0"
                    name="dob"
                    label="Date of birth"
                    required
                    value="2007-03-27"
                ></KnownDate>
                <br />
                <Button data-upstream-index="1" type="submit" appearance="filled" variant="neutral"
                    >Submit</Button
                >
            </form>

            <pre id="kd-form-demo-output"></pre>
        </template>
        <template v-if="scenario === 'known-date-3'">
            <KnownDate data-upstream-index="0" label="Date of birth" value="1990-04-15"></KnownDate>
        </template>
        <template v-if="scenario === 'known-date-4'">
            <KnownDate
                data-upstream-index="0"
                label="When was your passport issued?"
                hint="For example, 27 3 2007"
            ></KnownDate>
        </template>
        <template v-if="scenario === 'known-date-5'">
            <div class="wa-stack">
                <KnownDate data-upstream-index="0" label="UK order" lang="en-GB"></KnownDate>
                <KnownDate data-upstream-index="1" label="US order" lang="en-US"></KnownDate>
                <KnownDate data-upstream-index="2" label="Japanese order" lang="ja-JP"></KnownDate>
            </div>
        </template>
        <template v-if="scenario === 'known-date-6'">
            <KnownDate
                data-upstream-index="0"
                label="Birthday"
                min="1900-01-01"
                max="2099-12-31"
            ></KnownDate>
        </template>
        <template v-if="scenario === 'known-date-7'">
            <form>
                <KnownDate data-upstream-index="0" label="Date of birth" required></KnownDate>
                <br />
                <Button data-upstream-index="1" type="submit" appearance="filled" variant="neutral"
                    >Submit</Button
                >
            </form>
        </template>
        <template v-if="scenario === 'known-date-8'">
            <KnownDate
                data-upstream-index="0"
                label="Birthday"
                value="2007-03-27"
                disabled
            ></KnownDate>
        </template>
        <template v-if="scenario === 'known-date-9'">
            <KnownDate
                data-upstream-index="0"
                label="Member since"
                value="2007-03-27"
                readonly
            ></KnownDate>
        </template>
        <template v-if="scenario === 'known-date-10'">
            <KnownDate
                data-upstream-index="0"
                label="Date of birth"
                autocomplete="bday"
            ></KnownDate>
        </template>
        <template v-if="scenario === 'known-date-11'">
            <div class="wa-stack">
                <KnownDate data-upstream-index="0" label="Extra small" size="xs"></KnownDate>
                <KnownDate data-upstream-index="1" label="Small" size="s"></KnownDate>
                <KnownDate data-upstream-index="2" label="Medium (default)" size="m"></KnownDate>
                <KnownDate data-upstream-index="3" label="Large" size="l"></KnownDate>
                <KnownDate data-upstream-index="4" label="Extra large" size="xl"></KnownDate>
            </div>
        </template>
        <template v-if="scenario === 'known-date-12'">
            <div class="wa-stack">
                <KnownDate
                    data-upstream-index="0"
                    label="Outlined (default)"
                    appearance="outlined"
                ></KnownDate>
                <KnownDate data-upstream-index="1" label="Filled" appearance="filled"></KnownDate>
                <KnownDate
                    data-upstream-index="2"
                    label="Filled outlined"
                    appearance="filled-outlined"
                ></KnownDate>
            </div>
        </template>
        <template v-if="scenario === 'known-date-13'">
            <KnownDate data-upstream-index="0" label="Pill" pill></KnownDate>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, KnownDate } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
