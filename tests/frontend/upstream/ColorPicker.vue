<template>
    <div>
        <template v-if="scenario === 'color-picker-1'">
            <ColorPicker data-upstream-index="0" label="Select a color"></ColorPicker>
        </template>
        <template v-if="scenario === 'color-picker-2'">
            <ColorPicker data-upstream-index="0" label="Brand color"></ColorPicker>
        </template>
        <template v-if="scenario === 'color-picker-3'">
            <ColorPicker
                data-upstream-index="0"
                label="Accent"
                hint="Pick something with enough contrast to read against white."
            ></ColorPicker>
        </template>
        <template v-if="scenario === 'color-picker-4'">
            <ColorPicker
                data-upstream-index="0"
                value="#4a90e2"
                label="Select a color"
            ></ColorPicker>
        </template>
        <template v-if="scenario === 'color-picker-5'">
            <div class="wa-grid" style="--min-column-size: 12ch">
                <ColorPicker
                    data-upstream-index="0"
                    format="hex"
                    value="#4a90e2"
                    label="Pick a hex color"
                ></ColorPicker>
                <ColorPicker
                    data-upstream-index="1"
                    format="rgb"
                    value="rgb(80, 227, 194)"
                    label="Pick an RGB color"
                ></ColorPicker>
                <ColorPicker
                    data-upstream-index="2"
                    format="hsl"
                    value="hsl(290, 87%, 47%)"
                    label="Pick an HSL color"
                ></ColorPicker>
                <ColorPicker
                    data-upstream-index="3"
                    format="hsv"
                    value="hsv(55, 89%, 97%)"
                    label="Pick an HSV color"
                ></ColorPicker>
            </div>
        </template>
        <template v-if="scenario === 'color-picker-6'">
            <ColorPicker
                data-upstream-index="0"
                value="#f5a623ff"
                opacity
                label="Select a color"
            ></ColorPicker>
        </template>
        <template v-if="scenario === 'color-picker-7'">
            <ColorPicker
                data-upstream-index="0"
                value="#4a90e2"
                uppercase
                label="Select a color"
            ></ColorPicker>
        </template>
        <template v-if="scenario === 'color-picker-8'">
            <ColorPicker
                data-upstream-index="0"
                label="Select a color"
                swatches="
    #d0021b; #f5a623; #f8e71c; #8b572a; #7ed321; #417505; #bd10e0; #9013fe;
    #4a90e2; #50e3c2; #b8e986; #000; #444; #888; #ccc; #fff;
  "
            ></ColorPicker>
        </template>
        <template v-if="scenario === 'color-picker-9'">
            <ColorPicker
                data-upstream-index="0"
                label="Select a color"
                opacity
                swatches="transparent; #d0021b; #f5a623; #f8e71c; #7ed321; #4a90e2; #9013fe; #000;"
            ></ColorPicker>
        </template>
        <template v-if="scenario === 'color-picker-10'">
            <div class="wa-cluster wa-align-items-baseline">
                <ColorPicker
                    data-upstream-index="0"
                    placement="top-start"
                    label="Select a color"
                ></ColorPicker>
                <ColorPicker
                    data-upstream-index="1"
                    placement="bottom-end"
                    label="Select a color"
                ></ColorPicker>
                <ColorPicker
                    data-upstream-index="2"
                    placement="right"
                    label="Select a color"
                ></ColorPicker>
                <ColorPicker
                    data-upstream-index="3"
                    placement="left"
                    label="Select a color"
                ></ColorPicker>
            </div>
        </template>
        <template v-if="scenario === 'color-picker-11'">
            <div class="wa-cluster wa-align-items-baseline">
                <ColorPicker data-upstream-index="0" size="xs" label="Extra small"></ColorPicker>
                <ColorPicker data-upstream-index="1" size="s" label="Small"></ColorPicker>
                <ColorPicker data-upstream-index="2" size="m" label="Medium"></ColorPicker>
                <ColorPicker data-upstream-index="3" size="l" label="Large"></ColorPicker>
                <ColorPicker data-upstream-index="4" size="xl" label="Extra large"></ColorPicker>
            </div>
        </template>
        <template v-if="scenario === 'color-picker-12'">
            <ColorPicker data-upstream-index="0" disabled label="Select a color"></ColorPicker>
        </template>
        <template v-if="scenario === 'color-picker-13'">
            <div class="color-apply-demo">
                <div class="color-apply-preview">
                    <Icon data-upstream-index="0" name="palette"></Icon>
                    <div>
                        <strong>Brand preview</strong>
                        <p>Pick a color to theme this card in real time.</p>
                    </div>
                </div>

                <Divider data-upstream-index="1"></Divider>

                <ColorPicker
                    data-upstream-index="2"
                    label="Accent color"
                    value="#6e40c9"
                ></ColorPicker>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ColorPicker, Divider, Icon } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
