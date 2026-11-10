<template>
    <div>
        <template v-if="scenario === 'popup-1'">
            <div class="popup-overview">
                <Popup data-upstream-index="0" placement="top" active>
                    <span slot="anchor"></span>
                    <div class="box"></div>
                </Popup>

                <Divider data-upstream-index="1"></Divider>

                <div class="wa-cluster">
                    <div class="popup-overview-options">
                        <wa-combobox
                            label="Placement"
                            name="placement"
                            placeholder="Select placement..."
                            class="popup-overview-select"
                        ></wa-combobox>
                        <Input
                            data-upstream-index="2"
                            type="number"
                            name="distance"
                            label="distance"
                            v-model="input0"
                        ></Input>
                        <Input
                            data-upstream-index="3"
                            type="number"
                            name="skidding"
                            label="Skidding"
                            v-model="input1"
                        ></Input>
                    </div>

                    <div class="popup-overview-options">
                        <Switch data-upstream-index="4" name="active" checked>Active</Switch>
                        <Switch data-upstream-index="5" name="arrow">Arrow</Switch>
                    </div>
                </div>
            </div>
        </template>
        <template v-if="scenario === 'popup-2'">
            <div class="popup-active">
                <Popup data-upstream-index="0" placement="top" active>
                    <span slot="anchor"></span>
                    <div class="box"></div>
                </Popup>

                <Divider data-upstream-index="1"></Divider>

                <Switch data-upstream-index="2" checked>Active</Switch>
            </div>
        </template>
        <template v-if="scenario === 'popup-3'">
            <span id="external-anchor"></span>

            <Popup data-upstream-index="0" anchor="external-anchor" placement="top" active>
                <div class="box"></div>
            </Popup>
        </template>
        <template v-if="scenario === 'popup-4'">
            <div class="popup-placement">
                <Popup data-upstream-index="0" placement="top" active>
                    <span slot="anchor"></span>
                    <div class="box"></div>
                </Popup>

                <Divider data-upstream-index="1"></Divider>

                <wa-combobox
                    name="placement"
                    label="Placement"
                    placeholder="Select placement..."
                ></wa-combobox>
            </div>
        </template>
        <template v-if="scenario === 'popup-5'">
            <div class="popup-distance">
                <Popup data-upstream-index="0" placement="top" :distance="0" active>
                    <span slot="anchor"></span>
                    <div class="box"></div>
                </Popup>

                <Divider data-upstream-index="1"></Divider>

                <Slider
                    data-upstream-index="2"
                    :min="-50"
                    :max="50"
                    :step="1"
                    :value="0"
                    label="Distance"
                ></Slider>
            </div>
        </template>
        <template v-if="scenario === 'popup-6'">
            <div class="popup-skidding">
                <Popup data-upstream-index="0" placement="top" :skidding="0" active>
                    <span slot="anchor"></span>
                    <div class="box"></div>
                </Popup>

                <Divider data-upstream-index="1"></Divider>

                <Slider
                    data-upstream-index="2"
                    :min="-50"
                    :max="50"
                    :step="1"
                    :value="0"
                    label="Skidding"
                ></Slider>
            </div>
        </template>
        <template v-if="scenario === 'popup-7'">
            <div class="popup-arrow">
                <Popup
                    data-upstream-index="0"
                    placement="top"
                    arrow
                    arrow-placement="anchor"
                    :distance="8"
                    active
                >
                    <span slot="anchor"></span>
                    <div class="box"></div>
                </Popup>

                <Divider data-upstream-index="1"></Divider>

                <div class="wa-cluster">
                    <div class="popup-arrow-options">
                        <wa-combobox
                            label="Placement"
                            name="placement"
                            placeholder="Select placement..."
                            class="popup-overview-select"
                        ></wa-combobox>

                        <Select
                            data-upstream-index="2"
                            label="Arrow Placement"
                            name="arrow-placement"
                            value="anchor"
                        >
                            <Option data-upstream-index="3" value="anchor">anchor</Option>
                            <Option data-upstream-index="4" value="start">start</Option>
                            <Option data-upstream-index="5" value="end">end</Option>
                            <Option data-upstream-index="6" value="center">center</Option>
                        </Select>
                    </div>

                    <div class="popup-arrow-options">
                        <Switch data-upstream-index="7" name="arrow" checked>Arrow</Switch>
                    </div>
                </div>
            </div>
        </template>
        <template v-if="scenario === 'popup-8'">
            <div class="popup-border">
                <Popup
                    data-upstream-index="0"
                    placement="top"
                    arrow
                    arrow-placement="anchor"
                    :distance="8"
                    active
                >
                    <span slot="anchor"></span>
                    <div class="box"></div>
                </Popup>

                <Divider data-upstream-index="1"></Divider>

                <div class="popup-border-options">
                    <wa-combobox
                        label="Placement"
                        name="placement"
                        placeholder="Select placement..."
                        class="popup-overview-select"
                    ></wa-combobox>
                </div>
            </div>
        </template>
        <template v-if="scenario === 'popup-9'">
            <div class="popup-flip">
                <div class="overflow">
                    <Popup data-upstream-index="0" placement="top" flip active boundary="scroll">
                        <span slot="anchor"></span>
                        <div class="box"></div>
                    </Popup>
                </div>

                <Divider data-upstream-index="1"></Divider>

                <Switch data-upstream-index="2" checked>Flip</Switch>
            </div>
        </template>
        <template v-if="scenario === 'popup-10'">
            <div class="popup-flip-fallbacks">
                <div class="overflow">
                    <Popup
                        data-upstream-index="0"
                        placement="top"
                        flip
                        flip-fallback-placements="right bottom"
                        flip-fallback-strategy="initial"
                        active
                        boundary="scroll"
                    >
                        <span slot="anchor"></span>
                        <div class="box"></div>
                    </Popup>
                </div>
            </div>
        </template>
        <template v-if="scenario === 'popup-11'">
            <div class="popup-shift">
                <div class="overflow">
                    <Popup
                        data-upstream-index="0"
                        placement="top"
                        shift
                        :shift-padding="10"
                        active
                        boundary="scroll"
                    >
                        <span slot="anchor"></span>
                        <div class="box"></div>
                    </Popup>
                </div>

                <Divider data-upstream-index="1"></Divider>

                <Switch data-upstream-index="2" checked>Shift</Switch>
            </div>
        </template>
        <template v-if="scenario === 'popup-12'">
            <div class="popup-auto-size">
                <div class="overflow">
                    <Popup
                        data-upstream-index="0"
                        placement="top"
                        auto-size="both"
                        :auto-size-padding="10"
                        active
                        boundary="scroll"
                    >
                        <span slot="anchor"></span>
                        <div class="box"></div>
                    </Popup>
                </div>

                <Divider data-upstream-index="1"></Divider>

                <Switch data-upstream-index="2" checked>Auto-size</Switch>
            </div>
        </template>
        <template v-if="scenario === 'popup-13'">
            <div class="popup-hover-bridge">
                <Popup
                    data-upstream-index="0"
                    placement="top"
                    hover-bridge
                    :distance="10"
                    :skidding="0"
                    active
                >
                    <span slot="anchor"></span>
                    <div class="box"></div>
                </Popup>

                <Divider data-upstream-index="1"></Divider>

                <div class="wa-cluster">
                    <Switch data-upstream-index="2" checked>Hover Bridge</Switch>
                    <Slider
                        data-upstream-index="3"
                        :min="0"
                        :max="50"
                        :step="1"
                        :value="10"
                        label="Distance"
                    ></Slider>
                    <Slider
                        data-upstream-index="4"
                        :min="-50"
                        :max="50"
                        :step="1"
                        :value="0"
                        label="Skidding"
                    ></Slider>
                </div>
            </div>
        </template>
        <template v-if="scenario === 'popup-14'">
            <div class="popup-virtual-element">
                <Popup data-upstream-index="0" placement="right-start">
                    <div class="circle"></div>
                </Popup>

                <Divider data-upstream-index="1"></Divider>

                <Switch data-upstream-index="2">Highlight mouse cursor</Switch>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
    Divider,
    Input,
    Option,
    Popup,
    Select,
    Slider,
    Switch,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
const input0 = ref('0');
const input1 = ref('0');
</script>
