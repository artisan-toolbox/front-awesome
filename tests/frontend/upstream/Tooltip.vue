<template>
    <div>
        <template v-if="scenario === 'tooltip-1'">
            <Tooltip data-upstream-index="0" for="my-button">This is a tooltip</Tooltip>
            <Button data-upstream-index="1" appearance="filled" id="my-button">Hover Me</Button>
        </template>
        <template v-if="scenario === 'tooltip-2'">
            <div class="tooltip-placement-example">
                <div class="tooltip-placement-example-row">
                    <Button
                        data-upstream-index="0"
                        appearance="filled"
                        id="tooltip-top-start"
                    ></Button>
                    <Button data-upstream-index="1" appearance="filled" id="tooltip-top"></Button>
                    <Button
                        data-upstream-index="2"
                        appearance="filled"
                        id="tooltip-top-end"
                    ></Button>
                </div>

                <div class="tooltip-placement-example-row">
                    <Button
                        data-upstream-index="3"
                        appearance="filled"
                        id="tooltip-left-start"
                    ></Button>
                    <Button
                        data-upstream-index="4"
                        appearance="filled"
                        id="tooltip-right-start"
                    ></Button>
                </div>

                <div class="tooltip-placement-example-row">
                    <Button data-upstream-index="5" appearance="filled" id="tooltip-left"></Button>
                    <Button data-upstream-index="6" appearance="filled" id="tooltip-right"></Button>
                </div>

                <div class="tooltip-placement-example-row">
                    <Button
                        data-upstream-index="7"
                        appearance="filled"
                        id="tooltip-left-end"
                    ></Button>
                    <Button
                        data-upstream-index="8"
                        appearance="filled"
                        id="tooltip-right-end"
                    ></Button>
                </div>

                <div class="tooltip-placement-example-row">
                    <Button
                        data-upstream-index="9"
                        appearance="filled"
                        id="tooltip-bottom-start"
                    ></Button>
                    <Button
                        data-upstream-index="10"
                        appearance="filled"
                        id="tooltip-bottom"
                    ></Button>
                    <Button
                        data-upstream-index="11"
                        appearance="filled"
                        id="tooltip-bottom-end"
                    ></Button>
                </div>
            </div>

            <Tooltip data-upstream-index="12" for="tooltip-top-start" placement="top-start"
                >top-start</Tooltip
            >
            <Tooltip data-upstream-index="13" for="tooltip-top" placement="top">top</Tooltip>
            <Tooltip data-upstream-index="14" for="tooltip-top-end" placement="top-end"
                >top-end</Tooltip
            >
            <Tooltip data-upstream-index="15" for="tooltip-left-start" placement="left-start"
                >left-start</Tooltip
            >
            <Tooltip data-upstream-index="16" for="tooltip-right-start" placement="right-start"
                >right-start</Tooltip
            >
            <Tooltip data-upstream-index="17" for="tooltip-left" placement="left">left</Tooltip>
            <Tooltip data-upstream-index="18" for="tooltip-right" placement="right">right</Tooltip>
            <Tooltip data-upstream-index="19" for="tooltip-left-end" placement="left-end"
                >left-end</Tooltip
            >
            <Tooltip data-upstream-index="20" for="tooltip-right-end" placement="right-end"
                >right-end</Tooltip
            >
            <Tooltip data-upstream-index="21" for="tooltip-bottom-start" placement="bottom-start"
                >bottom-start</Tooltip
            >
            <Tooltip data-upstream-index="22" for="tooltip-bottom" placement="bottom"
                >bottom</Tooltip
            >
            <Tooltip data-upstream-index="23" for="tooltip-bottom-end" placement="bottom-end"
                >bottom-end</Tooltip
            >
        </template>
        <template v-if="scenario === 'tooltip-3'">
            <Button data-upstream-index="0" appearance="filled" id="toggle-button"
                >Click to Toggle</Button
            >
            <Tooltip data-upstream-index="1" for="toggle-button" trigger="click"
                >Click again to dismiss</Tooltip
            >
        </template>
        <template v-if="scenario === 'tooltip-4'">
            <Button data-upstream-index="0" appearance="filled" id="rich-tooltip">Hover me</Button>
            <Tooltip data-upstream-index="1" for="rich-tooltip">
                <div>
                    This tooltip includes <strong>formatted</strong> content, such as
                    <em>emphasis</em> and line breaks.
                </div>
            </Tooltip>
        </template>
        <template v-if="scenario === 'tooltip-5'">
            <Tooltip data-upstream-index="0" for="wrapping-tooltip" style="--max-width: 80px">
                This tooltip will wrap after only 80 pixels.
            </Tooltip>
            <Button data-upstream-index="1" appearance="filled" id="wrapping-tooltip"
                >Hover me</Button
            >
        </template>
        <template v-if="scenario === 'tooltip-6'">
            <Button data-upstream-index="0" appearance="filled" id="no-arrow">No Arrow</Button>
            <Tooltip data-upstream-index="1" for="no-arrow" without-arrow
                >This is a tooltip with no arrow</Tooltip
            >
        </template>
        <template v-if="scenario === 'tooltip-7'">
            <div class="manual-trigger-example">
                <Tooltip
                    data-upstream-index="0"
                    for="manual-trigger-tooltip"
                    trigger="manual"
                    class="manual-tooltip"
                    >This is an avatar!</Tooltip
                >
                <Avatar data-upstream-index="1" id="manual-trigger-tooltip" label="User"></Avatar>

                <Divider data-upstream-index="2"></Divider>

                <Button data-upstream-index="3" appearance="filled" class="manual-toggle"
                    >Toggle Manually</Button
                >
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Avatar,
    Button,
    Divider,
    Tooltip,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
