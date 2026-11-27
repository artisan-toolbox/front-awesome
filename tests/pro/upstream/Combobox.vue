<template>
    <div>
        <template v-if="scenario === 'combobox-1'">
            <Combobox
                data-upstream-index="0"
                name="foo"
                label="Type to filter..."
                :options="optionsAt(0)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-2'">
            <Combobox
                data-upstream-index="0"
                label="Coffee order"
                hint="Start typing to filter."
                value="latte"
                :options="optionsAt(1)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-3'">
            <Combobox
                data-upstream-index="0"
                label="Choose a fruit"
                :options="optionsAt(2)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-4'">
            <Combobox
                data-upstream-index="0"
                label="Favorite Fruit"
                hint="Start typing to filter options."
                :options="optionsAt(3)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-5'">
            <Combobox
                data-upstream-index="0"
                placeholder="Type to search..."
                :options="optionsAt(4)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-6'">
            <Combobox
                data-upstream-index="0"
                with-clear
                value="option-1"
                :options="optionsAt(4)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-7'">
            <wa-combobox
                data-upstream-index="0"
                label="Languages"
                multiple
                with-clear
                max-options-visible="2"
                placeholder="Type to filter..."
            >
                <Option data-upstream-index="1" value="ts" selected>TypeScript</Option>
                <Option data-upstream-index="2" value="go" selected>Go</Option>
                <Option data-upstream-index="3" value="rust" selected>Rust</Option>
                <Option data-upstream-index="4" value="python">Python</Option>
                <Option data-upstream-index="5" value="ruby">Ruby</Option>
                <Option data-upstream-index="6" value="swift">Swift</Option>
            </wa-combobox>
        </template>
        <template v-if="scenario === 'combobox-8'">
            <wa-combobox data-upstream-index="0" label="Pre-selected option">
                <Option data-upstream-index="1" value="option-1" selected>Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
                <Option data-upstream-index="4" value="option-4">Option 4</Option>
            </wa-combobox>
        </template>
        <template v-if="scenario === 'combobox-9'">
            <wa-combobox data-upstream-index="0" multiple with-clear>
                <Option data-upstream-index="1" value="option-1" selected>Option 1</Option>
                <Option data-upstream-index="2" value="option-2" selected>Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
                <Option data-upstream-index="4" value="option-4">Option 4</Option>
            </wa-combobox>
        </template>
        <template v-if="scenario === 'combobox-10'">
            <Combobox
                data-upstream-index="0"
                allow-custom-value
                label="Enter or select a color"
                placeholder="Type a color..."
                :options="optionsAt(5)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-11'">
            <wa-combobox data-upstream-index="0" label="Grouped Options">
                <small>Fruits</small>
                <Option data-upstream-index="1" value="apple">Apple</Option>
                <Option data-upstream-index="2" value="banana">Banana</Option>
                <Option data-upstream-index="3" value="orange">Orange</Option>
                <Divider data-upstream-index="4"></Divider>
                <small>Vegetables</small>
                <Option data-upstream-index="5" value="carrot">Carrot</Option>
                <Option data-upstream-index="6" value="broccoli">Broccoli</Option>
                <Option data-upstream-index="7" value="spinach">Spinach</Option>
            </wa-combobox>
        </template>
        <template v-if="scenario === 'combobox-12'">
            <Combobox
                data-upstream-index="0"
                appearance="filled"
                placeholder="Filled"
                :options="optionsAt(4)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
            <br />
            <Combobox
                data-upstream-index="4"
                appearance="filled-outlined"
                placeholder="Filled Outlined"
                :options="optionsAt(4)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
            <br />
            <Combobox
                data-upstream-index="8"
                appearance="outlined"
                placeholder="Outlined"
                :options="optionsAt(4)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-13'">
            <Combobox
                data-upstream-index="0"
                pill
                placeholder="Search..."
                :options="optionsAt(4)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-14'">
            <Combobox
                data-upstream-index="0"
                placeholder="Extra Small"
                size="xs"
                :options="optionsAt(4)"
                option-value="value"
                option-label="label"
            >
            </Combobox>

            <br />

            <Combobox
                data-upstream-index="4"
                placeholder="Small"
                size="s"
                :options="optionsAt(4)"
                option-value="value"
                option-label="label"
            >
            </Combobox>

            <br />

            <Combobox
                data-upstream-index="8"
                placeholder="Medium"
                size="m"
                :options="optionsAt(4)"
                option-value="value"
                option-label="label"
            >
            </Combobox>

            <br />

            <Combobox
                data-upstream-index="12"
                placeholder="Large"
                size="l"
                :options="optionsAt(4)"
                option-value="value"
                option-label="label"
            >
            </Combobox>

            <br />

            <Combobox
                data-upstream-index="16"
                placeholder="Extra Large"
                size="xl"
                :options="optionsAt(4)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-15'">
            <Combobox
                data-upstream-index="0"
                placement="top"
                placeholder="Opens above"
                :options="optionsAt(4)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-16'">
            <Combobox
                data-upstream-index="0"
                placeholder="Search locations..."
                size="s"
                with-clear
                :options="optionsAt(6)"
                option-value="value"
                option-label="label"
            >
                <template #start
                    ><Icon data-upstream-index="1" slot="start" name="magnifying-glass"></Icon
                ></template>
                <template #end
                    ><Icon data-upstream-index="2" slot="end" name="location-dot"></Icon
                ></template>
            </Combobox>
            <br />
            <Combobox
                data-upstream-index="6"
                placeholder="Search locations..."
                size="m"
                with-clear
                :options="optionsAt(6)"
                option-value="value"
                option-label="label"
            >
                <template #start
                    ><Icon data-upstream-index="7" slot="start" name="magnifying-glass"></Icon
                ></template>
                <template #end
                    ><Icon data-upstream-index="8" slot="end" name="location-dot"></Icon
                ></template>
            </Combobox>
            <br />
            <Combobox
                data-upstream-index="12"
                placeholder="Search locations..."
                size="l"
                with-clear
                :options="optionsAt(6)"
                option-value="value"
                option-label="label"
            >
                <template #start
                    ><Icon data-upstream-index="13" slot="start" name="magnifying-glass"></Icon
                ></template>
                <template #end
                    ><Icon data-upstream-index="14" slot="end" name="location-dot"></Icon
                ></template>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-17'">
            <Combobox
                data-upstream-index="0"
                placeholder="Disabled"
                disabled
                :options="optionsAt(4)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-18'">
            <Combobox
                data-upstream-index="0"
                allow-create
                label="Select or create a tag"
                placeholder="Type to search or create..."
                :options="optionsAt(7)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-19'">
            <wa-combobox
                data-upstream-index="0"
                allow-create
                multiple
                with-clear
                label="Select or create tags"
                placeholder="Type to search or create..."
            >
                <Option data-upstream-index="1" value="bug" selected>Bug</Option>
                <Option data-upstream-index="2" value="feature">Feature</Option>
                <Option data-upstream-index="3" value="docs">Docs</Option>
            </wa-combobox>
        </template>
        <template v-if="scenario === 'combobox-20'">
            <wa-combobox
                data-upstream-index="0"
                allow-create
                label="Add a tag"
                placeholder="Type to create..."
                class="custom-create-combobox"
            >
                <Option data-upstream-index="1" value="bug">Bug</Option>
                <Option data-upstream-index="2" value="feature">Feature</Option>
            </wa-combobox>
        </template>
        <template v-if="scenario === 'combobox-21'">
            <Combobox
                data-upstream-index="0"
                label="Search (includes match)"
                placeholder="Search anywhere in text..."
                class="custom-filter"
                :options="optionsAt(8)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-22'">
            <div class="wa-stack">
                <Combobox
                    data-upstream-index="0"
                    label="Fruit"
                    placeholder="Type to filter..."
                    :options="optionsAt(9)"
                    option-value="value"
                    option-label="label"
                >
                    <template #no-results
                        ><span slot="no-results">No fruit by that name.</span></template
                    >
                </Combobox>

                <Combobox data-upstream-index="4" label="Assignee" placeholder="Nobody yet">
                    <template #empty
                        ><span slot="empty">Nobody has joined this project.</span></template
                    >
                </Combobox>
            </div>
        </template>
        <template v-if="scenario === 'combobox-23'">
            <Combobox
                data-upstream-index="0"
                id="combobox-server"
                label="Country"
                placeholder="Search countries"
                with-clear
            ></Combobox>
        </template>
        <template v-if="scenario === 'combobox-24'">
            <wa-combobox data-upstream-index="0" label="Assignee">
                <Option data-upstream-index="1" value="grace" selected>Grace Hopper</Option>
            </wa-combobox>
        </template>
        <template v-if="scenario === 'combobox-25'">
            <Combobox
                data-upstream-index="0"
                label="Assignee"
                value="grace"
                :options="optionsAt(10)"
                option-value="value"
                option-label="label"
            >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-26'">
            <Combobox
                data-upstream-index="0"
                id="combobox-custom"
                label="Assignee"
                placeholder="Search people"
            ></Combobox>
        </template>
        <template v-if="scenario === 'combobox-27'">
            <Combobox
                data-upstream-index="0"
                id="combobox-status"
                label="City"
                placeholder="Search cities"
            >
                <template #empty><span slot="empty">Start typing to find a city.</span></template>
                <template #no-results
                    ><span slot="no-results">No cities match your search.</span></template
                >
                <template #error
                    ><span slot="error">We couldn't reach the city service.</span></template
                >
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-28'">
            <Combobox
                data-upstream-index="0"
                id="combobox-reload"
                label="Project"
                with-clear
            ></Combobox>
            <br />
            <Button data-upstream-index="1" id="combobox-reload-button">Create a Project</Button>
        </template>
        <template v-if="scenario === 'combobox-29'">
            <wa-combobox
                data-upstream-index="0"
                id="combobox-event"
                server
                label="Fruit"
                placeholder="Search fruit"
            ></wa-combobox>
        </template>
        <template v-if="scenario === 'combobox-30'">
            <wa-combobox
                data-upstream-index="0"
                placeholder="Select contacts..."
                multiple
                with-clear
                class="custom-tag-combobox"
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
            </wa-combobox>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Divider,
    Icon,
    Option,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
import { Combobox } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
import '#front-awesome-webawesome-pro/components/combobox/combobox.js';
defineProps<{ scenario: string }>();
const optionSets = [
    [
        { value: 'option-1', label: 'Option 1' },
        { value: 'option-2', label: 'Option 2' },
        { value: 'option-3', label: 'Option 3' },
        { value: 'option-4', label: 'Option 4' },
        { value: 'option-5', label: 'Option 5' },
        { value: 'option-6', label: 'Option 6' },
    ],
    [
        { value: 'espresso', label: 'Espresso' },
        { value: 'latte', label: 'Latte' },
        { value: 'cappuccino', label: 'Cappuccino' },
    ],
    [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'orange', label: 'Orange' },
    ],
    [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'cherry', label: 'Cherry' },
        { value: 'grape', label: 'Grape' },
        { value: 'orange', label: 'Orange' },
    ],
    [
        { value: 'option-1', label: 'Option 1' },
        { value: 'option-2', label: 'Option 2' },
        { value: 'option-3', label: 'Option 3' },
    ],
    [
        { value: 'red', label: 'Red' },
        { value: 'green', label: 'Green' },
        { value: 'blue', label: 'Blue' },
    ],
    [
        { value: 'new-york', label: 'New York' },
        { value: 'los-angeles', label: 'Los Angeles' },
        { value: 'chicago', label: 'Chicago' },
    ],
    [
        { value: 'bug', label: 'Bug' },
        { value: 'feature', label: 'Feature' },
        { value: 'docs', label: 'Docs' },
    ],
    [
        { value: 'apple', label: 'Apple' },
        { value: 'pineapple', label: 'Pineapple' },
        { value: 'banana', label: 'Banana' },
        { value: 'grape', label: 'Grape' },
        { value: 'grapefruit', label: 'Grapefruit' },
    ],
    [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'cherry', label: 'Cherry' },
    ],
    [{ value: 'grace', label: 'Grace Hopper' }],
];
function optionsAt(index: number) {
    return optionSets[index];
}
</script>
