<template>
    <div>
        <template v-if="scenario === 'slider-1'">
            <Slider
                data-upstream-index="0"
                label="Number of users"
                hint="Limit six per team"
                name="value"
                :value="3"
                :min="0"
                :max="6"
                with-markers
                with-tooltip
            >
                <span slot="reference">Less</span>
                <span slot="reference">More</span>
            </Slider>
        </template>
        <template v-if="scenario === 'slider-2'">
            <Slider
                data-upstream-index="0"
                label="Number of users"
                hint="Limit six per team"
                :value="3"
                :min="0"
                :max="6"
            >
                <span slot="reference">Less</span>
                <span slot="reference">More</span>
            </Slider>
        </template>
        <template v-if="scenario === 'slider-3'">
            <Slider data-upstream-index="0" label="Volume" :min="0" :max="100"></Slider>
        </template>
        <template v-if="scenario === 'slider-4'">
            <Slider
                data-upstream-index="0"
                label="Volume"
                hint="Controls the volume of the current song."
                :min="0"
                :max="100"
                :value="50"
            ></Slider>
        </template>
        <template v-if="scenario === 'slider-5'">
            <Slider
                data-upstream-index="0"
                label="Between zero and one"
                :min="0"
                :max="1"
                :step="0.1"
                :value="0.5"
                with-tooltip
            ></Slider>
        </template>
        <template v-if="scenario === 'slider-6'">
            <Slider
                data-upstream-index="0"
                label="Quality"
                name="quality"
                :min="0"
                :max="100"
                :value="50"
                with-tooltip
            ></Slider>
        </template>
        <template v-if="scenario === 'slider-7'">
            <Slider
                data-upstream-index="0"
                label="Size"
                name="size"
                :min="0"
                :max="8"
                :value="4"
                with-markers
            ></Slider>
        </template>
        <template v-if="scenario === 'slider-8'">
            <Slider
                data-upstream-index="0"
                label="Speed"
                name="speed"
                :min="1"
                :max="5"
                :value="3"
                with-markers
                hint="Controls the speed of the thing you're currently doing."
            >
                <span slot="reference">Slow</span>
                <span slot="reference">Medium</span>
                <span slot="reference">Fast</span>
            </Slider>
        </template>
        <template v-if="scenario === 'slider-9'">
            <Slider
                data-upstream-index="0"
                label="Price Range"
                hint="Select minimum and maximum price"
                name="price"
                range
                :min="0"
                :max="100"
                :min-value="20"
                :max-value="80"
                with-tooltip
                id="slider__range"
            >
                <span slot="reference">$0</span>
                <span slot="reference">$50</span>
                <span slot="reference">$100</span>
            </Slider>
        </template>
        <template v-if="scenario === 'slider-10'">
            <div style="display: flex; gap: 1rem">
                <Slider
                    data-upstream-index="0"
                    orientation="vertical"
                    label="Volume"
                    name="volume"
                    :value="65"
                    style="width: 80px"
                ></Slider>

                <Slider
                    data-upstream-index="1"
                    orientation="vertical"
                    label="Bass"
                    name="bass"
                    :value="50"
                    style="width: 80px"
                ></Slider>

                <Slider
                    data-upstream-index="2"
                    orientation="vertical"
                    label="Treble"
                    name="treble"
                    :value="40"
                    style="width: 80px"
                ></Slider>
            </div>
        </template>
        <template v-if="scenario === 'slider-11'">
            <div style="height: 300px; display: flex; align-items: center; gap: 2rem">
                <Slider
                    data-upstream-index="0"
                    label="Temperature Range"
                    orientation="vertical"
                    range
                    :min="0"
                    :max="100"
                    :min-value="30"
                    :max-value="70"
                    with-tooltip
                    tooltip-placement="right"
                    id="slider__vertical-range"
                >
                </Slider>
            </div>
        </template>
        <template v-if="scenario === 'slider-12'">
            <div class="wa-stack">
                <Slider data-upstream-index="0" size="xs" :value="50" label="Extra small"></Slider>
                <Slider data-upstream-index="1" size="s" :value="50" label="Small"></Slider>
                <Slider data-upstream-index="2" size="m" :value="50" label="Medium"></Slider>
                <Slider data-upstream-index="3" size="l" :value="50" label="Large"></Slider>
                <Slider data-upstream-index="4" size="xl" :value="50" label="Extra large"></Slider>
            </div>
        </template>
        <template v-if="scenario === 'slider-13'">
            <Slider
                data-upstream-index="0"
                label="User Friendliness"
                hint="Did you find our product easy to use?"
                name="value"
                :value="0"
                :min="-5"
                :max="5"
                :indicator-offset="0"
                with-markers
                with-tooltip
            >
                <span slot="reference">Easy</span>
                <span slot="reference">Moderate</span>
                <span slot="reference">Difficult</span>
            </Slider>
        </template>
        <template v-if="scenario === 'slider-14'">
            <Slider data-upstream-index="0" label="Disabled" :value="50" disabled></Slider>
        </template>
        <template v-if="scenario === 'slider-15'">
            <Slider
                data-upstream-index="0"
                label="Server load"
                :value="72"
                :min="0"
                :max="100"
                with-tooltip
                readonly
            ></Slider>
        </template>
        <template v-if="scenario === 'slider-16'">
            <!-- Percent -->
            <Slider
                data-upstream-index="0"
                id="slider__percent"
                label="Percentage"
                name="percentage"
                :value="0.5"
                :min="0"
                :max="1"
                :step="0.01"
                with-tooltip
            ></Slider
            ><br />

            <!-- Duration -->
            <Slider
                data-upstream-index="1"
                id="slider__duration"
                label="Duration"
                name="duration"
                :value="12"
                :min="0"
                :max="24"
                with-tooltip
            ></Slider
            ><br />

            <!-- Currency -->
            <Slider
                data-upstream-index="2"
                id="slider__currency"
                label="Currency"
                name="currency"
                :min="0"
                :max="100"
                :value="50"
                with-tooltip
            ></Slider>
        </template>
        <template v-if="scenario === 'slider-17'">
            <div class="text-size-demo">
                <p class="text-size-preview">The quick brown fox jumps over the lazy dog.</p>

                <Divider data-upstream-index="0"></Divider>

                <Slider
                    data-upstream-index="1"
                    label="Text size"
                    :min="12"
                    :max="48"
                    :value="18"
                    with-tooltip
                ></Slider>
            </div>
        </template>
        <template v-if="scenario === 'slider-18'">
            <div class="price-filter-demo">
                <ul class="price-filter-list">
                    <li data-price="15">Sticker pack — $15</li>
                    <li data-price="30">T-shirt — $30</li>
                    <li data-price="55">Hoodie — $55</li>
                    <li data-price="80">Backpack — $80</li>
                    <li data-price="120">Jacket — $120</li>
                </ul>

                <Divider data-upstream-index="0"></Divider>

                <Slider
                    data-upstream-index="1"
                    id="price-filter"
                    label="Price range"
                    range
                    :min="0"
                    :max="150"
                    :min-value="0"
                    :max-value="150"
                    with-tooltip
                ></Slider>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Divider, Slider } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
