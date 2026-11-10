<template>
    <div>
        <template v-if="scenario === 'pie-chart-1'">
            <PieChart
                data-upstream-index="0"
                label="Browser Market Share"
                description="A pie chart showing browser market share with Chrome leading at 65%"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[0]"
                ></component>
            </PieChart>
        </template>
        <template v-if="scenario === 'pie-chart-2'">
            <PieChart
                data-upstream-index="0"
                label="Budget Allocation"
                description="A pie chart showing how a budget is allocated across departments"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[1]"
                ></component>
            </PieChart>
        </template>
        <template v-if="scenario === 'pie-chart-3'">
            <PieChart
                data-upstream-index="0"
                id="pie-js-example"
                label="Budget Allocation"
                description="A pie chart of budget allocation"
            >
            </PieChart>
        </template>
        <template v-if="scenario === 'pie-chart-4'">
            <PieChart
                data-upstream-index="0"
                id="pie-colors"
                label="Custom Colors"
                description="A pie chart with custom slice colors"
                style="
                    --fill-color-1: color-mix(in srgb, var(--wa-color-blue-60) 70%, transparent);
                    --border-color-1: var(--wa-color-blue-60);
                    --fill-color-2: color-mix(in srgb, var(--wa-color-cyan-60) 70%, transparent);
                    --border-color-2: var(--wa-color-cyan-60);
                    --fill-color-3: color-mix(in srgb, var(--wa-color-purple-60) 70%, transparent);
                    --border-color-3: var(--wa-color-purple-60);
                "
            >
            </PieChart>
        </template>
        <template v-if="scenario === 'pie-chart-5'">
            <PieChart
                data-upstream-index="0"
                id="pie-legend"
                legend-position="right"
                label="Legend on Right"
                description="A pie chart with the legend on the right side"
            >
            </PieChart>
        </template>
        <template v-if="scenario === 'pie-chart-6'">
            <PieChart
                data-upstream-index="0"
                id="pie-disabled"
                without-tooltip
                without-animation
                label="Minimal"
                description="A pie chart with tooltips and animations disabled"
            >
            </PieChart>
        </template>
    </div>
</template>

<script setup lang="ts">
import { PieChart } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
const markdownContents = [
    '\n    {\n      "data": {\n        "labels": ["Chrome", "Safari", "Firefox", "Edge", "Other"],\n        "datasets": [{ "label": "Market Share", "data": [65, 18, 8, 5, 4] }]\n      }\n    }\n  ',
    '\n    {\n      "data": {\n        "labels": ["Engineering", "Marketing", "Sales", "Operations"],\n        "datasets": [\n          {\n            "label": "Budget",\n            "data": [40, 25, 20, 15]\n          }\n        ]\n      }\n    }\n  ',
];
</script>
