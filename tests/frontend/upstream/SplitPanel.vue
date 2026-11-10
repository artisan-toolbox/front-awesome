<template>
    <div>
        <template v-if="scenario === 'split-panel-1'">
            <SplitPanel data-upstream-index="0">
                <div slot="start" class="split-demo">Start</div>
                <div slot="end" class="split-demo">End</div>
            </SplitPanel>
        </template>
        <template v-if="scenario === 'split-panel-2'">
            <SplitPanel data-upstream-index="0" :position="75">
                <div slot="start" class="split-demo">Start</div>
                <div slot="end" class="split-demo">End</div>
            </SplitPanel>
        </template>
        <template v-if="scenario === 'split-panel-3'">
            <SplitPanel data-upstream-index="0" :position-in-pixels="150">
                <div slot="start" class="split-demo">Start</div>
                <div slot="end" class="split-demo">End</div>
            </SplitPanel>
        </template>
        <template v-if="scenario === 'split-panel-4'">
            <SplitPanel data-upstream-index="0" orientation="vertical" style="height: 400px">
                <div slot="start" class="split-demo" style="height: 100%">Start</div>
                <div slot="end" class="split-demo" style="height: 100%">End</div>
            </SplitPanel>
        </template>
        <template v-if="scenario === 'split-panel-5'">
            <div class="split-panel-snapping">
                <SplitPanel data-upstream-index="0" snap="100px 50%">
                    <div slot="start" class="split-demo">Start</div>
                    <div slot="end" class="split-demo">End</div>
                </SplitPanel>

                <div class="split-panel-snapping-dots"></div>
            </div>
        </template>
        <template v-if="scenario === 'split-panel-6'">
            <SplitPanel data-upstream-index="0" disabled>
                <div slot="start" class="split-demo">Start</div>
                <div slot="end" class="split-demo">End</div>
            </SplitPanel>
        </template>
        <template v-if="scenario === 'split-panel-7'">
            <div class="split-panel-primary">
                <SplitPanel data-upstream-index="0">
                    <div slot="start" class="split-demo">Start</div>
                    <div slot="end" class="split-demo">End</div>
                </SplitPanel>

                <Divider data-upstream-index="1"></Divider>

                <Select data-upstream-index="2" label="Primary Panel" style="max-width: 200px">
                    <Option data-upstream-index="3" value="" selected>None</Option>
                    <Option data-upstream-index="4" value="start">Start</Option>
                    <Option data-upstream-index="5" value="end">End</Option>
                </Select>
            </div>
        </template>
        <template v-if="scenario === 'split-panel-8'">
            <SplitPanel data-upstream-index="0" style="--min: 150px; --max: calc(100% - 150px)">
                <div slot="start" class="split-demo">Start</div>
                <div slot="end" class="split-demo">End</div>
            </SplitPanel>
        </template>
        <template v-if="scenario === 'split-panel-9'">
            <SplitPanel data-upstream-index="0">
                <div slot="start" class="split-demo" style="height: 400px">Start</div>
                <div slot="end">
                    <SplitPanel
                        data-upstream-index="1"
                        orientation="vertical"
                        style="height: 400px"
                    >
                        <div slot="start" class="split-demo" style="height: 100%">Top</div>
                        <div slot="end" class="split-demo" style="height: 100%">Bottom</div>
                    </SplitPanel>
                </div>
            </SplitPanel>
        </template>
        <template v-if="scenario === 'split-panel-10'">
            <SplitPanel data-upstream-index="0" style="--divider-width: 20px">
                <Icon
                    data-upstream-index="1"
                    slot="divider"
                    name="grip-vertical"
                    variant="solid"
                ></Icon>
                <div slot="start" class="split-demo">Start</div>
                <div slot="end" class="split-demo">End</div>
            </SplitPanel>
        </template>
        <template v-if="scenario === 'split-panel-11'">
            <div class="split-panel-divider">
                <SplitPanel data-upstream-index="0">
                    <Icon
                        data-upstream-index="1"
                        slot="divider"
                        name="grip-vertical"
                        variant="solid"
                    ></Icon>
                    <div slot="start" class="split-demo">Start</div>
                    <div slot="end" class="split-demo">End</div>
                </SplitPanel>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Divider,
    Icon,
    Option,
    Select,
    SplitPanel,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
