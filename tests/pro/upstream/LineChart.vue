<template>
    <div>
        <template v-if="scenario === 'line-chart-1'">
            <LineChart
                data-upstream-index="0"
                label="Monthly Visitors"
                description="A line chart showing website visitors over seven months"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[0]"
                ></component>
            </LineChart>
        </template>
        <template v-if="scenario === 'line-chart-2'">
            <LineChart
                data-upstream-index="0"
                label="Weekly Signups"
                description="A line chart showing new user signups over one week"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[1]"
                ></component>
            </LineChart>
        </template>
        <template v-if="scenario === 'line-chart-3'">
            <LineChart
                data-upstream-index="0"
                id="line-js-example"
                label="Weekly Signups"
                description="A line chart showing new user signups over one week"
            >
            </LineChart>
        </template>
        <template v-if="scenario === 'line-chart-4'">
            <LineChart
                data-upstream-index="0"
                id="line-multi"
                label="Traffic by Source"
                description="A line chart comparing website traffic from three different sources"
            >
            </LineChart>
        </template>
        <template v-if="scenario === 'line-chart-5'">
            <LineChart
                data-upstream-index="0"
                id="line-fill-example"
                label="Cumulative Signups"
                description="A line chart with a filled area showing cumulative signups"
            >
            </LineChart>
        </template>
        <template v-if="scenario === 'line-chart-6'">
            <LineChart
                data-upstream-index="0"
                id="line-stacked-example"
                stacked
                label="Traffic by Source"
                description="A stacked area chart showing traffic by source over time"
            >
            </LineChart>
        </template>
        <template v-if="scenario === 'line-chart-7'">
            <LineChart
                data-upstream-index="0"
                id="line-colors"
                label="Custom Colors"
                description="A line chart with custom purple and orange line colors"
                style="
                    --fill-color-1: var(--wa-color-purple-60);
                    --border-color-1: var(--wa-color-purple-60);
                    --fill-color-2: var(--wa-color-orange-60);
                    --border-color-2: var(--wa-color-orange-60);
                "
            >
            </LineChart>
        </template>
        <template v-if="scenario === 'line-chart-8'">
            <LineChart
                data-upstream-index="0"
                id="line-border"
                style="--line-border-width: 5px"
                label="Thick Lines"
                description="A line chart with thicker lines"
            >
            </LineChart>
        </template>
        <template v-if="scenario === 'line-chart-9'">
            <LineChart
                data-upstream-index="0"
                id="line-points"
                style="--point-radius: 6px"
                label="Large Points"
                description="A line chart with larger data point dots"
            >
            </LineChart>
        </template>
        <template v-if="scenario === 'line-chart-10'">
            <LineChart
                data-upstream-index="0"
                id="line-legend"
                legend-position="bottom"
                label="Legend at Bottom"
                description="A line chart with the legend positioned at the bottom"
            >
            </LineChart>
        </template>
        <template v-if="scenario === 'line-chart-11'">
            <LineChart
                data-upstream-index="0"
                id="line-grid"
                grid="x"
                label="X-Axis Grid Only"
                description="A line chart showing only vertical grid lines"
            >
            </LineChart>
        </template>
        <template v-if="scenario === 'line-chart-12'">
            <LineChart
                data-upstream-index="0"
                id="line-axis"
                x-label="Month"
                y-label="Visitors"
                label="Monthly Traffic"
                description="A line chart with labeled axes showing monthly visitors"
            >
            </LineChart>
        </template>
        <template v-if="scenario === 'line-chart-13'">
            <LineChart
                data-upstream-index="0"
                id="line-range"
                :min="0"
                :max="100"
                label="Completion Rate"
                description="A line chart with a constrained y-axis from 0 to 100"
            >
            </LineChart>
        </template>
        <template v-if="scenario === 'line-chart-14'">
            <LineChart
                data-upstream-index="0"
                id="line-disabled"
                without-tooltip
                without-animation
                label="Minimal"
                description="A line chart with tooltips and animations disabled"
            >
            </LineChart>
        </template>
    </div>
</template>

<script setup lang="ts">
import { LineChart } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
const markdownContents = [
    '\n    {\n      "data": {\n        "labels": ["January", "February", "March", "April", "May", "June", "July"],\n        "datasets": [{ "label": "Visitors", "data": [4200, 4800, 5100, 4900, 5500, 6200, 5800] }]\n      }\n    }\n  ',
    '\n    {\n      "data": {\n        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],\n        "datasets": [\n          {\n            "label": "Signups",\n            "data": [120, 95, 140, 160, 130, 80, 65]\n          }\n        ]\n      }\n    }\n  ',
];
</script>
