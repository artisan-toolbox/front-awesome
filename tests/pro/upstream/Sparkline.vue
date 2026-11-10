<template>
    <div>
        <template v-if="scenario === 'sparkline-1'">
            <Sparkline
                data-upstream-index="0"
                label="Weekly sales performance showing growth"
                data="10 25 15 40 30 45 35"
                style="height: 2rem"
            ></Sparkline>
        </template>
        <template v-if="scenario === 'sparkline-2'">
            <p>
                Daily Wordle guesses
                <Sparkline
                    data-upstream-index="0"
                    label="Daily Wordle guess counts trending down over the week"
                    data="5 4 4 3 4 2 3"
                ></Sparkline>
                are trending down.
            </p>
        </template>
        <template v-if="scenario === 'sparkline-3'">
            <div class="wa-cluster wa-gap-l">
                <Sparkline
                    data-upstream-index="0"
                    appearance="solid"
                    data="10 20 15 25 20 30"
                    label="Solid appearance example"
                    style="height: 2rem"
                ></Sparkline>

                <Sparkline
                    data-upstream-index="1"
                    appearance="gradient"
                    data="10 20 15 25 20 30"
                    label="Gradient appearance example"
                    style="height: 2rem"
                ></Sparkline>

                <Sparkline
                    data-upstream-index="2"
                    appearance="line"
                    data="10 20 15 25 20 30"
                    label="Line appearance example"
                    style="height: 2rem"
                ></Sparkline>
            </div>
        </template>
        <template v-if="scenario === 'sparkline-4'">
            <div class="wa-cluster wa-gap-l">
                <div>
                    <Sparkline
                        data-upstream-index="0"
                        trend="positive"
                        appearance="gradient"
                        data="20 25 22 30 35 40 50"
                        label="Revenue showing positive growth"
                        style="height: 2rem"
                    ></Sparkline>
                    <div class="wa-caption-s" style="text-align: center; margin-block-start: 1rem">
                        Revenue +25%
                    </div>
                </div>
                <div>
                    <Sparkline
                        data-upstream-index="1"
                        trend="negative"
                        appearance="gradient"
                        data="50 45 48 40 35 30 25"
                        label="Churn rate showing negative trend"
                        style="height: 2rem"
                    ></Sparkline>
                    <div class="wa-caption-s" style="text-align: center; margin-block-start: 1rem">
                        Churn -15%
                    </div>
                </div>
                <div>
                    <Sparkline
                        data-upstream-index="2"
                        trend="neutral"
                        appearance="gradient"
                        data="30 32 28 31 29 30 31"
                        label="Active users showing stable trend"
                        style="height: 2rem"
                    ></Sparkline>
                    <div class="wa-caption-s" style="text-align: center; margin-block-start: 1rem">
                        Users stable
                    </div>
                </div>
            </div>
        </template>
        <template v-if="scenario === 'sparkline-5'">
            <div class="wa-cluster wa-gap-l">
                <Sparkline
                    data-upstream-index="0"
                    curve="linear"
                    appearance="gradient"
                    data="10 40 20 50 30 60"
                    label="Linear interpolation example"
                    style="height: 2rem"
                ></Sparkline>

                <Sparkline
                    data-upstream-index="1"
                    curve="natural"
                    appearance="gradient"
                    data="10 40 20 50 30 60"
                    label="Natural curve interpolation example"
                    style="height: 2rem"
                ></Sparkline>

                <Sparkline
                    data-upstream-index="2"
                    curve="step"
                    appearance="gradient"
                    data="10 40 20 50 30 60"
                    label="Step interpolation example"
                    style="height: 2rem"
                ></Sparkline>
            </div>
        </template>
        <template v-if="scenario === 'sparkline-6'">
            <Sparkline
                data-upstream-index="0"
                appearance="gradient"
                curve="natural"
                data="10 15 12 18 22 20 28 25 32 30 35"
                label="Full-width sparkline showing monthly metrics"
                style="width: 100%; height: 6rem"
            ></Sparkline>
        </template>
        <template v-if="scenario === 'sparkline-7'">
            <Sparkline
                data-upstream-index="0"
                appearance="gradient"
                data="10 20 15 25 20 30"
                label="Custom purple sparkline"
                style="
                    height: 3rem;
                    --line-color: var(--wa-color-purple-50);
                    --fill-color: var(--wa-color-purple-50);
                    --line-width: 3;
                "
            ></Sparkline>
        </template>
        <template v-if="scenario === 'sparkline-8'">
            <table class="wa-native">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Trend</th>
                        <th>Change</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Page Views</td>
                        <td>
                            <Sparkline
                                data-upstream-index="0"
                                trend="positive"
                                data="1200 1350 1280 1420 1580"
                                label="Page views trend"
                            ></Sparkline>
                        </td>
                        <td><Badge data-upstream-index="1" variant="success">+31%</Badge></td>
                    </tr>
                    <tr>
                        <td>Bounce Rate</td>
                        <td>
                            <Sparkline
                                data-upstream-index="2"
                                trend="negative"
                                data="45 42 48 38 35"
                                label="Bounce rate trend"
                            ></Sparkline>
                        </td>
                        <td><Badge data-upstream-index="3" variant="danger">+8%</Badge></td>
                    </tr>
                    <tr>
                        <td>Avg. Session</td>
                        <td>
                            <Sparkline
                                data-upstream-index="4"
                                trend="neutral"
                                data="180 175 182 178 180"
                                label="Average session duration"
                            ></Sparkline>
                        </td>
                        <td><Badge data-upstream-index="5" variant="neutral">0%</Badge></td>
                    </tr>
                </tbody>
            </table>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Badge } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import { Sparkline } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
</script>
