<template>
    <div>
        <template v-if="scenario === 'date-picker-1'">
            <DatePicker data-upstream-index="0" style="max-width: 300px"></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-2'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                value="2026-05-11"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-3'">
            <DatePicker data-upstream-index="0"></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-4'">
            <DatePicker data-upstream-index="0"></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-5'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                min="2026-05-08"
                max="2026-05-22"
                value="2026-05-15"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-6'">
            <DatePicker data-upstream-index="0" style="max-width: 300px" disable-past></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-7'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                disable-future
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-8'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 600px"
                mode="range"
                :months="2"
                value="2026-05-11/2026-05-18"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-9'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 600px"
                mode="range"
                :months="2"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-10'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 600px"
                :months="2"
                page-by="single"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-11'">
            <DatePicker data-upstream-index="0" style="max-width: 300px" size="s"></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-12'">
            <DatePicker data-upstream-index="0" style="max-width: 300px" size="m"></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-13'">
            <DatePicker data-upstream-index="0" style="max-width: 300px" size="l"></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-14'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                disabled
                value="2026-05-11"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-15'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                readonly
                value="2026-05-11"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-16'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                value="2026-05-11"
                disabled-dates="
    2026-05-25
    2026-05-26
    2026-07-04
  "
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-17'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                disabled-days-of-week="sun sat"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-18'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                disabled-days-of-week="mon wed fri"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-19'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 600px"
                mode="range"
                :months="2"
                :min-range="3"
                :max-range="14"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-20'">
            <DatePicker data-upstream-index="0" style="max-width: 300px" locale="es"></DatePicker>
            <br /><br />
            <DatePicker data-upstream-index="1" style="max-width: 300px" locale="ko"></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-21'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                first-day-of-week="mon"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-22'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                weekday-format="narrow"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-23'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                weekday-format="short"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-24'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                weekday-format="long"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-25'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                with-week-numbers
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-26'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                with-outside-days
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-27'">
            <DatePicker data-upstream-index="0" style="max-width: 300px" view="months"></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-28'">
            <DatePicker data-upstream-index="0" style="max-width: 300px" view="years"></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-29'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                class="custom-disabled"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-30'">
            <DatePicker data-upstream-index="0" style="max-width: 300px" value="2026-12-25">
                <span slot="day-2026-01-01">🎆</span>
                <span slot="day-2026-02-14">❤️</span>
                <span slot="day-2026-03-17">🍀</span>
                <span slot="day-2026-04-22">🌍</span>
                <span slot="day-2026-10-31">🎃</span>
                <span slot="day-2026-12-25">🎄</span>
            </DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-31'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 300px"
                class="dynamic-days"
            ></DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-32'">
            <DatePicker data-upstream-index="0" style="max-width: 300px" class="footer-example">
                <div slot="footer">
                    <Button data-upstream-index="1" class="today-btn" size="s" appearance="outlined"
                        >Today</Button
                    >
                    <Button data-upstream-index="2" class="clear-btn" size="s" appearance="outlined"
                        >Clear</Button
                    >
                </div>
            </DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-33'">
            <DatePicker data-upstream-index="0" style="max-width: 300px">
                <Icon data-upstream-index="1" slot="previous-icon" name="caret-left"></Icon>
                <Icon data-upstream-index="2" slot="next-icon" name="caret-right"></Icon>
            </DatePicker>
        </template>
        <template v-if="scenario === 'date-picker-34'">
            <DatePicker
                data-upstream-index="0"
                style="max-width: 600px"
                mode="range"
                :months="2"
                class="change-listener"
            ></DatePicker>
            <output class="change-output"></output>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, Icon } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import { DatePicker } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
</script>
