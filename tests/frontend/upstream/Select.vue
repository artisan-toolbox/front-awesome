<template>
    <div>
        <template v-if="scenario === 'select-1'">
            <Select data-upstream-index="0" label="Coffee order" placeholder="How do you take it?">
                <Option data-upstream-index="1" value="espresso">Espresso</Option>
                <Option data-upstream-index="2" value="latte">Latte</Option>
                <Option data-upstream-index="3" value="cappuccino">Cappuccino</Option>
                <Option data-upstream-index="4" value="cold-brew">Cold brew</Option>
                <Option data-upstream-index="5" value="drip">Drip</Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-2'">
            <Select
                data-upstream-index="0"
                label="Coffee order"
                hint="We'll grind it fresh to order."
                value="latte"
            >
                <Icon data-upstream-index="1" slot="start" name="mug-hot"></Icon>
                <Option data-upstream-index="2" value="espresso">Espresso</Option>
                <Option data-upstream-index="3" value="latte">Latte</Option>
                <Option data-upstream-index="4" value="cappuccino">Cappuccino</Option>
                <Option data-upstream-index="5" value="cold-brew">Cold brew</Option>
                <Option data-upstream-index="6" value="drip">Drip</Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-3'">
            <Select data-upstream-index="0" label="Country">
                <Option data-upstream-index="1" value="us">United States</Option>
                <Option data-upstream-index="2" value="ca">Canada</Option>
                <Option data-upstream-index="3" value="mx">Mexico</Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-4'">
            <Select
                data-upstream-index="0"
                label="Experience"
                hint="Tell us how comfortable you are with the command line."
            >
                <Option data-upstream-index="1" value="1">Novice</Option>
                <Option data-upstream-index="2" value="2">Intermediate</Option>
                <Option data-upstream-index="3" value="3">Advanced</Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-5'">
            <Select data-upstream-index="0" placeholder="Select one">
                <Option data-upstream-index="1" value="option-1">Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-6'">
            <Select data-upstream-index="0" label="Default branch">
                <Option data-upstream-index="1" value="main" selected>main</Option>
                <Option data-upstream-index="2" value="develop">develop</Option>
                <Option data-upstream-index="3" value="staging">staging</Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-7'">
            <Select data-upstream-index="0" label="Toppings" multiple>
                <Option data-upstream-index="1" value="mushrooms" selected>Mushrooms</Option>
                <Option data-upstream-index="2" value="olives" selected>Olives</Option>
                <Option data-upstream-index="3" value="peppers">Peppers</Option>
                <Option data-upstream-index="4" value="onions">Onions</Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-8'">
            <div class="wa-stack">
                <Select data-upstream-index="0" appearance="outlined" value="outlined">
                    <Option data-upstream-index="1" value="outlined">outlined</Option>
                </Select>
                <Select data-upstream-index="2" appearance="filled" value="filled">
                    <Option data-upstream-index="3" value="filled">filled</Option>
                </Select>
                <Select
                    data-upstream-index="4"
                    appearance="filled-outlined"
                    value="filled-outlined"
                >
                    <Option data-upstream-index="5" value="filled-outlined">filled-outlined</Option>
                </Select>
            </div>
        </template>
        <template v-if="scenario === 'select-9'">
            <Select data-upstream-index="0" pill placeholder="Select one">
                <Option data-upstream-index="1" value="option-1">Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-10'">
            <div class="wa-stack">
                <Select data-upstream-index="0" size="xs" placeholder="Extra small">
                    <Option data-upstream-index="1" value="option-1">Option 1</Option>
                    <Option data-upstream-index="2" value="option-2">Option 2</Option>
                </Select>
                <Select data-upstream-index="3" size="s" placeholder="Small">
                    <Option data-upstream-index="4" value="option-1">Option 1</Option>
                    <Option data-upstream-index="5" value="option-2">Option 2</Option>
                </Select>
                <Select data-upstream-index="6" size="m" placeholder="Medium">
                    <Option data-upstream-index="7" value="option-1">Option 1</Option>
                    <Option data-upstream-index="8" value="option-2">Option 2</Option>
                </Select>
                <Select data-upstream-index="9" size="l" placeholder="Large">
                    <Option data-upstream-index="10" value="option-1">Option 1</Option>
                    <Option data-upstream-index="11" value="option-2">Option 2</Option>
                </Select>
                <Select data-upstream-index="12" size="xl" placeholder="Extra large">
                    <Option data-upstream-index="13" value="option-1">Option 1</Option>
                    <Option data-upstream-index="14" value="option-2">Option 2</Option>
                </Select>
            </div>
        </template>
        <template v-if="scenario === 'select-11'">
            <Select data-upstream-index="0" placeholder="Disabled" disabled>
                <Option data-upstream-index="1" value="option-1">Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-12'">
            <Select data-upstream-index="0" with-clear value="option-1">
                <Option data-upstream-index="1" value="option-1">Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-13'">
            <Select data-upstream-index="0" label="Notify me about" multiple with-clear>
                <Option data-upstream-index="1" value="mentions" selected>Mentions</Option>
                <Option data-upstream-index="2" value="replies" selected>Replies</Option>
                <Option data-upstream-index="3" value="reactions">Reactions</Option>
                <Option data-upstream-index="4" value="follows">New followers</Option>
                <Option data-upstream-index="5" value="releases">Releases</Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-14'">
            <Select data-upstream-index="0" label="Add a language" placeholder="Select one">
                <small>Frontend</small>
                <Option data-upstream-index="1" value="ts">TypeScript</Option>
                <Option data-upstream-index="2" value="css">CSS</Option>
                <Divider data-upstream-index="3"></Divider>
                <small>Backend</small>
                <Option data-upstream-index="4" value="go">Go</Option>
                <Option data-upstream-index="5" value="rust">Rust</Option>
                <Option data-upstream-index="6" value="python">Python</Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-15'">
            <Select data-upstream-index="0" placement="top" placeholder="Opens upward">
                <Option data-upstream-index="1" value="option-1">Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-16'">
            <Select data-upstream-index="0" label="Destination" placeholder="Where to?" with-clear>
                <Icon
                    data-upstream-index="1"
                    slot="start"
                    name="plane-departure"
                    variant="solid"
                ></Icon>
                <Option data-upstream-index="2" value="lax">Los Angeles</Option>
                <Option data-upstream-index="3" value="jfk">New York</Option>
                <Option data-upstream-index="4" value="nrt">Tokyo</Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-17'">
            <Select
                data-upstream-index="0"
                placeholder="Select one"
                multiple
                with-clear
                class="custom-tag"
            >
                <Option data-upstream-index="1" value="email" selected>
                    <Icon
                        data-upstream-index="2"
                        slot="start"
                        name="envelope"
                        variant="solid"
                    ></Icon>
                    Email
                </Option>
                <Option data-upstream-index="3" value="phone" selected>
                    <Icon data-upstream-index="4" slot="start" name="phone" variant="solid"></Icon>
                    Phone
                </Option>
                <Option data-upstream-index="5" value="chat">
                    <Icon
                        data-upstream-index="6"
                        slot="start"
                        name="comment"
                        variant="solid"
                    ></Icon>
                    Chat
                </Option>
            </Select>
        </template>
        <template v-if="scenario === 'select-18'">
            <form id="lazy-options-example">
                <div>
                    <Select
                        data-upstream-index="0"
                        name="select-1"
                        value="foo"
                        label="Single select (with existing options)"
                    >
                        <Option data-upstream-index="1" value="bar">Bar</Option>
                        <Option data-upstream-index="2" value="baz">Baz</Option>
                    </Select>

                    <Divider data-upstream-index="3"></Divider>

                    <Button data-upstream-index="4" appearance="filled" type="button"
                        >Add "foo" option</Button
                    >
                </div>

                <br />

                <div>
                    <Select
                        data-upstream-index="5"
                        name="select-2"
                        value="foo"
                        label="Single select (with no existing options)"
                    >
                    </Select>

                    <Divider data-upstream-index="6"></Divider>

                    <Button data-upstream-index="7" appearance="filled" type="button"
                        >Add "foo" option</Button
                    >
                </div>

                <br />

                <div>
                    <Select
                        data-upstream-index="8"
                        name="select-3"
                        multiple
                        label="Multiple select (with existing selected options)"
                    >
                        <Option data-upstream-index="9" value="bar" selected>Bar</Option>
                        <Option data-upstream-index="10" value="baz" selected>Baz</Option>
                    </Select>

                    <Divider data-upstream-index="11"></Divider>

                    <Button data-upstream-index="12" appearance="filled" type="button"
                        >Add "foo" option (selected)</Button
                    >
                </div>

                <br />

                <div>
                    <Select
                        data-upstream-index="13"
                        name="select-4"
                        value="foo"
                        multiple
                        label="Multiple select (with no existing options)"
                    >
                    </Select>

                    <Divider data-upstream-index="14"></Divider>

                    <Button data-upstream-index="15" appearance="filled" type="button"
                        >Add "foo" option</Button
                    >
                </div>

                <br /><br />

                <div style="display: flex; gap: 16px">
                    <Button data-upstream-index="16" appearance="filled" type="reset">Reset</Button>
                    <Button
                        data-upstream-index="17"
                        appearance="filled"
                        type="submit"
                        variant="neutral"
                        >Show FormData</Button
                    >
                </div>

                <br />

                <pre hidden><code id="lazy-options-example-form-data"></code></pre>

                <br />
            </form>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Divider,
    Icon,
    Option,
    Select,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
