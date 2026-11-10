<template>
    <div>
        <template v-if="scenario === 'checkbox-1'">
            <Checkbox data-upstream-index="0">I agree to the terms and conditions</Checkbox>
        </template>
        <template v-if="scenario === 'checkbox-2'">
            <Checkbox
                data-upstream-index="0"
                checked
                hint="You can turn this off later in settings."
                >Remember me</Checkbox
            >
        </template>
        <template v-if="scenario === 'checkbox-3'">
            <Checkbox data-upstream-index="0" checked>Remember me</Checkbox>
        </template>
        <template v-if="scenario === 'checkbox-4'">
            <Checkbox data-upstream-index="0" hint="You can turn this off later in settings."
                >Subscribe to the newsletter</Checkbox
            >
        </template>
        <template v-if="scenario === 'checkbox-5'">
            <Checkbox data-upstream-index="0" indeterminate>Select all</Checkbox>
        </template>
        <template v-if="scenario === 'checkbox-6'">
            <Checkbox data-upstream-index="0" disabled>I accept marketing emails</Checkbox>
        </template>
        <template v-if="scenario === 'checkbox-7'">
            <div class="wa-stack">
                <Checkbox data-upstream-index="0" size="xs">Extra Small</Checkbox>
                <Checkbox data-upstream-index="1" size="s">Small</Checkbox>
                <Checkbox data-upstream-index="2" size="m">Medium</Checkbox>
                <Checkbox data-upstream-index="3" size="l">Large</Checkbox>
                <Checkbox data-upstream-index="4" size="xl">Extra Large</Checkbox>
            </div>
        </template>
        <template v-if="scenario === 'checkbox-8'">
            <form class="custom-validity">
                <Checkbox data-upstream-index="0">Check me</Checkbox>
                <br />
                <Button
                    data-upstream-index="1"
                    appearance="filled"
                    type="submit"
                    variant="neutral"
                    style="margin-top: 1rem"
                    >Submit</Button
                >
            </form>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, Checkbox } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
