<template>
    <div>
        <template v-if="scenario === 'bar-chart-1'">
            <BarChart
                data-upstream-index="0"
                label="Quarterly Revenue"
                description="A bar chart comparing online and in-store revenue across four quarters"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[0]"
                ></component>
            </BarChart>
        </template>
        <template v-if="scenario === 'bar-chart-2'">
            <BarChart
                data-upstream-index="0"
                label="Survey Results"
                description="A bar chart of survey results by category"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[1]"
                ></component>
            </BarChart>
        </template>
        <template v-if="scenario === 'bar-chart-3'">
            <BarChart
                data-upstream-index="0"
                id="bar-js-example"
                label="Survey Results"
                description="A bar chart of survey results by category"
            >
            </BarChart>
        </template>
        <template v-if="scenario === 'bar-chart-4'">
            <BarChart
                data-upstream-index="0"
                id="bar-multi"
                label="Quarterly Sales by Channel"
                description="A bar chart comparing three sales channels across four quarters"
            >
            </BarChart>
        </template>
        <template v-if="scenario === 'bar-chart-5'">
            <BarChart
                data-upstream-index="0"
                id="bar-horizontal"
                orientation="horizontal"
                label="Department Satisfaction"
                description="A horizontal bar chart showing satisfaction scores by department"
            >
            </BarChart>
        </template>
        <template v-if="scenario === 'bar-chart-6'">
            <BarChart
                data-upstream-index="0"
                id="bar-stacked"
                stacked
                label="Monthly Expenses"
                description="A stacked bar chart showing expenses broken into categories"
            >
            </BarChart>
        </template>
        <template v-if="scenario === 'bar-chart-7'">
            <BarChart
                data-upstream-index="0"
                id="bar-colors"
                label="Custom Colors"
                description="A bar chart with custom purple and cyan colors"
                style="
                    --fill-color-1: color-mix(in srgb, var(--wa-color-purple-60) 50%, transparent);
                    --border-color-1: var(--wa-color-purple-60);
                    --fill-color-2: color-mix(in srgb, var(--wa-color-cyan-60) 50%, transparent);
                    --border-color-2: var(--wa-color-cyan-60);
                "
            >
            </BarChart>
        </template>
        <template v-if="scenario === 'bar-chart-8'">
            <BarChart
                data-upstream-index="0"
                id="bar-border"
                style="--border-width: 4px"
                label="Thick Borders"
                description="A bar chart with thicker bar borders"
            >
            </BarChart>
        </template>
        <template v-if="scenario === 'bar-chart-9'">
            <BarChart
                data-upstream-index="0"
                id="bar-legend"
                legend-position="bottom"
                label="Legend at Bottom"
                description="A bar chart with the legend positioned at the bottom"
            >
            </BarChart>
        </template>
        <template v-if="scenario === 'bar-chart-10'">
            <BarChart
                data-upstream-index="0"
                id="bar-grid"
                grid="y"
                label="Y-Axis Grid Only"
                description="A bar chart showing only horizontal grid lines"
            >
            </BarChart>
        </template>
        <template v-if="scenario === 'bar-chart-11'">
            <BarChart
                data-upstream-index="0"
                id="bar-axis"
                x-label="Product"
                y-label="Units Sold"
                label="Product Sales"
                description="A bar chart with labeled axes showing units sold per product"
            >
            </BarChart>
        </template>
        <template v-if="scenario === 'bar-chart-12'">
            <BarChart
                data-upstream-index="0"
                id="bar-range"
                :min="0"
                :max="100"
                label="Test Scores"
                description="A bar chart with a constrained y-axis from 0 to 100"
            >
            </BarChart>
        </template>
        <template v-if="scenario === 'bar-chart-13'">
            <BarChart
                data-upstream-index="0"
                id="bar-disabled"
                without-tooltip
                without-animation
                label="Minimal"
                description="A bar chart with tooltips and animations disabled"
            >
            </BarChart>
        </template>
    </div>
</template>

<script setup lang="ts">
import { BarChart } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
const markdownContents = [
    '\n    {\n      "data": {\n        "labels": ["Q1", "Q2", "Q3", "Q4"],\n        "datasets": [\n          { "label": "Online", "data": [42, 58, 63, 71] },\n          { "label": "In-Store", "data": [65, 53, 48, 52] }\n        ]\n      }\n    }\n  ',
    '\n    {\n      "data": {\n        "labels": ["Excellent", "Good", "Average", "Poor"],\n        "datasets": [\n          {\n            "label": "Responses",\n            "data": [45, 30, 18, 7]\n          }\n        ]\n      }\n    }\n  ',
];
</script>
