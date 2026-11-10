<template>
    <div>
        <template v-if="scenario === 'copy-button-1'">
            <CopyButton data-upstream-index="0" value="https://webawesome.com"></CopyButton>
        </template>
        <template v-if="scenario === 'copy-button-2'">
            <div class="wa-stack">
                <!-- Copies the span's textContent -->
                <div class="wa-cluster wa-align-items-center wa-gap-2xs">
                    <span id="my-phone">+1 (234) 456-7890</span>
                    <CopyButton data-upstream-index="0" from="my-phone"></CopyButton>
                </div>

                <!-- Copies the input's "value" property -->
                <div class="wa-cluster wa-align-items-center wa-gap-2xs">
                    <Input
                        data-upstream-index="1"
                        id="my-input"
                        type="text"
                        style="max-width: 300px"
                        v-model="input0"
                    ></Input>
                    <CopyButton data-upstream-index="2" from="my-input.value"></CopyButton>
                </div>

                <!-- Copies the link's "href" attribute -->
                <div class="wa-cluster wa-align-items-center wa-gap-2xs">
                    <a id="my-link" href="https://webawesome.com/">Web Awesome Website</a>
                    <CopyButton data-upstream-index="3" from="my-link[href]"></CopyButton>
                </div>
            </div>
        </template>
        <template v-if="scenario === 'copy-button-3'">
            <CopyButton
                data-upstream-index="0"
                value="Custom labels are easy"
                copy-label="Click to copy"
                success-label="You did it!"
                error-label="Whoops, your browser doesn't support this!"
            ></CopyButton>
        </template>
        <template v-if="scenario === 'copy-button-4'">
            <CopyButton data-upstream-index="0" value="Copied from a custom button">
                <Icon
                    data-upstream-index="1"
                    slot="copy-icon"
                    name="clipboard"
                    variant="regular"
                ></Icon>
                <Icon
                    data-upstream-index="2"
                    slot="success-icon"
                    name="thumbs-up"
                    variant="solid"
                ></Icon>
                <Icon data-upstream-index="3" slot="error-icon" name="xmark" variant="solid"></Icon>
            </CopyButton>
        </template>
        <template v-if="scenario === 'copy-button-5'">
            <div class="wa-stack">
                <CopyButton
                    data-upstream-index="0"
                    value="You can copy anything with a custom trigger!"
                >
                    <Button data-upstream-index="1" appearance="filled">Copy to Clipboard</Button>
                </CopyButton>

                <CopyButton data-upstream-index="2" value="https://webawesome.com">
                    <button type="button" class="wa-filled">Copy to Clipboard</button>
                </CopyButton>
            </div>
        </template>
        <template v-if="scenario === 'copy-button-6'">
            <CopyButton data-upstream-index="0" value="You can't copy me" disabled></CopyButton>
        </template>
        <template v-if="scenario === 'copy-button-7'">
            <CopyButton data-upstream-index="0" from="i-do-not-exist"></CopyButton>
        </template>
        <template v-if="scenario === 'copy-button-8'">
            <CopyButton
                data-upstream-index="0"
                value="Web Awesome rocks!"
                :feedback-duration="250"
            ></CopyButton>
        </template>
        <template v-if="scenario === 'copy-button-9'">
            <div class="wa-cluster">
                <CopyButton
                    data-upstream-index="0"
                    value="npm install @awesome.me/webawesome"
                    tooltip="full"
                ></CopyButton>
                <CopyButton
                    data-upstream-index="1"
                    value="npm install @awesome.me/webawesome"
                    tooltip="copy"
                ></CopyButton>
                <CopyButton
                    data-upstream-index="2"
                    value="npm install @awesome.me/webawesome"
                    tooltip="none"
                ></CopyButton>
            </div>
        </template>
        <template v-if="scenario === 'copy-button-10'">
            <div class="wa-cluster">
                <CopyButton
                    data-upstream-index="0"
                    value="Above"
                    tooltip-placement="top"
                ></CopyButton>
                <CopyButton
                    data-upstream-index="1"
                    value="Right"
                    tooltip-placement="right"
                ></CopyButton>
                <CopyButton
                    data-upstream-index="2"
                    value="Below"
                    tooltip-placement="bottom"
                ></CopyButton>
                <CopyButton
                    data-upstream-index="3"
                    value="Left"
                    tooltip-placement="left"
                ></CopyButton>
            </div>
        </template>
        <template v-if="scenario === 'copy-button-11'">
            <CopyButton data-upstream-index="0" value="I'm so stylish" class="custom-styles">
                <Icon data-upstream-index="1" slot="copy-icon" name="clipboard"></Icon>
                <Icon data-upstream-index="2" slot="success-icon" name="thumbs-up"></Icon>
                <Icon data-upstream-index="3" slot="error-icon" name="thumbs-down"></Icon>
            </CopyButton>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
    Button,
    CopyButton,
    Icon,
    Input,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
const input0 = ref('User input');
</script>
