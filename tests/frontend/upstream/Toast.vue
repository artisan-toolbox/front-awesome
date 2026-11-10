<template>
    <div>
        <template v-if="scenario === 'toast-1'">
            <div id="toast-basic">
                <Button data-upstream-index="0" appearance="filled">Show notification</Button>
                <Toast data-upstream-index="1"></Toast>
            </div>
        </template>
        <template v-if="scenario === 'toast-2'">
            <div id="toast-variant">
                <div class="wa-cluster wa-gap-xs">
                    <Button
                        data-upstream-index="0"
                        appearance="filled"
                        data-variant="neutral"
                        data-icon="gear"
                        >Neutral</Button
                    >
                    <Button
                        data-upstream-index="1"
                        appearance="filled"
                        data-variant="brand"
                        data-icon="circle-info"
                        >Brand</Button
                    >
                    <Button
                        data-upstream-index="2"
                        appearance="filled"
                        data-variant="success"
                        data-icon="check"
                        >Success</Button
                    >
                    <Button
                        data-upstream-index="3"
                        appearance="filled"
                        data-variant="warning"
                        data-icon="circle-exclamation"
                        >Warning</Button
                    >
                    <Button
                        data-upstream-index="4"
                        appearance="filled"
                        data-variant="danger"
                        data-icon="triangle-exclamation"
                        >Danger</Button
                    >
                </div>
                <Toast data-upstream-index="5"></Toast>
            </div>
        </template>
        <template v-if="scenario === 'toast-3'">
            <div id="toast-size">
                <div class="wa-cluster wa-gap-xs">
                    <Button
                        data-upstream-index="0"
                        appearance="filled"
                        data-size="xs"
                        data-icon="shrimp"
                        >Extra Small</Button
                    >
                    <Button
                        data-upstream-index="1"
                        appearance="filled"
                        data-size="s"
                        data-icon="mouse-field"
                        >Small</Button
                    >
                    <Button
                        data-upstream-index="2"
                        appearance="filled"
                        data-size="m"
                        data-icon="horse"
                        >Medium</Button
                    >
                    <Button
                        data-upstream-index="3"
                        appearance="filled"
                        data-size="l"
                        data-icon="elephant"
                        >Large</Button
                    >
                    <Button
                        data-upstream-index="4"
                        appearance="filled"
                        data-size="xl"
                        data-icon="whale"
                        >Extra Large</Button
                    >
                </div>
                <Toast data-upstream-index="5"></Toast>
            </div>
        </template>
        <template v-if="scenario === 'toast-4'">
            <div id="toast-icons">
                <Button data-upstream-index="0" appearance="filled"
                    >Show notification with icon</Button
                >
                <Toast data-upstream-index="1"></Toast>
            </div>
        </template>
        <template v-if="scenario === 'toast-5'">
            <div id="toast-icons-advanced">
                <div class="wa-cluster wa-gap-xs">
                    <Button data-upstream-index="0" appearance="filled">Duotone icon</Button>
                    <Button data-upstream-index="1" appearance="filled">Brand icon</Button>
                </div>
                <Toast data-upstream-index="2"></Toast>
            </div>
        </template>
        <template v-if="scenario === 'toast-6'">
            <div id="toast-duration">
                <div class="wa-cluster wa-gap-xs">
                    <Button data-upstream-index="0" appearance="filled" data-duration="3000"
                        >3 seconds</Button
                    >
                    <Button data-upstream-index="1" appearance="filled" data-duration="10000"
                        >10 seconds</Button
                    >
                    <Button data-upstream-index="2" appearance="filled" data-duration="0"
                        >Until dismissed</Button
                    >
                </div>
                <Toast data-upstream-index="3"></Toast>
            </div>
        </template>
        <template v-if="scenario === 'toast-7'">
            <div id="toast-placement">
                <Select data-upstream-index="0" label="Placement" value="top-end">
                    <Option data-upstream-index="1" value="top-start">top-start</Option>
                    <Option data-upstream-index="2" value="top-center">top-center</Option>
                    <Option data-upstream-index="3" value="top-end">top-end</Option>
                    <Option data-upstream-index="4" value="bottom-start">bottom-start</Option>
                    <Option data-upstream-index="5" value="bottom-center">bottom-center</Option>
                    <Option data-upstream-index="6" value="bottom-end">bottom-end</Option>
                </Select>
                <br />
                <Button data-upstream-index="7" appearance="filled">Show notification</Button>
                <Toast data-upstream-index="8" placement="top-end"></Toast>
            </div>
        </template>
        <template v-if="scenario === 'toast-8'">
            <div id="toast-pause">
                <Button data-upstream-index="0" appearance="filled"
                    >Show notification (hover to pause)</Button
                >
                <Toast data-upstream-index="1"></Toast>
            </div>
        </template>
        <template v-if="scenario === 'toast-9'">
            <div id="toast-html">
                <Button data-upstream-index="0" appearance="filled"
                    >Show notification with HTML</Button
                >
                <Toast data-upstream-index="1"></Toast>
            </div>
        </template>
        <template v-if="scenario === 'toast-10'">
            <div id="toast-custom-button">
                <Button data-upstream-index="0" appearance="filled"
                    >Show notification with button</Button
                >
                <Toast data-upstream-index="1"></Toast>
            </div>
        </template>
        <template v-if="scenario === 'toast-11'">
            <div id="toast-events">
                <Button data-upstream-index="0" appearance="filled">Show notification</Button>
                <Toast data-upstream-index="1"></Toast>
            </div>
        </template>
        <template v-if="scenario === 'toast-12'">
            <div id="toast-append">
                <Button data-upstream-index="0" appearance="filled"
                    >Create toast item manually</Button
                >
                <Toast data-upstream-index="1"></Toast>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Option,
    Select,
    Toast,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
