<template>
    <div>
        <template v-if="scenario === 'input-1'">
            <Input data-upstream-index="0" label="Name" v-model="input0"></Input>
        </template>
        <template v-if="scenario === 'input-2'">
            <Input
                data-upstream-index="0"
                type="password"
                label="Password"
                hint="Must be at least 8 characters."
                v-model="input1"
            >
                <Icon data-upstream-index="1" slot="start" name="lock"></Icon>
            </Input>
        </template>
        <template v-if="scenario === 'input-3'">
            <Input data-upstream-index="0" label="What is your name?" v-model="input2"></Input>
        </template>
        <template v-if="scenario === 'input-4'">
            <Input
                data-upstream-index="0"
                label="Nickname"
                hint="What would you like people to call you?"
                v-model="input3"
            ></Input>
        </template>
        <template v-if="scenario === 'input-5'">
            <Input
                data-upstream-index="0"
                label="Search"
                placeholder="Search the docs"
                v-model="input4"
            ></Input>
        </template>
        <template v-if="scenario === 'input-6'">
            <Input
                data-upstream-index="0"
                placeholder="Clearable"
                with-clear
                v-model="input5"
            ></Input>
        </template>
        <template v-if="scenario === 'input-7'">
            <Input
                data-upstream-index="0"
                type="password"
                placeholder="Password Toggle"
                password-toggle
                v-model="input6"
            ></Input>
        </template>
        <template v-if="scenario === 'input-8'">
            <div class="wa-stack">
                <Input
                    data-upstream-index="0"
                    appearance="outlined"
                    placeholder="outlined"
                    v-model="input7"
                ></Input>
                <Input
                    data-upstream-index="1"
                    appearance="filled"
                    placeholder="filled"
                    v-model="input8"
                ></Input>
                <Input
                    data-upstream-index="2"
                    appearance="filled-outlined"
                    placeholder="filled-outlined"
                    v-model="input9"
                ></Input>
            </div>
        </template>
        <template v-if="scenario === 'input-9'">
            <Input
                data-upstream-index="0"
                placeholder="Disabled"
                disabled
                v-model="input10"
            ></Input>
        </template>
        <template v-if="scenario === 'input-10'">
            <Input data-upstream-index="0" label="Account ID" readonly v-model="input11"></Input>
        </template>
        <template v-if="scenario === 'input-11'">
            <div class="wa-stack">
                <Input
                    data-upstream-index="0"
                    size="xs"
                    placeholder="Extra small"
                    v-model="input12"
                ></Input>
                <Input
                    data-upstream-index="1"
                    size="s"
                    placeholder="Small"
                    v-model="input13"
                ></Input>
                <Input
                    data-upstream-index="2"
                    size="m"
                    placeholder="Medium"
                    v-model="input14"
                ></Input>
                <Input
                    data-upstream-index="3"
                    size="l"
                    placeholder="Large"
                    v-model="input15"
                ></Input>
                <Input
                    data-upstream-index="4"
                    size="xl"
                    placeholder="Extra large"
                    v-model="input16"
                ></Input>
            </div>
        </template>
        <template v-if="scenario === 'input-12'">
            <Input data-upstream-index="0" placeholder="Search" pill v-model="input17"></Input>
        </template>
        <template v-if="scenario === 'input-13'">
            <div class="wa-stack">
                <Input
                    data-upstream-index="0"
                    type="email"
                    placeholder="Email"
                    v-model="input18"
                ></Input>
                <Input
                    data-upstream-index="1"
                    type="number"
                    placeholder="Number"
                    v-model="input19"
                ></Input>
                <Input
                    data-upstream-index="2"
                    type="date"
                    placeholder="Date"
                    v-model="input20"
                ></Input>
            </div>
        </template>
        <template v-if="scenario === 'input-14'">
            <div class="wa-stack">
                <Input
                    data-upstream-index="0"
                    label="Search"
                    placeholder="Search the docs"
                    v-model="input21"
                >
                    <Icon data-upstream-index="1" name="magnifying-glass" slot="start"></Icon>
                </Input>
                <Input
                    data-upstream-index="2"
                    label="Website"
                    placeholder="example.com"
                    v-model="input22"
                >
                    <Icon data-upstream-index="3" name="globe" slot="start"></Icon>
                    <Icon data-upstream-index="4" name="circle-info" slot="end"></Icon>
                </Input>
            </div>
        </template>
        <template v-if="scenario === 'input-15'">
            <div class="label-on-left">
                <Input
                    data-upstream-index="0"
                    label="Name"
                    hint="Enter your name"
                    v-model="input23"
                ></Input>
                <Input
                    data-upstream-index="1"
                    label="Email address"
                    type="email"
                    hint="Enter your email"
                    v-model="input24"
                ></Input>
                <Textarea
                    data-upstream-index="2"
                    label="Bio"
                    hint="Tell us something about yourself"
                ></Textarea>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon, Input, Textarea } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
const input0 = ref('');
const input1 = ref('correcthorse');
const input2 = ref('');
const input3 = ref('');
const input4 = ref('');
const input5 = ref('');
const input6 = ref('');
const input7 = ref('');
const input8 = ref('');
const input9 = ref('');
const input10 = ref('');
const input11 = ref('WA-2049');
const input12 = ref('');
const input13 = ref('');
const input14 = ref('');
const input15 = ref('');
const input16 = ref('');
const input17 = ref('');
const input18 = ref('');
const input19 = ref('');
const input20 = ref('');
const input21 = ref('');
const input22 = ref('');
const input23 = ref('');
const input24 = ref('');
</script>
