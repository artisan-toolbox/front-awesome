<template>
    <div>
        <template v-if="scenario === 'radar-chart-1'">
            <RadarChart
                data-upstream-index="0"
                label="Employee Skills"
                description="A radar chart comparing skill levels across six categories"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[0]"
                ></component>
            </RadarChart>
        </template>
        <template v-if="scenario === 'radar-chart-2'">
            <RadarChart
                data-upstream-index="0"
                label="Feature Comparison"
                description="A radar chart comparing features of a product across five dimensions"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[1]"
                ></component>
            </RadarChart>
        </template>
        <template v-if="scenario === 'radar-chart-3'">
            <RadarChart
                data-upstream-index="0"
                id="radar-js-example"
                label="Feature Comparison"
                description="A radar chart comparing product features"
            >
            </RadarChart>
        </template>
        <template v-if="scenario === 'radar-chart-4'">
            <RadarChart
                data-upstream-index="0"
                id="radar-multi"
                label="Product Comparison"
                description="A radar chart comparing two products across several dimensions"
            >
            </RadarChart>
        </template>
        <template v-if="scenario === 'radar-chart-5'">
            <RadarChart
                data-upstream-index="0"
                id="radar-filled"
                label="Team Assessment"
                description="A filled radar chart comparing two team members across skill areas"
            >
            </RadarChart>
        </template>
        <template v-if="scenario === 'radar-chart-6'">
            <RadarChart
                data-upstream-index="0"
                id="radar-colors"
                label="Custom Colors"
                description="A radar chart with custom colors"
                style="
                    --fill-color-1: color-mix(in srgb, var(--wa-color-purple-60) 50%, transparent);
                    --border-color-1: var(--wa-color-purple-60);
                    --fill-color-2: color-mix(in srgb, var(--wa-color-orange-60) 50%, transparent);
                    --border-color-2: var(--wa-color-orange-60);
                "
            >
            </RadarChart>
        </template>
        <template v-if="scenario === 'radar-chart-7'">
            <RadarChart
                data-upstream-index="0"
                id="radar-border"
                style="--line-border-width: 4px"
                label="Thick Lines"
                description="A radar chart with thicker lines"
            >
            </RadarChart>
        </template>
        <template v-if="scenario === 'radar-chart-8'">
            <RadarChart
                data-upstream-index="0"
                id="radar-points"
                style="--point-radius: 6px"
                label="Large Points"
                description="A radar chart with larger vertex dots"
            >
            </RadarChart>
        </template>
        <template v-if="scenario === 'radar-chart-9'">
            <RadarChart
                data-upstream-index="0"
                id="radar-legend"
                legend-position="bottom"
                label="Legend at Bottom"
                description="A radar chart with the legend at the bottom"
            >
            </RadarChart>
        </template>
        <template v-if="scenario === 'radar-chart-10'">
            <RadarChart
                data-upstream-index="0"
                id="radar-disabled"
                without-tooltip
                without-animation
                label="Minimal"
                description="A radar chart with tooltips and animations disabled"
            >
            </RadarChart>
        </template>
    </div>
</template>

<script setup lang="ts">
import { RadarChart } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
const markdownContents = [
    '\n    {\n      "data": {\n        "labels": ["Communication", "Technical", "Leadership", "Creativity", "Teamwork", "Problem Solving"],\n        "datasets": [\n          {\n            "label": "Alice",\n            "data": [85, 92, 70, 88, 95, 78],\n            "fill": true,\n            "backgroundColor": "color-mix(in srgb, var(--wa-color-red-60) 20%, transparent)",\n            "borderColor": "var(--wa-color-red-60)"\n          },\n          {\n            "label": "Bob",\n            "data": [72, 78, 90, 65, 80, 88],\n            "fill": true,\n            "backgroundColor": "color-mix(in srgb, var(--wa-color-blue-60) 20%, transparent)",\n            "borderColor": "var(--wa-color-blue-60)"\n          }\n        ]\n      }\n    }\n  ',
    '\n    {\n      "data": {\n        "labels": ["Speed", "Reliability", "Ease of Use", "Features", "Support"],\n        "datasets": [\n          {\n            "label": "Product A",\n            "data": [85, 90, 75, 80, 70]\n          }\n        ]\n      }\n    }\n  ',
];
</script>
