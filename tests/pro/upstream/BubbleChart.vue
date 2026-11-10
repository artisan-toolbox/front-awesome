<template>
    <div>
        <template v-if="scenario === 'bubble-chart-1'">
            <BubbleChart
                data-upstream-index="0"
                label="City Comparison"
                description="A bubble chart comparing cities by cost of living, quality of life, and population"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[0]"
                ></component>
            </BubbleChart>
        </template>
        <template v-if="scenario === 'bubble-chart-2'">
            <BubbleChart
                data-upstream-index="0"
                label="Product Analysis"
                description="A bubble chart showing products by price, rating, and sales volume"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[1]"
                ></component>
            </BubbleChart>
        </template>
        <template v-if="scenario === 'bubble-chart-3'">
            <BubbleChart
                data-upstream-index="0"
                id="bubble-js-example"
                label="Product Analysis"
                description="A bubble chart of products by price, rating, and volume"
            >
            </BubbleChart>
        </template>
        <template v-if="scenario === 'bubble-chart-4'">
            <BubbleChart
                data-upstream-index="0"
                id="bubble-tooltips"
                x-label="Price"
                y-label="Rating"
                label="Menu Performance"
                description="A bubble chart whose tooltips name each drink and its sales instead of showing raw coordinates"
            >
            </BubbleChart>
        </template>
        <template v-if="scenario === 'bubble-chart-5'">
            <BubbleChart
                data-upstream-index="0"
                id="bubble-size-example"
                label="Investment Portfolio"
                description="A bubble chart where bubble size represents investment amount"
            >
            </BubbleChart>
        </template>
        <template v-if="scenario === 'bubble-chart-6'">
            <BubbleChart
                data-upstream-index="0"
                id="bubble-multi"
                label="Industry Comparison"
                description="A bubble chart comparing metrics across two industry sectors"
            >
            </BubbleChart>
        </template>
        <template v-if="scenario === 'bubble-chart-7'">
            <BubbleChart
                data-upstream-index="0"
                id="bubble-colors"
                label="Custom Colors"
                description="A bubble chart with custom colors"
                style="
                    --fill-color-1: color-mix(in srgb, var(--wa-color-orange-60) 50%, transparent);
                    --border-color-1: var(--wa-color-orange-60);
                "
            >
            </BubbleChart>
        </template>
        <template v-if="scenario === 'bubble-chart-8'">
            <BubbleChart
                data-upstream-index="0"
                id="bubble-legend"
                legend-position="bottom"
                label="Legend at Bottom"
                description="A bubble chart with the legend at the bottom"
            >
            </BubbleChart>
        </template>
        <template v-if="scenario === 'bubble-chart-9'">
            <BubbleChart
                data-upstream-index="0"
                id="bubble-grid"
                grid="none"
                label="No Grid"
                description="A bubble chart with grid lines hidden"
            >
            </BubbleChart>
        </template>
        <template v-if="scenario === 'bubble-chart-10'">
            <BubbleChart
                data-upstream-index="0"
                id="bubble-axis"
                x-label="Cost Index"
                y-label="Quality Score"
                label="City Analysis"
                description="A bubble chart with labeled axes comparing city cost and quality"
            >
            </BubbleChart>
        </template>
        <template v-if="scenario === 'bubble-chart-11'">
            <BubbleChart
                data-upstream-index="0"
                id="bubble-disabled"
                without-tooltip
                without-animation
                label="Minimal"
                description="A bubble chart with tooltips and animations disabled"
            >
            </BubbleChart>
        </template>
    </div>
</template>

<script setup lang="ts">
import { BubbleChart } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
const markdownContents = [
    '\n    {\n      "data": {\n        "datasets": [\n          {\n            "label": "North America",\n            "data": [\n              { "x": 65, "y": 7.8, "r": 18 },\n              { "x": 50, "y": 7.0, "r": 12 },\n              { "x": 55, "y": 7.5, "r": 14 }\n            ]\n          },\n          {\n            "label": "Europe",\n            "data": [\n              { "x": 40, "y": 8.2, "r": 16 },\n              { "x": 30, "y": 7.6, "r": 10 },\n              { "x": 45, "y": 8.0, "r": 13 }\n            ]\n          }\n        ]\n      }\n    }\n  ',
    '\n    {\n      "data": {\n        "datasets": [\n          {\n            "label": "Products",\n            "data": [\n              { "x": 30, "y": 4.2, "r": 18 },\n              { "x": 50, "y": 4.5, "r": 14 },\n              { "x": 25, "y": 3.9, "r": 22 },\n              { "x": 55, "y": 4.7, "r": 10 },\n              { "x": 40, "y": 4.0, "r": 16 }\n            ]\n          }\n        ]\n      }\n    }\n  ',
];
</script>
