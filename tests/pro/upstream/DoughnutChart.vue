<template>
    <div>
        <template v-if="scenario === 'doughnut-chart-1'">
            <DoughnutChart
                data-upstream-index="0"
                label="Project Time Allocation"
                description="A doughnut chart showing how project time is distributed across activities"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[0]"
                ></component>
            </DoughnutChart>
        </template>
        <template v-if="scenario === 'doughnut-chart-2'">
            <DoughnutChart
                data-upstream-index="0"
                label="Revenue by Region"
                description="A doughnut chart showing revenue distribution across regions"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[1]"
                ></component>
            </DoughnutChart>
        </template>
        <template v-if="scenario === 'doughnut-chart-3'">
            <DoughnutChart
                data-upstream-index="0"
                id="doughnut-js-example"
                label="Revenue by Region"
                description="A doughnut chart of revenue by region"
            >
            </DoughnutChart>
        </template>
        <template v-if="scenario === 'doughnut-chart-4'">
            <DoughnutChart
                data-upstream-index="0"
                id="doughnut-cutout-example"
                label="Thin Ring"
                description="A doughnut chart with a larger center cutout"
            >
            </DoughnutChart>
        </template>
        <template v-if="scenario === 'doughnut-chart-5'">
            <DoughnutChart
                data-upstream-index="0"
                id="doughnut-colors"
                label="Custom Colors"
                description="A doughnut chart with custom slice colors"
                style="
                    --fill-color-1: color-mix(in srgb, var(--wa-color-purple-60) 70%, transparent);
                    --border-color-1: var(--wa-color-purple-60);
                    --fill-color-2: color-mix(in srgb, var(--wa-color-orange-60) 70%, transparent);
                    --border-color-2: var(--wa-color-orange-60);
                    --fill-color-3: color-mix(in srgb, var(--wa-color-cyan-60) 70%, transparent);
                    --border-color-3: var(--wa-color-cyan-60);
                "
            >
            </DoughnutChart>
        </template>
        <template v-if="scenario === 'doughnut-chart-6'">
            <DoughnutChart
                data-upstream-index="0"
                id="doughnut-legend"
                legend-position="bottom"
                label="Legend at Bottom"
                description="A doughnut chart with the legend at the bottom"
            >
            </DoughnutChart>
        </template>
        <template v-if="scenario === 'doughnut-chart-7'">
            <DoughnutChart
                data-upstream-index="0"
                id="doughnut-disabled"
                without-tooltip
                without-animation
                label="Minimal"
                description="A doughnut chart with tooltips and animations disabled"
            >
            </DoughnutChart>
        </template>
    </div>
</template>

<script setup lang="ts">
import { DoughnutChart } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
const markdownContents = [
    '\n    {\n      "data": {\n        "labels": ["Development", "Design", "Testing", "Meetings", "Planning"],\n        "datasets": [{ "label": "Hours", "data": [35, 20, 15, 18, 12] }]\n      }\n    }\n  ',
    '\n    {\n      "data": {\n        "labels": ["North America", "Europe", "Asia", "Other"],\n        "datasets": [\n          {\n            "label": "Revenue",\n            "data": [42, 28, 22, 8]\n          }\n        ]\n      }\n    }\n  ',
];
</script>
