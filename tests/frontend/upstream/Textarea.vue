<template>
    <div>
        <template v-if="scenario === 'textarea-1'">
            <Textarea data-upstream-index="0" label="Feedback"></Textarea>
        </template>
        <template v-if="scenario === 'textarea-2'">
            <Textarea data-upstream-index="0" label="Comments"></Textarea>
        </template>
        <template v-if="scenario === 'textarea-3'">
            <Textarea
                data-upstream-index="0"
                label="Feedback"
                hint="Please tell us what you think."
            ></Textarea>
        </template>
        <template v-if="scenario === 'textarea-4'">
            <Textarea
                data-upstream-index="0"
                label="Comments"
                placeholder="Share your thoughts"
            ></Textarea>
        </template>
        <template v-if="scenario === 'textarea-5'">
            <div class="wa-stack">
                <Textarea
                    data-upstream-index="0"
                    appearance="outlined"
                    placeholder="outlined"
                ></Textarea>
                <Textarea
                    data-upstream-index="1"
                    appearance="filled"
                    placeholder="filled"
                ></Textarea>
                <Textarea
                    data-upstream-index="2"
                    appearance="filled-outlined"
                    placeholder="filled-outlined"
                ></Textarea>
            </div>
        </template>
        <template v-if="scenario === 'textarea-6'">
            <Textarea data-upstream-index="0" placeholder="Disabled" disabled></Textarea>
        </template>
        <template v-if="scenario === 'textarea-7'">
            <Textarea
                data-upstream-index="0"
                label="Release notes"
                value="Fixed a handful of bugs and polished the edges."
                readonly
            ></Textarea>
        </template>
        <template v-if="scenario === 'textarea-8'">
            <div class="wa-stack">
                <Textarea data-upstream-index="0" size="xs" placeholder="Extra small"></Textarea>
                <Textarea data-upstream-index="1" size="s" placeholder="Small"></Textarea>
                <Textarea data-upstream-index="2" size="m" placeholder="Medium"></Textarea>
                <Textarea data-upstream-index="3" size="l" placeholder="Large"></Textarea>
                <Textarea data-upstream-index="4" size="xl" placeholder="Extra large"></Textarea>
            </div>
        </template>
        <template v-if="scenario === 'textarea-9'">
            <Textarea data-upstream-index="0" :rows="2"></Textarea>
        </template>
        <template v-if="scenario === 'textarea-10'">
            <Textarea data-upstream-index="0" label="Feedback" resize="vertical"></Textarea>
        </template>
        <template v-if="scenario === 'textarea-11'">
            <Textarea data-upstream-index="0" label="Comments" resize="auto"></Textarea>
        </template>
        <template v-if="scenario === 'textarea-12'">
            <div class="wa-stack">
                <Textarea
                    data-upstream-index="0"
                    label="Comments"
                    hint="Share your thoughts with us"
                    with-count
                ></Textarea>
                <Textarea
                    data-upstream-index="1"
                    label="Bio"
                    hint="Tell us a little about yourself"
                    with-count
                    :maxlength="100"
                ></Textarea>
            </div>
        </template>
        <template v-if="scenario === 'textarea-13'">
            <Textarea data-upstream-index="0" value="Write something awesome!"></Textarea>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Textarea } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
