<template>
    <div>
        <template v-if="scenario === 'number-input-1'">
            <NumberInput
                data-upstream-index="0"
                label="Quantity"
                value="1"
                style="max-width: 260px"
            ></NumberInput>
        </template>
        <template v-if="scenario === 'number-input-2'">
            <NumberInput
                data-upstream-index="0"
                label="Tickets"
                hint="How many would you like?"
                value="2"
                style="max-width: 260px"
            >
                <Icon data-upstream-index="1" slot="start" name="ticket"></Icon>
            </NumberInput>
        </template>
        <template v-if="scenario === 'number-input-3'">
            <NumberInput
                data-upstream-index="0"
                label="How many items?"
                style="max-width: 260px"
            ></NumberInput>
        </template>
        <template v-if="scenario === 'number-input-4'">
            <NumberInput
                data-upstream-index="0"
                label="Order quantity"
                hint="Enter the number of items you'd like to order"
                style="max-width: 260px"
            ></NumberInput>
        </template>
        <template v-if="scenario === 'number-input-5'">
            <NumberInput
                data-upstream-index="0"
                placeholder="Enter a number"
                style="max-width: 260px"
            ></NumberInput>
        </template>
        <template v-if="scenario === 'number-input-6'">
            <div class="wa-stack">
                <NumberInput
                    data-upstream-index="0"
                    label="Outlined"
                    appearance="outlined"
                    value="42"
                    style="max-width: 260px"
                ></NumberInput>
                <NumberInput
                    data-upstream-index="1"
                    label="Filled"
                    appearance="filled"
                    value="42"
                    style="max-width: 260px"
                ></NumberInput>
                <NumberInput
                    data-upstream-index="2"
                    label="Filled Outlined"
                    appearance="filled-outlined"
                    value="42"
                    style="max-width: 260px"
                ></NumberInput>
            </div>
        </template>
        <template v-if="scenario === 'number-input-7'">
            <NumberInput
                data-upstream-index="0"
                label="Disabled"
                value="100"
                disabled
                style="max-width: 260px"
            ></NumberInput>
        </template>
        <template v-if="scenario === 'number-input-8'">
            <NumberInput
                data-upstream-index="0"
                label="Readonly"
                value="42"
                readonly
                style="max-width: 260px"
            ></NumberInput>
        </template>
        <template v-if="scenario === 'number-input-9'">
            <div class="wa-stack">
                <NumberInput
                    data-upstream-index="0"
                    label="Extra Small"
                    size="xs"
                    value="5"
                    style="max-width: 260px"
                ></NumberInput>
                <NumberInput
                    data-upstream-index="1"
                    label="Small"
                    size="s"
                    value="10"
                    style="max-width: 260px"
                ></NumberInput>
                <NumberInput
                    data-upstream-index="2"
                    label="Medium"
                    size="m"
                    value="20"
                    style="max-width: 260px"
                ></NumberInput>
                <NumberInput
                    data-upstream-index="3"
                    label="Large"
                    size="l"
                    value="30"
                    style="max-width: 260px"
                ></NumberInput>
                <NumberInput
                    data-upstream-index="4"
                    label="Extra Large"
                    size="xl"
                    value="40"
                    style="max-width: 260px"
                ></NumberInput>
            </div>
        </template>
        <template v-if="scenario === 'number-input-10'">
            <NumberInput
                data-upstream-index="0"
                label="Quantity"
                pill
                value="5"
                style="max-width: 260px"
            ></NumberInput>
        </template>
        <template v-if="scenario === 'number-input-11'">
            <NumberInput
                data-upstream-index="0"
                label="Donation amount"
                hint="Amount in dollars (10-100, increments of 5)"
                :min="10"
                :max="100"
                :step="5"
                value="25"
                style="max-width: 260px"
            ></NumberInput>
        </template>
        <template v-if="scenario === 'number-input-12'">
            <NumberInput
                data-upstream-index="0"
                label="No steppers"
                value="50"
                without-steppers
                style="max-width: 260px"
            ></NumberInput>
        </template>
        <template v-if="scenario === 'number-input-13'">
            <NumberInput
                data-upstream-index="0"
                label="Custom icons"
                value="5"
                style="max-width: 260px"
            >
                <Icon data-upstream-index="1" slot="increment-icon" name="plus"></Icon>
                <Icon data-upstream-index="2" slot="decrement-icon" name="minus"></Icon>
            </NumberInput>
        </template>
        <template v-if="scenario === 'number-input-14'">
            <div class="wa-stack">
                <NumberInput
                    data-upstream-index="0"
                    label="Price"
                    value="100"
                    style="max-width: 260px"
                >
                    <Icon data-upstream-index="1" slot="start" name="dollar-sign"></Icon>
                </NumberInput>
                <NumberInput
                    data-upstream-index="2"
                    label="Quantity"
                    value="3"
                    style="max-width: 260px"
                >
                    <Icon data-upstream-index="3" slot="end" name="cart-shopping"></Icon>
                </NumberInput>
            </div>
        </template>
        <template v-if="scenario === 'number-input-15'">
            <div class="label-on-left">
                <NumberInput
                    data-upstream-index="0"
                    label="Quantity"
                    hint="How many do you need?"
                    value="1"
                ></NumberInput>
                <NumberInput
                    data-upstream-index="1"
                    label="Price"
                    hint="Cost per unit"
                    value="25"
                ></NumberInput>
            </div>
        </template>
        <template v-if="scenario === 'number-input-16'">
            <form class="number-input-validation">
                <NumberInput
                    data-upstream-index="0"
                    name="quantity"
                    label="Quantity"
                    hint="Enter a value between 1 and 10"
                    :min="1"
                    :max="10"
                    required
                    style="max-width: 260px"
                ></NumberInput>
                <br />
                <NumberInput
                    data-upstream-index="1"
                    name="price"
                    label="Price"
                    hint="Must be a multiple of 0.25"
                    :min="0"
                    :step="0.25"
                    required
                    style="max-width: 260px"
                ></NumberInput>
                <br />
                <Button data-upstream-index="2" appearance="filled" type="submit" variant="neutral"
                    >Submit</Button
                >
                <Button data-upstream-index="3" appearance="filled" type="reset" variant="neutral"
                    >Reset</Button
                >
            </form>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, Icon, NumberInput } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
