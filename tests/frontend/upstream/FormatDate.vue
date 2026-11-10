<template>
    <div>
        <template v-if="scenario === 'format-date-1'">
            <!-- Web Awesome 3 release date 🎉 -->
            <FormatDate data-upstream-index="0" date="2025-12-02T00:00:00-05:00"></FormatDate>
        </template>
        <template v-if="scenario === 'format-date-2'">
            <!-- Human-readable date -->
            <FormatDate
                data-upstream-index="0"
                month="long"
                day="numeric"
                year="numeric"
            ></FormatDate
            ><br />

            <!-- Time -->
            <FormatDate data-upstream-index="1" hour="numeric" minute="numeric"></FormatDate><br />

            <!-- Weekday -->
            <FormatDate data-upstream-index="2" weekday="long"></FormatDate><br />

            <!-- Month -->
            <FormatDate data-upstream-index="3" month="long"></FormatDate><br />

            <!-- Year -->
            <FormatDate data-upstream-index="4" year="numeric"></FormatDate><br />

            <!-- No formatting options -->
            <FormatDate data-upstream-index="5"></FormatDate>
        </template>
        <template v-if="scenario === 'format-date-3'">
            <FormatDate
                data-upstream-index="0"
                hour="numeric"
                minute="numeric"
                hour-format="12"
            ></FormatDate
            ><br />
            <FormatDate
                data-upstream-index="1"
                hour="numeric"
                minute="numeric"
                hour-format="24"
            ></FormatDate>
        </template>
        <template v-if="scenario === 'format-date-4'">
            English: <FormatDate data-upstream-index="0" lang="en"></FormatDate><br />
            French: <FormatDate data-upstream-index="1" lang="fr"></FormatDate><br />
            Russian: <FormatDate data-upstream-index="2" lang="ru"></FormatDate>
        </template>
    </div>
</template>

<script setup lang="ts">
import { FormatDate } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
