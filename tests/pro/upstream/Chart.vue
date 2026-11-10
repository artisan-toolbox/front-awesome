<template>
    <div>
        <template v-if="scenario === 'chart-1'">
            <Chart
                data-upstream-index="0"
                label="Monthly Performance"
                description="A chart comparing monthly revenue and expenses over six months"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[0]"
                ></component>
            </Chart>
        </template>
        <template v-if="scenario === 'chart-2'">
            <div
                style="
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(min(100%, 400px), 1fr));
                    gap: 1rem;
                "
            >
                <Chart
                    data-upstream-index="0"
                    label="Line Chart"
                    description="A line chart showing monthly visitors"
                >
                    <component
                        :is="'script'"
                        type="application/json"
                        :text-content="markdownContents[1]"
                    ></component>
                </Chart>

                <Chart
                    data-upstream-index="1"
                    label="Doughnut Chart"
                    description="A doughnut chart showing time allocation"
                    without-legend
                >
                    <component
                        :is="'script'"
                        type="application/json"
                        :text-content="markdownContents[2]"
                    ></component>
                </Chart>

                <Chart
                    data-upstream-index="2"
                    label="Radar Chart"
                    description="A radar chart showing skill levels"
                >
                    <component
                        :is="'script'"
                        type="application/json"
                        :text-content="markdownContents[3]"
                    ></component>
                </Chart>

                <Chart
                    data-upstream-index="3"
                    label="Polar Area Chart"
                    description="A polar area chart showing energy output by source"
                    without-legend
                >
                    <component
                        :is="'script'"
                        type="application/json"
                        :text-content="markdownContents[4]"
                    ></component>
                </Chart>
            </div>
        </template>
        <template v-if="scenario === 'chart-3'">
            <Chart
                data-upstream-index="0"
                label="Quarterly Results"
                description="A bar chart showing quarterly results"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[5]"
                ></component>
            </Chart>
        </template>
        <template v-if="scenario === 'chart-4'">
            <Chart
                data-upstream-index="0"
                id="chart-js-data"
                label="Quarterly Results"
                description="A bar chart showing quarterly results"
            >
            </Chart>
        </template>
        <template v-if="scenario === 'chart-5'">
            <Chart
                data-upstream-index="0"
                label="Custom Palette"
                description="A line chart with a custom purple and cyan color palette"
                style="
                    --fill-color-1: var(--wa-color-purple-60);
                    --border-color-1: var(--wa-color-purple-60);
                    --fill-color-2: var(--wa-color-cyan-60);
                    --border-color-2: var(--wa-color-cyan-60);
                "
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[6]"
                ></component>
            </Chart>
        </template>
        <template v-if="scenario === 'chart-6'">
            <div>
                <div
                    style="
                        padding: var(--wa-space-l);
                        border-radius: var(--wa-border-radius-m);
                        background-color: var(--wa-color-surface-default);
                    "
                >
                    <Chart
                        data-upstream-index="0"
                        id="theming-chart"
                        label="Weekly Signups"
                        description="A bar chart of weekly signups that re-colors when the palette changes"
                    >
                        <component
                            :is="'script'"
                            type="application/json"
                            :text-content="markdownContents[7]"
                        ></component>
                    </Chart>
                </div>

                <Divider data-upstream-index="1"></Divider>

                <Select
                    data-upstream-index="2"
                    id="theming-palette"
                    label="Palette"
                    value="default"
                    style="min-inline-size: 14ch"
                >
                    <Option data-upstream-index="3" value="default">Default</Option>
                    <Option data-upstream-index="4" value="ocean">Ocean</Option>
                    <Option data-upstream-index="5" value="sunset">Sunset</Option>
                </Select>
            </div>
        </template>
        <template v-if="scenario === 'chart-7'">
            <Chart
                data-upstream-index="0"
                label="CSS Variable Colors"
                description="A doughnut chart demonstrating CSS variable usage in dataset colors"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[8]"
                ></component>
            </Chart>
        </template>
        <template v-if="scenario === 'chart-8'">
            <Chart
                data-upstream-index="0"
                legend-position="bottom"
                label="Legend at Bottom"
                description="A bar chart with the legend positioned at the bottom"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[9]"
                ></component>
            </Chart>
        </template>
        <template v-if="scenario === 'chart-9'">
            <Chart
                data-upstream-index="0"
                x-label="Month"
                y-label="Revenue (USD)"
                label="Monthly Revenue"
                description="A line chart with axis labels showing monthly revenue"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[10]"
                ></component>
            </Chart>
        </template>
        <template v-if="scenario === 'chart-10'">
            <Chart
                data-upstream-index="0"
                :min="0"
                :max="100"
                label="Test Scores"
                description="A line chart with a constrained y-axis from 0 to 100"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[11]"
                ></component>
            </Chart>
        </template>
        <template v-if="scenario === 'chart-11'">
            <Chart
                data-upstream-index="0"
                grid="none"
                label="No Grid Lines"
                description="A line chart with grid lines hidden"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[12]"
                ></component>
            </Chart>
        </template>
        <template v-if="scenario === 'chart-12'">
            <Chart
                data-upstream-index="0"
                stacked
                label="Stacked Revenue"
                description="A stacked bar chart showing revenue by source"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[13]"
                ></component>
            </Chart>
        </template>
        <template v-if="scenario === 'chart-13'">
            <Chart
                data-upstream-index="0"
                without-animation
                without-legend
                label="Minimal Chart"
                description="A pie chart with animation and legend disabled"
            >
                <component
                    :is="'script'"
                    type="application/json"
                    :text-content="markdownContents[14]"
                ></component>
            </Chart>
        </template>
        <template v-if="scenario === 'chart-14'">
            <Chart
                data-upstream-index="0"
                id="chart-tooltips"
                x-label="Cost per click"
                y-label="Conversion rate (%)"
                label="Marketing Channels"
                description="A bubble chart whose tooltips name each channel and format its cost, conversion rate, and volume instead of showing raw coordinates"
            >
            </Chart>
        </template>
        <template v-if="scenario === 'chart-15'">
            <Chart
                data-upstream-index="0"
                id="chart-mixed"
                label="Revenue and Growth"
                description="A mixed chart with revenue as bars and growth rate as a line"
            >
            </Chart>
        </template>
        <template v-if="scenario === 'chart-16'">
            <div>
                <Chart
                    data-upstream-index="0"
                    id="chart-instance"
                    label="Live Updates"
                    description="A chart demonstrating programmatic data updates"
                >
                </Chart>

                <Divider data-upstream-index="1"></Divider>

                <div style="display: flex; gap: var(--wa-space-s); flex-wrap: wrap">
                    <Button data-upstream-index="2" appearance="filled" id="chart-add"
                        >Add point</Button
                    >
                    <Button data-upstream-index="3" appearance="filled" id="chart-remove"
                        >Remove point</Button
                    >
                    <Button data-upstream-index="4" appearance="filled" id="chart-randomize"
                        >Randomize</Button
                    >
                </div>
            </div>
        </template>
        <template v-if="scenario === 'chart-17'">
            <Chart
                data-upstream-index="0"
                id="chart-plugin"
                label="Sales with Target"
                description="A bar chart with a dashed line showing the sales target"
            >
            </Chart>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Divider,
    Option,
    Select,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
import { Chart } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
const markdownContents = [
    '\n    {\n      "type": "bar",\n      "data": {\n        "labels": ["January", "February", "March", "April", "May", "June"],\n        "datasets": [\n          {\n            "label": "Revenue",\n            "data": [48, 56, 62, 58, 71, 68]\n          },\n          {\n            "label": "Expenses",\n            "data": [35, 38, 40, 42, 45, 43]\n          }\n        ]\n      }\n    }\n  ',
    '\n      {\n        "type": "line",\n        "data": {\n          "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],\n          "datasets": [\n            {\n              "label": "Visitors",\n              "data": [4200, 4800, 5100, 4900, 5500, 6200]\n            }\n          ]\n        }\n      }\n    ',
    '\n      {\n        "type": "doughnut",\n        "data": {\n          "labels": ["Development", "Design", "Testing", "Meetings"],\n          "datasets": [\n            {\n              "label": "Hours",\n              "data": [35, 20, 15, 18]\n            }\n          ]\n        }\n      }\n    ',
    '\n      {\n        "type": "radar",\n        "data": {\n          "labels": ["Speed", "Reliability", "Ease of Use", "Features", "Support"],\n          "datasets": [\n            {\n              "label": "Product A",\n              "data": [85, 90, 75, 80, 70]\n            },\n            {\n              "label": "Product B",\n              "data": [70, 78, 92, 85, 88]\n            }\n          ]\n        }\n      }\n    ',
    '\n      {\n        "type": "polarArea",\n        "data": {\n          "labels": ["Solar", "Wind", "Hydro", "Nuclear"],\n          "datasets": [\n            {\n              "label": "Output (GW)",\n              "data": [85, 72, 110, 95]\n            }\n          ]\n        }\n      }\n    ',
    '\n    {\n      "type": "bar",\n      "data": {\n        "labels": ["Q1", "Q2", "Q3", "Q4"],\n        "datasets": [\n          {\n            "label": "Sales",\n            "data": [420, 580, 630, 710]\n          }\n        ]\n      }\n    }\n  ',
    '\n    {\n      "type": "line",\n      "data": {\n        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],\n        "datasets": [\n          {\n            "label": "Organic Traffic",\n            "data": [2200, 2800, 3100, 2900, 3500, 4200]\n          },\n          {\n            "label": "Paid Traffic",\n            "data": [1800, 2100, 1900, 2400, 2200, 2600]\n          }\n        ]\n      }\n    }\n  ',
    '\n        {\n          "type": "bar",\n          "data": {\n            "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],\n            "datasets": [\n              { "label": "Signups", "data": [120, 190, 80, 160, 220] },\n              { "label": "Trials", "data": [60, 90, 40, 100, 130] }\n            ]\n          }\n        }\n      ',
    '\n    {\n      "type": "doughnut",\n      "data": {\n        "labels": ["Desktop", "Mobile", "Tablet"],\n        "datasets": [\n          {\n            "label": "Traffic",\n            "data": [55, 35, 10],\n            "backgroundColor": ["var(--wa-color-purple-60)", "var(--wa-color-cyan-60)", "var(--wa-color-orange-60)"],\n            "borderColor": ["var(--wa-color-purple-60)", "var(--wa-color-cyan-60)", "var(--wa-color-orange-60)"]\n          }\n        ]\n      }\n    }\n  ',
    '\n    {\n      "type": "bar",\n      "data": {\n        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],\n        "datasets": [\n          {\n            "label": "Completed",\n            "data": [12, 19, 8, 15, 22]\n          },\n          {\n            "label": "Pending",\n            "data": [5, 3, 10, 7, 2]\n          }\n        ]\n      }\n    }\n  ',
    '\n    {\n      "type": "line",\n      "data": {\n        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],\n        "datasets": [\n          {\n            "label": "Revenue",\n            "data": [12000, 15000, 13500, 17000, 16000, 19000]\n          },\n          {\n            "label": "Expenses",\n            "data": [8000, 9200, 8800, 10500, 9800, 11000]\n          },\n          {\n            "label": "Profit",\n            "data": [4000, 5800, 4700, 6500, 6200, 8000]\n          }\n        ]\n      }\n    }\n  ',
    '\n    {\n      "type": "line",\n      "data": {\n        "labels": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],\n        "datasets": [\n          {\n            "label": "Completion Rate (%)",\n            "data": [62, 71, 68, 85, 78]\n          },\n          {\n            "label": "Pass Rate (%)",\n            "data": [48, 55, 60, 72, 65]\n          },\n          {\n            "label": "Satisfaction (%)",\n            "data": [74, 80, 76, 88, 83]\n          }\n        ]\n      }\n    }\n  ',
    '\n    {\n      "type": "line",\n      "data": {\n        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],\n        "datasets": [\n          {\n            "label": "Response Time (ms)",\n            "data": [45, 52, 48, 55, 50]\n          },\n          {\n            "label": "Error Rate (%)",\n            "data": [2, 4, 3, 6, 3]\n          },\n          {\n            "label": "Throughput (req/s)",\n            "data": [320, 295, 310, 280, 305]\n          }\n        ]\n      }\n    }\n  ',
    '\n    {\n      "type": "bar",\n      "data": {\n        "labels": ["Q1", "Q2", "Q3", "Q4"],\n        "datasets": [\n          {\n            "label": "Online",\n            "data": [42, 58, 63, 71]\n          },\n          {\n            "label": "In-Store",\n            "data": [65, 53, 48, 52]\n          },\n          {\n            "label": "Wholesale",\n            "data": [28, 32, 35, 40]\n          }\n        ]\n      }\n    }\n  ',
    '\n    {\n      "type": "pie",\n      "data": {\n        "labels": ["Rent", "Food", "Transport", "Savings"],\n        "datasets": [\n          {\n            "label": "Budget",\n            "data": [35, 25, 15, 25]\n          }\n        ]\n      }\n    }\n  ',
];
</script>
