<template>
    <div>
        <template v-if="scenario === 'toast-item-1'">
            <ToastItem data-upstream-index="0" variant="brand" :duration="0">
                <Icon data-upstream-index="1" slot="icon" name="bell"></Icon>
                This is how a toast item looks!
            </ToastItem>
        </template>
        <template v-if="scenario === 'toast-item-2'">
            <div class="wa-stack">
                <ToastItem data-upstream-index="0" variant="neutral" :duration="0">
                    <Icon data-upstream-index="1" slot="icon" name="gear"></Icon>
                    Neutral variant (default)
                </ToastItem>

                <ToastItem data-upstream-index="2" variant="brand" :duration="0">
                    <Icon data-upstream-index="3" slot="icon" name="circle-info"></Icon>
                    Brand variant
                </ToastItem>

                <ToastItem data-upstream-index="4" variant="success" :duration="0">
                    <Icon data-upstream-index="5" slot="icon" name="check"></Icon>
                    Success variant
                </ToastItem>

                <ToastItem data-upstream-index="6" variant="warning" :duration="0">
                    <Icon data-upstream-index="7" slot="icon" name="circle-exclamation"></Icon>
                    Warning variant
                </ToastItem>

                <ToastItem data-upstream-index="8" variant="danger" :duration="0">
                    <Icon data-upstream-index="9" slot="icon" name="triangle-exclamation"></Icon>
                    Danger variant
                </ToastItem>
            </div>
        </template>
        <template v-if="scenario === 'toast-item-3'">
            <div class="wa-stack">
                <ToastItem data-upstream-index="0" size="xs" :duration="0">
                    <Icon data-upstream-index="1" slot="icon" name="shrimp"></Icon>
                    Extra Small
                </ToastItem>

                <ToastItem data-upstream-index="2" size="s" :duration="0">
                    <Icon data-upstream-index="3" slot="icon" name="mouse-field"></Icon>
                    Small
                </ToastItem>

                <ToastItem data-upstream-index="4" size="m" :duration="0">
                    <Icon data-upstream-index="5" slot="icon" name="horse"></Icon>
                    Medium (default)
                </ToastItem>

                <ToastItem data-upstream-index="6" size="l" :duration="0">
                    <Icon data-upstream-index="7" slot="icon" name="elephant"></Icon>
                    Large
                </ToastItem>

                <ToastItem data-upstream-index="8" size="xl" :duration="0">
                    <Icon data-upstream-index="9" slot="icon" name="whale"></Icon>
                    Extra Large
                </ToastItem>
            </div>
        </template>
        <template v-if="scenario === 'toast-item-4'">
            <div class="wa-stack">
                <ToastItem data-upstream-index="0" variant="success" :duration="0">
                    <Icon data-upstream-index="1" slot="icon" name="check"></Icon>
                    Your changes have been saved!
                </ToastItem>

                <ToastItem data-upstream-index="2" variant="brand" :duration="0">
                    <Icon data-upstream-index="3" slot="icon" name="envelope"></Icon>
                    You have 3 new messages
                </ToastItem>

                <ToastItem data-upstream-index="4" variant="warning" :duration="0">
                    <Icon data-upstream-index="5" slot="icon" name="clock"></Icon>
                    Your session will expire soon
                </ToastItem>
            </div>
        </template>
        <template v-if="scenario === 'toast-item-5'">
            <ToastItem data-upstream-index="0" variant="neutral" :duration="0">
                A simple notification without an icon.
            </ToastItem>
        </template>
        <template v-if="scenario === 'toast-item-6'">
            <div class="wa-stack">
                <ToastItem data-upstream-index="0" variant="brand" :duration="0">
                    <Icon data-upstream-index="1" slot="icon" name="bell"></Icon>
                    <strong>New message from Alex</strong><br />
                    Hey, are you available for a quick call?
                </ToastItem>

                <ToastItem data-upstream-index="2" variant="success" :duration="0">
                    <Icon data-upstream-index="3" slot="icon" name="cloud-arrow-up"></Icon>
                    <strong>Upload complete</strong><br />
                    <a href="#">View file</a> · <a href="#">Share</a>
                </ToastItem>

                <ToastItem data-upstream-index="4" variant="brand" :duration="0">
                    <Icon data-upstream-index="5" slot="icon" name="gift"></Icon>
                    You've earned a reward!
                    <div style="margin-block-start: var(--wa-space-xs)">
                        <Button data-upstream-index="6" variant="brand" size="s">Claim Now</Button>
                        <Button data-upstream-index="7" appearance="filled" size="s">Later</Button>
                    </div>
                </ToastItem>
            </div>
        </template>
        <template v-if="scenario === 'toast-item-7'">
            <ToastItem data-upstream-index="0" variant="brand" :duration="5000">...</ToastItem>
            <ToastItem data-upstream-index="1" variant="brand" :duration="10000">...</ToastItem>
            <ToastItem data-upstream-index="2" variant="brand" :duration="0">...</ToastItem>
        </template>
        <template v-if="scenario === 'toast-item-8'">
            <ToastItem data-upstream-index="0" variant="neutral" :duration="0">
                <Icon data-upstream-index="1" slot="icon" name="circle-info"></Icon>
                Click the close button on the right to dismiss →
            </ToastItem>
        </template>
        <template v-if="scenario === 'toast-item-9'">
            <div class="wa-stack">
                <ToastItem
                    data-upstream-index="0"
                    variant="brand"
                    :duration="0"
                    style="--accent-width: 8px"
                >
                    <Icon data-upstream-index="1" slot="icon" name="star"></Icon>
                    Thicker accent line
                </ToastItem>

                <ToastItem
                    data-upstream-index="2"
                    variant="success"
                    :duration="0"
                    style="--accent-width: 0"
                >
                    <Icon data-upstream-index="3" slot="icon" name="check"></Icon>
                    No accent line
                </ToastItem>
            </div>
        </template>
        <template v-if="scenario === 'toast-item-10'">
            <div class="wa-stack">
                <ToastItem
                    data-upstream-index="0"
                    variant="brand"
                    :duration="0"
                    style="--padding: var(--wa-space-xs)"
                >
                    <Icon data-upstream-index="1" slot="icon" name="compress"></Icon>
                    Compact padding
                </ToastItem>

                <ToastItem
                    data-upstream-index="2"
                    variant="brand"
                    :duration="0"
                    style="--padding: var(--wa-space-xl)"
                >
                    <Icon data-upstream-index="3" slot="icon" name="expand"></Icon>
                    Spacious padding
                </ToastItem>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, Icon, ToastItem } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
