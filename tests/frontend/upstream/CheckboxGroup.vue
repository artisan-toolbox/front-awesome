<template>
    <div>
        <template v-if="scenario === 'checkbox-group-1'">
            <CheckboxGroup data-upstream-index="0" label="Interests">
                <Checkbox data-upstream-index="1" name="design">Design</Checkbox>
                <Checkbox data-upstream-index="2" name="development">Development</Checkbox>
                <Checkbox data-upstream-index="3" name="marketing">Marketing</Checkbox>
            </CheckboxGroup>
        </template>
        <template v-if="scenario === 'checkbox-group-2'">
            <CheckboxGroup data-upstream-index="0" label="Toppings">
                <Checkbox data-upstream-index="1" name="pepperoni">Pepperoni</Checkbox>
                <Checkbox data-upstream-index="2" name="mushrooms">Mushrooms</Checkbox>
                <Checkbox data-upstream-index="3" name="onions">Onions</Checkbox>
                <Checkbox data-upstream-index="4" name="peppers">Peppers</Checkbox>
                <Checkbox data-upstream-index="5" name="sausage">Sausage</Checkbox>
                <Checkbox data-upstream-index="6" name="extra-cheese">Extra cheese</Checkbox>
            </CheckboxGroup>
        </template>
        <template v-if="scenario === 'checkbox-group-3'">
            <CheckboxGroup
                data-upstream-index="0"
                label="Workdays"
                hint="Choose as many as you like."
            >
                <Checkbox data-upstream-index="1" name="monday">Monday</Checkbox>
                <Checkbox data-upstream-index="2" name="wednesday">Wednesday</Checkbox>
                <Checkbox data-upstream-index="3" name="friday">Friday</Checkbox>
            </CheckboxGroup>
        </template>
        <template v-if="scenario === 'checkbox-group-4'">
            <CheckboxGroup data-upstream-index="0" label="Sizes" orientation="horizontal">
                <Checkbox data-upstream-index="1" name="small">Small</Checkbox>
                <Checkbox data-upstream-index="2" name="medium">Medium</Checkbox>
                <Checkbox data-upstream-index="3" name="large">Large</Checkbox>
            </CheckboxGroup>
        </template>
        <template v-if="scenario === 'checkbox-group-5'">
            <div class="wa-stack">
                <CheckboxGroup data-upstream-index="0" label="Extra small" size="xs">
                    <Checkbox data-upstream-index="1">Option 1</Checkbox>
                    <Checkbox data-upstream-index="2">Option 2</Checkbox>
                </CheckboxGroup>
                <CheckboxGroup data-upstream-index="3" label="Small" size="s">
                    <Checkbox data-upstream-index="4">Option 1</Checkbox>
                    <Checkbox data-upstream-index="5">Option 2</Checkbox>
                </CheckboxGroup>
                <CheckboxGroup data-upstream-index="6" label="Medium" size="m">
                    <Checkbox data-upstream-index="7">Option 1</Checkbox>
                    <Checkbox data-upstream-index="8">Option 2</Checkbox>
                </CheckboxGroup>
                <CheckboxGroup data-upstream-index="9" label="Large" size="l">
                    <Checkbox data-upstream-index="10">Option 1</Checkbox>
                    <Checkbox data-upstream-index="11">Option 2</Checkbox>
                </CheckboxGroup>
                <CheckboxGroup data-upstream-index="12" label="Extra large" size="xl">
                    <Checkbox data-upstream-index="13">Option 1</Checkbox>
                    <Checkbox data-upstream-index="14">Option 2</Checkbox>
                </CheckboxGroup>
            </div>
        </template>
        <template v-if="scenario === 'checkbox-group-6'">
            <CheckboxGroup data-upstream-index="0" label="Add-ons">
                <Checkbox data-upstream-index="1" name="insurance" disabled>Insurance</Checkbox>
                <Checkbox data-upstream-index="2" name="gift-wrap" disabled>Gift wrap</Checkbox>
                <Checkbox data-upstream-index="3" name="express-shipping"
                    >Express shipping</Checkbox
                >
                <Checkbox data-upstream-index="4" name="extended-warranty"
                    >Extended warranty</Checkbox
                >
            </CheckboxGroup>
        </template>
        <template v-if="scenario === 'checkbox-group-7'">
            <CheckboxGroup
                data-upstream-index="0"
                label="Notifications"
                hint="Pick at least one channel."
            >
                <Switch data-upstream-index="1" name="email">Email</Switch>
                <Switch data-upstream-index="2" name="sms">SMS</Switch>
                <Switch data-upstream-index="3" name="push">Push</Switch>
            </CheckboxGroup>
        </template>
        <template v-if="scenario === 'checkbox-group-8'">
            <form>
                <CheckboxGroup data-upstream-index="0" label="Accept terms" required>
                    <Checkbox data-upstream-index="1" name="terms" required
                        >I agree to the terms and conditions</Checkbox
                    >
                </CheckboxGroup>
                <br />
                <Button data-upstream-index="2" type="submit" appearance="filled">Submit</Button>
            </form>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Checkbox,
    CheckboxGroup,
    Switch,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
