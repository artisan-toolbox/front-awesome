<template>
    <div>
        <template v-if="scenario === 'date-input-1'">
            <DateInput data-upstream-index="0" label="Pick a date"></DateInput>
        </template>
        <template v-if="scenario === 'date-input-2'">
            <DateInput
                data-upstream-index="0"
                label="Event date"
                hint="When should we schedule it?"
                value="2026-05-20"
            >
                <Icon data-upstream-index="1" slot="start" name="calendar"></Icon>
            </DateInput>
        </template>
        <template v-if="scenario === 'date-input-3'">
            <form id="dp-form-demo">
                <DateInput
                    data-upstream-index="0"
                    name="event_date"
                    label="Event date"
                    required
                    value="2026-05-20"
                ></DateInput>
                <br />
                <Button data-upstream-index="1" type="submit" appearance="filled" variant="neutral"
                    >Submit</Button
                >
            </form>

            <pre id="dp-form-demo-output"></pre>
        </template>
        <template v-if="scenario === 'date-input-4'">
            <DateInput data-upstream-index="0" label="Date of birth" value="1990-04-15"></DateInput>
        </template>
        <template v-if="scenario === 'date-input-5'">
            <DateInput data-upstream-index="0" label="When did you start?"></DateInput>
        </template>
        <template v-if="scenario === 'date-input-6'">
            <DateInput
                data-upstream-index="0"
                label="Departure"
                hint="Choose the day you want to leave."
            ></DateInput>
        </template>
        <template v-if="scenario === 'date-input-7'">
            <DateInput data-upstream-index="0" label="Departure">
                <Icon data-upstream-index="1" name="plane-departure" slot="start"></Icon>
            </DateInput>
            <br />
            <DateInput data-upstream-index="2" label="Arrival">
                <Icon data-upstream-index="3" name="plane-arrival" slot="end"></Icon>
            </DateInput>
        </template>
        <template v-if="scenario === 'date-input-8'">
            <DateInput
                data-upstream-index="0"
                label="Due date"
                with-clear
                value="2026-08-01"
            ></DateInput>
        </template>
        <template v-if="scenario === 'date-input-9'">
            <DateInput
                data-upstream-index="0"
                label="Check-in"
                min="2026-01-01"
                max="2026-12-31"
            ></DateInput>
        </template>
        <template v-if="scenario === 'date-input-10'">
            <DateInput
                data-upstream-index="0"
                label="Future bookings only"
                disable-past
            ></DateInput>
        </template>
        <template v-if="scenario === 'date-input-11'">
            <DateInput
                data-upstream-index="0"
                label="Pick a weekday"
                disabled-days-of-week="sun sat"
            ></DateInput>
            <br />
            <br />
            <DateInput
                data-upstream-index="1"
                label="Excludes holidays"
                disabled-dates="2026-07-04 2026-12-25 2026-12-31"
            ></DateInput>
        </template>
        <template v-if="scenario === 'date-input-12'">
            <DateInput data-upstream-index="0" label="Booking" mode="range" :months="2"></DateInput>
        </template>
        <template v-if="scenario === 'date-input-13'">
            <DateInput
                data-upstream-index="0"
                label="Trip length (3–14 days)"
                mode="range"
                :months="2"
                :min-range="3"
                :max-range="14"
            ></DateInput>
        </template>
        <template v-if="scenario === 'date-input-14'">
            <DateInput data-upstream-index="0" size="xs" label="Extra small"></DateInput>
            <br />
            <DateInput data-upstream-index="1" size="s" label="Small"></DateInput>
            <br />
            <DateInput data-upstream-index="2" size="m" label="Medium"></DateInput>
            <br />
            <DateInput data-upstream-index="3" size="l" label="Large"></DateInput>
            <br />
            <DateInput data-upstream-index="4" size="xl" label="Extra large"></DateInput>
        </template>
        <template v-if="scenario === 'date-input-15'">
            <DateInput data-upstream-index="0" appearance="filled" label="Filled"></DateInput>
            <br />
            <DateInput
                data-upstream-index="1"
                appearance="filled-outlined"
                label="Filled outlined"
            ></DateInput>
        </template>
        <template v-if="scenario === 'date-input-16'">
            <DateInput data-upstream-index="0" pill label="Pill"></DateInput>
        </template>
        <template v-if="scenario === 'date-input-17'">
            <DateInput
                data-upstream-index="0"
                label="Disabled"
                value="2026-05-20"
                disabled
            ></DateInput>
        </template>
        <template v-if="scenario === 'date-input-18'">
            <DateInput
                data-upstream-index="0"
                label="Readonly"
                value="2026-05-20"
                readonly
            ></DateInput>
        </template>
        <template v-if="scenario === 'date-input-19'">
            <DateInput
                data-upstream-index="0"
                label="Veranstaltungsdatum"
                lang="de-DE"
                value="2026-01-23"
            ></DateInput>
            <br />
            <br />
            <DateInput
                data-upstream-index="1"
                label="Date d'événement"
                lang="fr-FR"
                value="2026-01-23"
            ></DateInput>
            <br />
            <br />
            <DateInput
                data-upstream-index="2"
                label="日付"
                lang="ja-JP"
                value="2026-01-23"
            ></DateInput>
        </template>
        <template v-if="scenario === 'date-input-20'">
            <DateInput
                data-upstream-index="0"
                label="Anchored above"
                placement="top-start"
                :distance="8"
            ></DateInput>
        </template>
        <template v-if="scenario === 'date-input-21'">
            <DateInput data-upstream-index="0" id="dp-workdays" label="Workdays only"></DateInput>
        </template>
        <template v-if="scenario === 'date-input-22'">
            <DateInput
                data-upstream-index="0"
                id="dp-day-content"
                label="With custom day content"
            ></DateInput>
        </template>
        <template v-if="scenario === 'date-input-23'">
            <DateInput data-upstream-index="0" label="With holiday markers">
                <span slot="day-2026-07-04" title="Independence Day">🇺🇸</span>
                <span slot="day-2026-12-25" title="Christmas">🎄</span>
            </DateInput>
        </template>
        <template v-if="scenario === 'date-input-24'">
            <DateInput data-upstream-index="0" label="With custom arrows">
                <Icon data-upstream-index="1" slot="previous-icon" name="arrow-left"></Icon>
                <Icon data-upstream-index="2" slot="next-icon" name="arrow-right"></Icon>
            </DateInput>
        </template>
        <template v-if="scenario === 'date-input-25'">
            <DateInput data-upstream-index="0" label="With footer">
                <div slot="footer" style="display: flex; gap: 0.5rem; justify-content: flex-end">
                    <Button
                        data-upstream-index="1"
                        size="s"
                        appearance="filled"
                        variant="neutral"
                        onclick="
                            this.closest('wa-date-input').value = new Date()
                                .toISOString()
                                .slice(0, 10)
                        "
                        >Today</Button
                    >
                    <Button
                        data-upstream-index="2"
                        size="s"
                        appearance="plain"
                        onclick="this.closest('wa-date-input').value = ''"
                        >Clear</Button
                    >
                </div>
            </DateInput>
        </template>
        <template v-if="scenario === 'date-input-26'">
            <DateInput data-upstream-index="0" id="dp" label="Programmatic"></DateInput>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, Icon } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import { DateInput } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
</script>
