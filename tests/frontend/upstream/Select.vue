<template>
    <div>
        <template v-if="scenario === 'select-1'">
            <Select
                data-upstream-index="0"
                label="Coffee order"
                placeholder="How do you take it?"
                :options="optionsAt(0)"
                option-value="value"
                option-label="label"
            >
            </Select>
        </template>
        <template v-if="scenario === 'select-2'">
            <Select
                data-upstream-index="0"
                label="Coffee order"
                hint="We'll grind it fresh to order."
                value="latte"
                :options="optionsAt(0)"
                option-value="value"
                option-label="label"
            >
                <template #start
                    ><Icon data-upstream-index="1" slot="start" name="mug-hot"></Icon
                ></template>
            </Select>
        </template>
        <template v-if="scenario === 'select-3'">
            <Select
                data-upstream-index="0"
                label="Country"
                :options="optionsAt(1)"
                option-value="value"
                option-label="label"
            >
            </Select>
        </template>
        <template v-if="scenario === 'select-4'">
            <Select
                data-upstream-index="0"
                label="Experience"
                hint="Tell us how comfortable you are with the command line."
                :options="optionsAt(2)"
                option-value="value"
                option-label="label"
            >
            </Select>
        </template>
        <template v-if="scenario === 'select-5'">
            <Select
                data-upstream-index="0"
                placeholder="Select one"
                :options="optionsAt(3)"
                option-value="value"
                option-label="label"
            >
            </Select>
        </template>
        <template v-if="scenario === 'select-6'">
            <wa-select data-upstream-index="0" label="Default branch">
                <Option data-upstream-index="1" value="main" selected>main</Option>
                <Option data-upstream-index="2" value="develop">develop</Option>
                <Option data-upstream-index="3" value="staging">staging</Option>
            </wa-select>
        </template>
        <template v-if="scenario === 'select-7'">
            <wa-select data-upstream-index="0" label="Toppings" multiple>
                <Option data-upstream-index="1" value="mushrooms" selected>Mushrooms</Option>
                <Option data-upstream-index="2" value="olives" selected>Olives</Option>
                <Option data-upstream-index="3" value="peppers">Peppers</Option>
                <Option data-upstream-index="4" value="onions">Onions</Option>
            </wa-select>
        </template>
        <template v-if="scenario === 'select-8'">
            <div class="wa-stack">
                <Select
                    data-upstream-index="0"
                    appearance="outlined"
                    value="outlined"
                    :options="optionsAt(4)"
                    option-value="value"
                    option-label="label"
                >
                </Select>
                <Select
                    data-upstream-index="2"
                    appearance="filled"
                    value="filled"
                    :options="optionsAt(5)"
                    option-value="value"
                    option-label="label"
                >
                </Select>
                <Select
                    data-upstream-index="4"
                    appearance="filled-outlined"
                    value="filled-outlined"
                    :options="optionsAt(6)"
                    option-value="value"
                    option-label="label"
                >
                </Select>
            </div>
        </template>
        <template v-if="scenario === 'select-9'">
            <Select
                data-upstream-index="0"
                pill
                placeholder="Select one"
                :options="optionsAt(3)"
                option-value="value"
                option-label="label"
            >
            </Select>
        </template>
        <template v-if="scenario === 'select-10'">
            <div class="wa-stack">
                <Select
                    data-upstream-index="0"
                    size="xs"
                    placeholder="Extra small"
                    :options="optionsAt(7)"
                    option-value="value"
                    option-label="label"
                >
                </Select>
                <Select
                    data-upstream-index="3"
                    size="s"
                    placeholder="Small"
                    :options="optionsAt(7)"
                    option-value="value"
                    option-label="label"
                >
                </Select>
                <Select
                    data-upstream-index="6"
                    size="m"
                    placeholder="Medium"
                    :options="optionsAt(7)"
                    option-value="value"
                    option-label="label"
                >
                </Select>
                <Select
                    data-upstream-index="9"
                    size="l"
                    placeholder="Large"
                    :options="optionsAt(7)"
                    option-value="value"
                    option-label="label"
                >
                </Select>
                <Select
                    data-upstream-index="12"
                    size="xl"
                    placeholder="Extra large"
                    :options="optionsAt(7)"
                    option-value="value"
                    option-label="label"
                >
                </Select>
            </div>
        </template>
        <template v-if="scenario === 'select-11'">
            <Select
                data-upstream-index="0"
                placeholder="Disabled"
                disabled
                :options="optionsAt(3)"
                option-value="value"
                option-label="label"
            >
            </Select>
        </template>
        <template v-if="scenario === 'select-12'">
            <Select
                data-upstream-index="0"
                with-clear
                value="option-1"
                :options="optionsAt(3)"
                option-value="value"
                option-label="label"
            >
            </Select>
        </template>
        <template v-if="scenario === 'select-13'">
            <wa-select data-upstream-index="0" label="Notify me about" multiple with-clear>
                <Option data-upstream-index="1" value="mentions" selected>Mentions</Option>
                <Option data-upstream-index="2" value="replies" selected>Replies</Option>
                <Option data-upstream-index="3" value="reactions">Reactions</Option>
                <Option data-upstream-index="4" value="follows">New followers</Option>
                <Option data-upstream-index="5" value="releases">Releases</Option>
            </wa-select>
        </template>
        <template v-if="scenario === 'select-14'">
            <wa-select data-upstream-index="0" label="Add a language" placeholder="Select one">
                <small>Frontend</small>
                <Option data-upstream-index="1" value="ts">TypeScript</Option>
                <Option data-upstream-index="2" value="css">CSS</Option>
                <Divider data-upstream-index="3"></Divider>
                <small>Backend</small>
                <Option data-upstream-index="4" value="go">Go</Option>
                <Option data-upstream-index="5" value="rust">Rust</Option>
                <Option data-upstream-index="6" value="python">Python</Option>
            </wa-select>
        </template>
        <template v-if="scenario === 'select-15'">
            <Select
                data-upstream-index="0"
                placement="top"
                placeholder="Opens upward"
                :options="optionsAt(3)"
                option-value="value"
                option-label="label"
            >
            </Select>
        </template>
        <template v-if="scenario === 'select-16'">
            <Select
                data-upstream-index="0"
                label="Destination"
                placeholder="Where to?"
                with-clear
                :options="optionsAt(8)"
                option-value="value"
                option-label="label"
            >
                <template #start
                    ><Icon
                        data-upstream-index="1"
                        slot="start"
                        name="plane-departure"
                        variant="solid"
                    ></Icon
                ></template>
            </Select>
        </template>
        <template v-if="scenario === 'select-17'">
            <wa-select
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
            </wa-select>
        </template>
        <template v-if="scenario === 'select-18'">
            <form id="lazy-options-example">
                <div>
                    <wa-select
                        data-upstream-index="0"
                        name="select-1"
                        :value.attr="'foo'"
                        label="Single select (with existing options)"
                    >
                        <Option data-upstream-index="1" value="bar">Bar</Option>
                        <Option data-upstream-index="2" value="baz">Baz</Option>
                    </wa-select>

                    <Divider data-upstream-index="3"></Divider>

                    <Button data-upstream-index="4" appearance="filled" type="button"
                        >Add "foo" option</Button
                    >
                </div>

                <br />

                <div>
                    <wa-select
                        data-upstream-index="5"
                        name="select-2"
                        :value.attr="'foo'"
                        label="Single select (with no existing options)"
                    >
                    </wa-select>

                    <Divider data-upstream-index="6"></Divider>

                    <Button data-upstream-index="7" appearance="filled" type="button"
                        >Add "foo" option</Button
                    >
                </div>

                <br />

                <div>
                    <wa-select
                        data-upstream-index="8"
                        name="select-3"
                        multiple
                        label="Multiple select (with existing selected options)"
                    >
                        <Option data-upstream-index="9" value="bar" selected>Bar</Option>
                        <Option data-upstream-index="10" value="baz" selected>Baz</Option>
                    </wa-select>

                    <Divider data-upstream-index="11"></Divider>

                    <Button data-upstream-index="12" appearance="filled" type="button"
                        >Add "foo" option (selected)</Button
                    >
                </div>

                <br />

                <div>
                    <wa-select
                        data-upstream-index="13"
                        name="select-4"
                        :value.attr="'foo'"
                        multiple
                        label="Multiple select (with no existing options)"
                    >
                    </wa-select>

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
import '#front-awesome-webawesome/components/select/select.js';
defineProps<{ scenario: string }>();
const optionSets = [
    [
        { value: 'espresso', label: 'Espresso' },
        { value: 'latte', label: 'Latte' },
        { value: 'cappuccino', label: 'Cappuccino' },
        { value: 'cold-brew', label: 'Cold brew' },
        { value: 'drip', label: 'Drip' },
    ],
    [
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
        { value: 'mx', label: 'Mexico' },
    ],
    [
        { value: '1', label: 'Novice' },
        { value: '2', label: 'Intermediate' },
        { value: '3', label: 'Advanced' },
    ],
    [
        { value: 'option-1', label: 'Option 1' },
        { value: 'option-2', label: 'Option 2' },
        { value: 'option-3', label: 'Option 3' },
    ],
    [{ value: 'outlined', label: 'outlined' }],
    [{ value: 'filled', label: 'filled' }],
    [{ value: 'filled-outlined', label: 'filled-outlined' }],
    [
        { value: 'option-1', label: 'Option 1' },
        { value: 'option-2', label: 'Option 2' },
    ],
    [
        { value: 'lax', label: 'Los Angeles' },
        { value: 'jfk', label: 'New York' },
        { value: 'nrt', label: 'Tokyo' },
    ],
];
function optionsAt(index: number) {
    return optionSets[index];
}
</script>
