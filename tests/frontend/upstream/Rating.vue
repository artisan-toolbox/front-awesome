<template>
    <div>
        <template v-if="scenario === 'rating-1'">
            <Rating data-upstream-index="0" label="Rating"></Rating>
        </template>
        <template v-if="scenario === 'rating-2'">
            <Rating data-upstream-index="0" label="Rate this component"></Rating>
        </template>
        <template v-if="scenario === 'rating-3'">
            <Rating data-upstream-index="0" label="Rating" disabled :value="3"></Rating>
        </template>
        <template v-if="scenario === 'rating-4'">
            <Rating data-upstream-index="0" label="Rating" readonly :value="3"></Rating>
        </template>
        <template v-if="scenario === 'rating-5'">
            <div class="wa-stack">
                <Rating data-upstream-index="0" label="Extra small" size="xs"></Rating>
                <Rating data-upstream-index="1" label="Small" size="s"></Rating>
                <Rating data-upstream-index="2" label="Medium" size="m"></Rating>
                <Rating data-upstream-index="3" label="Large" size="l"></Rating>
                <Rating data-upstream-index="4" label="Extra large" size="xl"></Rating>
            </div>
        </template>
        <template v-if="scenario === 'rating-6'">
            <Rating data-upstream-index="0" label="Rating" style="font-size: 3rem"></Rating>
        </template>
        <template v-if="scenario === 'rating-7'">
            <Rating data-upstream-index="0" label="Rating" :max="3"></Rating>
        </template>
        <template v-if="scenario === 'rating-8'">
            <Rating data-upstream-index="0" label="Rating" :precision="0.5" :value="2.5"></Rating>
        </template>
        <template v-if="scenario === 'rating-9'">
            <Rating
                data-upstream-index="0"
                label="Rating"
                class="rating-hearts"
                style="--symbol-color-active: #ff4136"
            ></Rating>
        </template>
        <template v-if="scenario === 'rating-10'">
            <Rating data-upstream-index="0" label="Rating" class="rating-emojis"></Rating>
        </template>
        <template v-if="scenario === 'rating-11'">
            <div class="detect-hover">
                <Rating data-upstream-index="0" label="Rating"></Rating>
                <span></span>
            </div>
        </template>
        <template v-if="scenario === 'rating-12'">
            <form class="rating-required">
                <Rating data-upstream-index="0" label="Rating" required></Rating>
                <br /><br />
                <Button data-upstream-index="1" appearance="filled" type="submit">Submit</Button>
            </form>
        </template>
        <template v-if="scenario === 'rating-13'">
            <form class="rating-custom-validity">
                <Rating data-upstream-index="0" label="Rating"></Rating>
                <br /><br />
                <Button data-upstream-index="1" appearance="filled" type="submit">Submit</Button>
            </form>
        </template>
        <template v-if="scenario === 'rating-14'">
            <form class="rating-form-submission" action="about:blank" method="get" target="_blank">
                <Rating
                    data-upstream-index="0"
                    name="rating"
                    label="How would you rate your experience?"
                    required
                ></Rating>
                <br /><br />
                <Button data-upstream-index="1" type="submit">Submit</Button>
                <Button data-upstream-index="2" appearance="filled" type="reset" variant="neutral"
                    >Reset</Button
                >
            </form>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, Rating } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
