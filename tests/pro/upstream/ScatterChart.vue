<template>
    <div>
        <template v-if="scenario === 'scatter-chart-1'">
            <ScatterChart
                data-upstream-index="0"
                label="Height vs. Weight"
                description="A scatter chart showing the relationship between height and weight"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[0]"
                ></component>
            </ScatterChart>
        </template>
        <template v-if="scenario === 'scatter-chart-2'">
            <ScatterChart
                data-upstream-index="0"
                label="Test Results"
                description="A scatter chart showing the correlation between study hours and test scores"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[1]"
                ></component>
            </ScatterChart>
        </template>
        <template v-if="scenario === 'scatter-chart-3'">
            <ScatterChart
                data-upstream-index="0"
                id="scatter-js-example"
                label="Test Results"
                description="A scatter chart of study hours vs. scores"
            >
            </ScatterChart>
        </template>
        <template v-if="scenario === 'scatter-chart-4'">
            <ScatterChart
                data-upstream-index="0"
                id="scatter-tooltips"
                x-label="Monthly Cost Index"
                y-label="Quality of Life"
                label="City Comparison"
                description="A scatter chart whose tooltips name each city instead of showing raw coordinates"
            >
            </ScatterChart>
        </template>
        <template v-if="scenario === 'scatter-chart-5'">
            <ScatterChart
                data-upstream-index="0"
                id="scatter-multi"
                label="Group Comparison"
                description="A scatter chart comparing test results between two study groups"
            >
            </ScatterChart>
        </template>
        <template v-if="scenario === 'scatter-chart-6'">
            <ScatterChart
                data-upstream-index="0"
                id="scatter-colors"
                label="Custom Colors"
                description="A scatter chart with custom point colors"
                style="
                    --fill-color-1: var(--wa-color-cyan-60);
                    --border-color-1: var(--wa-color-cyan-60);
                "
            >
            </ScatterChart>
        </template>
        <template v-if="scenario === 'scatter-chart-7'">
            <ScatterChart
                data-upstream-index="0"
                id="scatter-points"
                style="--point-radius: 8px"
                label="Large Points"
                description="A scatter chart with larger data point dots"
            >
            </ScatterChart>
        </template>
        <template v-if="scenario === 'scatter-chart-8'">
            <ScatterChart
                data-upstream-index="0"
                id="scatter-legend"
                legend-position="right"
                label="Legend on Right"
                description="A scatter chart with the legend on the right side"
            >
            </ScatterChart>
        </template>
        <template v-if="scenario === 'scatter-chart-9'">
            <ScatterChart
                data-upstream-index="0"
                id="scatter-grid"
                grid="none"
                label="No Grid"
                description="A scatter chart with grid lines hidden"
            >
            </ScatterChart>
        </template>
        <template v-if="scenario === 'scatter-chart-10'">
            <ScatterChart
                data-upstream-index="0"
                id="scatter-axis"
                x-label="Hours Studied"
                y-label="Score"
                label="Study Correlation"
                description="A scatter chart with labeled axes showing study hours vs. score"
            >
            </ScatterChart>
        </template>
        <template v-if="scenario === 'scatter-chart-11'">
            <ScatterChart
                data-upstream-index="0"
                id="scatter-disabled"
                without-tooltip
                without-animation
                label="Minimal"
                description="A scatter chart with tooltips and animations disabled"
            >
            </ScatterChart>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ScatterChart } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
const markdownContents = [
    '\n    {\n      "data": {\n        "datasets": [\n          {\n            "label": "Measurements",\n            "data": [\n              { "x": 158, "y": 55 },\n              { "x": 163, "y": 62 },\n              { "x": 165, "y": 68 },\n              { "x": 170, "y": 72 },\n              { "x": 173, "y": 75 },\n              { "x": 175, "y": 80 },\n              { "x": 178, "y": 78 },\n              { "x": 180, "y": 85 },\n              { "x": 183, "y": 82 },\n              { "x": 188, "y": 90 }\n            ]\n          }\n        ]\n      }\n    }\n  ',
    '\n    {\n      "data": {\n        "datasets": [\n          {\n            "label": "Students",\n            "data": [\n              { "x": 2, "y": 65 },\n              { "x": 3, "y": 72 },\n              { "x": 4, "y": 78 },\n              { "x": 5, "y": 82 },\n              { "x": 6, "y": 88 },\n              { "x": 7, "y": 85 },\n              { "x": 8, "y": 92 },\n              { "x": 9, "y": 95 }\n            ]\n          }\n        ]\n      }\n    }\n  ',
];
</script>
