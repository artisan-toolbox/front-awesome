<template>
    <div>
        <template v-if="scenario === 'combobox-1'">
            <Combobox data-upstream-index="0" name="foo" label="Type to filter...">
                <Option data-upstream-index="1" value="option-1">Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
                <Option data-upstream-index="4" value="option-4">Option 4</Option>
                <Option data-upstream-index="5" value="option-5">Option 5</Option>
                <Option data-upstream-index="6" value="option-6">Option 6</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-2'">
            <Combobox
                data-upstream-index="0"
                label="Coffee order"
                hint="Start typing to filter."
                value="latte"
            >
                <Option data-upstream-index="1" value="espresso">Espresso</Option>
                <Option data-upstream-index="2" value="latte">Latte</Option>
                <Option data-upstream-index="3" value="cappuccino">Cappuccino</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-3'">
            <Combobox data-upstream-index="0" label="Choose a fruit">
                <Option data-upstream-index="1" value="apple">Apple</Option>
                <Option data-upstream-index="2" value="banana">Banana</Option>
                <Option data-upstream-index="3" value="orange">Orange</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-4'">
            <Combobox
                data-upstream-index="0"
                label="Favorite Fruit"
                hint="Start typing to filter options."
            >
                <Option data-upstream-index="1" value="apple">Apple</Option>
                <Option data-upstream-index="2" value="banana">Banana</Option>
                <Option data-upstream-index="3" value="cherry">Cherry</Option>
                <Option data-upstream-index="4" value="grape">Grape</Option>
                <Option data-upstream-index="5" value="orange">Orange</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-5'">
            <Combobox data-upstream-index="0" placeholder="Type to search...">
                <Option data-upstream-index="1" value="option-1">Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-6'">
            <Combobox data-upstream-index="0" with-clear value="option-1">
                <Option data-upstream-index="1" value="option-1">Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-7'">
            <Combobox
                data-upstream-index="0"
                label="Languages"
                multiple
                with-clear
                :max-options-visible="2"
                placeholder="Type to filter..."
            >
                <Option data-upstream-index="1" value="ts" selected>TypeScript</Option>
                <Option data-upstream-index="2" value="go" selected>Go</Option>
                <Option data-upstream-index="3" value="rust" selected>Rust</Option>
                <Option data-upstream-index="4" value="python">Python</Option>
                <Option data-upstream-index="5" value="ruby">Ruby</Option>
                <Option data-upstream-index="6" value="swift">Swift</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-8'">
            <Combobox data-upstream-index="0" label="Pre-selected option">
                <Option data-upstream-index="1" value="option-1" selected>Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
                <Option data-upstream-index="4" value="option-4">Option 4</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-9'">
            <Combobox data-upstream-index="0" multiple with-clear>
                <Option data-upstream-index="1" value="option-1" selected>Option 1</Option>
                <Option data-upstream-index="2" value="option-2" selected>Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
                <Option data-upstream-index="4" value="option-4">Option 4</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-10'">
            <Combobox
                data-upstream-index="0"
                allow-custom-value
                label="Enter or select a color"
                placeholder="Type a color..."
            >
                <Option data-upstream-index="1" value="red">Red</Option>
                <Option data-upstream-index="2" value="green">Green</Option>
                <Option data-upstream-index="3" value="blue">Blue</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-11'">
            <Combobox data-upstream-index="0" label="Grouped Options">
                <small>Fruits</small>
                <Option data-upstream-index="1" value="apple">Apple</Option>
                <Option data-upstream-index="2" value="banana">Banana</Option>
                <Option data-upstream-index="3" value="orange">Orange</Option>
                <Divider data-upstream-index="4"></Divider>
                <small>Vegetables</small>
                <Option data-upstream-index="5" value="carrot">Carrot</Option>
                <Option data-upstream-index="6" value="broccoli">Broccoli</Option>
                <Option data-upstream-index="7" value="spinach">Spinach</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-12'">
            <Combobox data-upstream-index="0" appearance="filled" placeholder="Filled">
                <Option data-upstream-index="1" value="option-1">Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
            </Combobox>
            <br />
            <Combobox
                data-upstream-index="4"
                appearance="filled-outlined"
                placeholder="Filled Outlined"
            >
                <Option data-upstream-index="5" value="option-1">Option 1</Option>
                <Option data-upstream-index="6" value="option-2">Option 2</Option>
                <Option data-upstream-index="7" value="option-3">Option 3</Option>
            </Combobox>
            <br />
            <Combobox data-upstream-index="8" appearance="outlined" placeholder="Outlined">
                <Option data-upstream-index="9" value="option-1">Option 1</Option>
                <Option data-upstream-index="10" value="option-2">Option 2</Option>
                <Option data-upstream-index="11" value="option-3">Option 3</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-13'">
            <Combobox data-upstream-index="0" pill placeholder="Search...">
                <Option data-upstream-index="1" value="option-1">Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-14'">
            <Combobox data-upstream-index="0" placeholder="Extra Small" size="xs">
                <Option data-upstream-index="1" value="option-1">Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
            </Combobox>

            <br />

            <Combobox data-upstream-index="4" placeholder="Small" size="s">
                <Option data-upstream-index="5" value="option-1">Option 1</Option>
                <Option data-upstream-index="6" value="option-2">Option 2</Option>
                <Option data-upstream-index="7" value="option-3">Option 3</Option>
            </Combobox>

            <br />

            <Combobox data-upstream-index="8" placeholder="Medium" size="m">
                <Option data-upstream-index="9" value="option-1">Option 1</Option>
                <Option data-upstream-index="10" value="option-2">Option 2</Option>
                <Option data-upstream-index="11" value="option-3">Option 3</Option>
            </Combobox>

            <br />

            <Combobox data-upstream-index="12" placeholder="Large" size="l">
                <Option data-upstream-index="13" value="option-1">Option 1</Option>
                <Option data-upstream-index="14" value="option-2">Option 2</Option>
                <Option data-upstream-index="15" value="option-3">Option 3</Option>
            </Combobox>

            <br />

            <Combobox data-upstream-index="16" placeholder="Extra Large" size="xl">
                <Option data-upstream-index="17" value="option-1">Option 1</Option>
                <Option data-upstream-index="18" value="option-2">Option 2</Option>
                <Option data-upstream-index="19" value="option-3">Option 3</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-15'">
            <Combobox data-upstream-index="0" placement="top" placeholder="Opens above">
                <Option data-upstream-index="1" value="option-1">Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-16'">
            <Combobox data-upstream-index="0" placeholder="Search locations..." size="s" with-clear>
                <Icon data-upstream-index="1" slot="start" name="magnifying-glass"></Icon>
                <Icon data-upstream-index="2" slot="end" name="location-dot"></Icon>
                <Option data-upstream-index="3" value="new-york">New York</Option>
                <Option data-upstream-index="4" value="los-angeles">Los Angeles</Option>
                <Option data-upstream-index="5" value="chicago">Chicago</Option>
            </Combobox>
            <br />
            <Combobox data-upstream-index="6" placeholder="Search locations..." size="m" with-clear>
                <Icon data-upstream-index="7" slot="start" name="magnifying-glass"></Icon>
                <Icon data-upstream-index="8" slot="end" name="location-dot"></Icon>
                <Option data-upstream-index="9" value="new-york">New York</Option>
                <Option data-upstream-index="10" value="los-angeles">Los Angeles</Option>
                <Option data-upstream-index="11" value="chicago">Chicago</Option>
            </Combobox>
            <br />
            <Combobox
                data-upstream-index="12"
                placeholder="Search locations..."
                size="l"
                with-clear
            >
                <Icon data-upstream-index="13" slot="start" name="magnifying-glass"></Icon>
                <Icon data-upstream-index="14" slot="end" name="location-dot"></Icon>
                <Option data-upstream-index="15" value="new-york">New York</Option>
                <Option data-upstream-index="16" value="los-angeles">Los Angeles</Option>
                <Option data-upstream-index="17" value="chicago">Chicago</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-17'">
            <Combobox data-upstream-index="0" placeholder="Disabled" disabled>
                <Option data-upstream-index="1" value="option-1">Option 1</Option>
                <Option data-upstream-index="2" value="option-2">Option 2</Option>
                <Option data-upstream-index="3" value="option-3">Option 3</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-18'">
            <Combobox
                data-upstream-index="0"
                allow-create
                label="Select or create a tag"
                placeholder="Type to search or create..."
            >
                <Option data-upstream-index="1" value="bug">Bug</Option>
                <Option data-upstream-index="2" value="feature">Feature</Option>
                <Option data-upstream-index="3" value="docs">Docs</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-19'">
            <Combobox
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
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-20'">
            <Combobox
                data-upstream-index="0"
                allow-create
                label="Add a tag"
                placeholder="Type to create..."
                class="custom-create-combobox"
            >
                <Option data-upstream-index="1" value="bug">Bug</Option>
                <Option data-upstream-index="2" value="feature">Feature</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-21'">
            <Combobox
                data-upstream-index="0"
                label="Search (includes match)"
                placeholder="Search anywhere in text..."
                class="custom-filter"
            >
                <Option data-upstream-index="1" value="apple">Apple</Option>
                <Option data-upstream-index="2" value="pineapple">Pineapple</Option>
                <Option data-upstream-index="3" value="banana">Banana</Option>
                <Option data-upstream-index="4" value="grape">Grape</Option>
                <Option data-upstream-index="5" value="grapefruit">Grapefruit</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-22'">
            <div class="wa-stack">
                <Combobox data-upstream-index="0" label="Fruit" placeholder="Type to filter...">
                    <span slot="no-results">No fruit by that name.</span>
                    <Option data-upstream-index="1" value="apple">Apple</Option>
                    <Option data-upstream-index="2" value="banana">Banana</Option>
                    <Option data-upstream-index="3" value="cherry">Cherry</Option>
                </Combobox>

                <Combobox data-upstream-index="4" label="Assignee" placeholder="Nobody yet">
                    <span slot="empty">Nobody has joined this project.</span>
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
            <Combobox data-upstream-index="0" label="Assignee">
                <Option data-upstream-index="1" value="grace" selected>Grace Hopper</Option>
            </Combobox>
        </template>
        <template v-if="scenario === 'combobox-25'">
            <Combobox data-upstream-index="0" label="Assignee" value="grace">
                <Option data-upstream-index="1" value="grace">Grace Hopper</Option>
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
                <span slot="empty">Start typing to find a city.</span>
                <span slot="no-results">No cities match your search.</span>
                <span slot="error">We couldn't reach the city service.</span>
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
            <Combobox
                data-upstream-index="0"
                id="combobox-event"
                server
                label="Fruit"
                placeholder="Search fruit"
            ></Combobox>
        </template>
        <template v-if="scenario === 'combobox-30'">
            <Combobox
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
            </Combobox>
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
defineProps<{ scenario: string }>();
</script>
