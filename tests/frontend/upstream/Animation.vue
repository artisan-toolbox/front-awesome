<template>
    <div>
        <template v-if="scenario === 'animation-1'">
            <div class="animation-overview">
                <Animation data-upstream-index="0" name="bounce" :duration="2000" play
                    ><div class="box"></div
                ></Animation>
                <Animation data-upstream-index="1" name="jello" :duration="2000" play
                    ><div class="box"></div
                ></Animation>
                <Animation data-upstream-index="2" name="heartBeat" :duration="2000" play
                    ><div class="box"></div
                ></Animation>
                <Animation data-upstream-index="3" name="flip" :duration="2000" play
                    ><div class="box"></div
                ></Animation>
            </div>
        </template>
        <template v-if="scenario === 'animation-2'">
            <div class="animation-sandbox">
                <Animation
                    data-upstream-index="0"
                    name="bounce"
                    easing="ease-in-out"
                    :duration="2000"
                    play
                >
                    <div class="box"></div>
                </Animation>

                <Divider data-upstream-index="1"></Divider>

                <div class="controls">
                    <Select data-upstream-index="2" label="Animation" value="bounce"></Select>
                    <Select data-upstream-index="3" label="Easing" value="linear"></Select>
                    <Input
                        data-upstream-index="4"
                        label="Playback Rate"
                        type="number"
                        :min="0"
                        :max="2"
                        :step="0.25"
                        v-model="input0"
                    ></Input>
                </div>
            </div>
        </template>
        <template v-if="scenario === 'animation-3'">
            <div class="animation-scroll">
                <Animation
                    data-upstream-index="0"
                    name="jackInTheBox"
                    :duration="2000"
                    :iterations="1"
                    ><div class="box"></div
                ></Animation>
            </div>
        </template>
        <template v-if="scenario === 'animation-4'">
            <div class="animation-keyframes">
                <Animation data-upstream-index="0" easing="ease-in-out" :duration="2000" play>
                    <div class="box"></div>
                </Animation>
            </div>
        </template>
        <template v-if="scenario === 'animation-5'">
            <div class="animation-form">
                <Animation
                    data-upstream-index="0"
                    name="rubberBand"
                    :duration="1000"
                    :iterations="1"
                >
                    <Button data-upstream-index="1" appearance="filled" variant="brand"
                        >Click me</Button
                    >
                </Animation>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
    Animation,
    Button,
    Divider,
    Input,
    Select,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
const input0 = ref('1');
</script>
