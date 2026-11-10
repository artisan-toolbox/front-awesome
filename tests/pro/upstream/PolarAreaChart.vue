<template>
    <div>
        <template v-if="scenario === 'polar-area-chart-1'">
            <PolarAreaChart
                data-upstream-index="0"
                label="Monthly Rainfall"
                description="A polar area chart showing monthly rainfall in millimeters"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[0]"
                ></component>
            </PolarAreaChart>
        </template>
        <template v-if="scenario === 'polar-area-chart-2'">
            <PolarAreaChart
                data-upstream-index="0"
                label="Energy Production"
                description="A polar area chart showing energy production by source in gigawatts"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[1]"
                ></component>
            </PolarAreaChart>
        </template>
        <template v-if="scenario === 'polar-area-chart-3'">
            <PolarAreaChart
                data-upstream-index="0"
                id="polar-js-example"
                label="Energy Production"
                description="A polar area chart of energy output"
            >
            </PolarAreaChart>
        </template>
        <template v-if="scenario === 'polar-area-chart-4'">
            <PolarAreaChart
                data-upstream-index="0"
                id="polar-colors"
                label="Custom Colors"
                description="A polar area chart with custom segment colors"
                style="
                    --fill-color-1: color-mix(in srgb, var(--wa-color-blue-60) 60%, transparent);
                    --border-color-1: var(--wa-color-blue-60);
                    --fill-color-2: color-mix(in srgb, var(--wa-color-cyan-60) 60%, transparent);
                    --border-color-2: var(--wa-color-cyan-60);
                    --fill-color-3: color-mix(in srgb, var(--wa-color-purple-60) 60%, transparent);
                    --border-color-3: var(--wa-color-purple-60);
                    --fill-color-4: color-mix(in srgb, var(--wa-color-orange-60) 60%, transparent);
                    --border-color-4: var(--wa-color-orange-60);
                "
            >
            </PolarAreaChart>
        </template>
        <template v-if="scenario === 'polar-area-chart-5'">
            <PolarAreaChart
                data-upstream-index="0"
                id="polar-legend"
                legend-position="right"
                label="Legend on Right"
                description="A polar area chart with the legend on the right side"
            >
            </PolarAreaChart>
        </template>
        <template v-if="scenario === 'polar-area-chart-6'">
            <PolarAreaChart
                data-upstream-index="0"
                id="polar-disabled"
                without-tooltip
                without-animation
                label="Minimal"
                description="A polar area chart with tooltips and animations disabled"
            >
            </PolarAreaChart>
        </template>
    </div>
</template>

<script setup lang="ts">
import { PolarAreaChart } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
const markdownContents = [
    '\n    {\n      "data": {\n        "labels": ["January", "February", "March", "April", "May", "June"],\n        "datasets": [{ "label": "Rainfall (mm)", "data": [78, 62, 85, 110, 95, 45] }]\n      }\n    }\n  ',
    '\n    {\n      "data": {\n        "labels": ["Solar", "Wind", "Hydro", "Nuclear", "Natural Gas"],\n        "datasets": [\n          {\n            "label": "Output (GW)",\n            "data": [85, 72, 110, 95, 130]\n          }\n        ]\n      }\n    }\n  ',
];
</script>
