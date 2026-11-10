<template>
    <div>
        <template v-if="scenario === 'tag-input-1'">
            <TagInput
                data-upstream-index="0"
                label="Keywords"
                placeholder="Add a keyword"
                default-value="design, accessibility"
            ></TagInput>
        </template>
        <template v-if="scenario === 'tag-input-2'">
            <TagInput
                data-upstream-index="0"
                label="Topics"
                hint="Press Enter or type a comma after each topic."
                default-value="Design, CSS"
                with-clear
            >
                <Icon data-upstream-index="1" slot="start" name="tag"></Icon>
            </TagInput>
        </template>
        <template v-if="scenario === 'tag-input-3'">
            <TagInput data-upstream-index="0" label="Skills"></TagInput>
        </template>
        <template v-if="scenario === 'tag-input-4'">
            <TagInput
                data-upstream-index="0"
                label="Ingredients"
                hint="Press Enter or type a comma after each ingredient."
            ></TagInput>
        </template>
        <template v-if="scenario === 'tag-input-5'">
            <TagInput
                data-upstream-index="0"
                label="Guest list"
                placeholder="Add a name"
            ></TagInput>
        </template>
        <template v-if="scenario === 'tag-input-6'">
            <TagInput
                data-upstream-index="0"
                label="Toppings"
                default-value="Mushrooms, Olives, Peppers"
            ></TagInput>
        </template>
        <template v-if="scenario === 'tag-input-7'">
            <div class="wa-stack">
                <TagInput
                    data-upstream-index="0"
                    label="Space-separated"
                    delimiter=" "
                    placeholder="Type a word and a space"
                ></TagInput>
                <TagInput
                    data-upstream-index="1"
                    label="Commas or semicolons"
                    delimiter=",;"
                    placeholder="Type a value and , or ;"
                ></TagInput>
                <TagInput
                    data-upstream-index="2"
                    label="Enter only"
                    delimiter=""
                    placeholder="Type a value and press Enter"
                ></TagInput>
            </div>
        </template>
        <template v-if="scenario === 'tag-input-8'">
            <CopyButton data-upstream-index="0" value="Cumin, Paprika, Coriander, Turmeric">
                <Button data-upstream-index="1" appearance="filled">
                    <Icon data-upstream-index="2" slot="start" name="clipboard"></Icon>
                    Copy spices
                </Button>
            </CopyButton>

            <Divider data-upstream-index="3"></Divider>

            <TagInput
                data-upstream-index="4"
                label="Spices"
                placeholder="Paste the copied list here"
            ></TagInput>
        </template>
        <template v-if="scenario === 'tag-input-9'">
            <TagInput
                data-upstream-index="0"
                label="Tickers"
                default-value="AAPL, MSFT, NVDA"
                with-clear
            ></TagInput>
        </template>
        <template v-if="scenario === 'tag-input-10'">
            <TagInput
                data-upstream-index="0"
                label="Desert island albums"
                hint="Choose up to three."
                default-value="Kind of Blue, Rumours"
                :max-tags="3"
                placeholder="Add an album"
            ></TagInput>
        </template>
        <template v-if="scenario === 'tag-input-11'">
            <TagInput
                data-upstream-index="0"
                label="Dice rolls"
                default-value="6, 6"
                allow-duplicates
                placeholder="Roll again"
            ></TagInput>
        </template>
        <template v-if="scenario === 'tag-input-12'">
            <div class="wa-stack">
                <TagInput
                    data-upstream-index="0"
                    appearance="outlined"
                    default-value="Outlined"
                    label="Outlined"
                ></TagInput>
                <TagInput
                    data-upstream-index="1"
                    appearance="filled"
                    default-value="Filled"
                    label="Filled"
                ></TagInput>
                <TagInput
                    data-upstream-index="2"
                    appearance="filled-outlined"
                    default-value="Filled outlined"
                    label="Filled outlined"
                ></TagInput>
            </div>
        </template>
        <template v-if="scenario === 'tag-input-13'">
            <TagInput
                data-upstream-index="0"
                label="Interests"
                default-value="Hiking, Chess"
                pill
            ></TagInput>
        </template>
        <template v-if="scenario === 'tag-input-14'">
            <div class="wa-stack">
                <TagInput
                    data-upstream-index="0"
                    size="xs"
                    label="Extra small"
                    default-value="Extra small"
                ></TagInput>
                <TagInput
                    data-upstream-index="1"
                    size="s"
                    label="Small"
                    default-value="Small"
                ></TagInput>
                <TagInput
                    data-upstream-index="2"
                    size="m"
                    label="Medium"
                    default-value="Medium"
                ></TagInput>
                <TagInput
                    data-upstream-index="3"
                    size="l"
                    label="Large"
                    default-value="Large"
                ></TagInput>
                <TagInput
                    data-upstream-index="4"
                    size="xl"
                    label="Extra large"
                    default-value="Extra large"
                ></TagInput>
            </div>
        </template>
        <template v-if="scenario === 'tag-input-15'">
            <TagInput
                data-upstream-index="0"
                label="Assignees"
                default-value="Ada, Grace"
                disabled
            ></TagInput>
        </template>
        <template v-if="scenario === 'tag-input-16'">
            <TagInput
                data-upstream-index="0"
                label="Roles"
                default-value="Owner, Maintainer"
                readonly
            ></TagInput>
        </template>
        <template v-if="scenario === 'tag-input-17'">
            <div class="wa-stack">
                <TagInput data-upstream-index="0" label="Recipients" placeholder="Add an email">
                    <Icon data-upstream-index="1" slot="start" name="envelope"></Icon>
                </TagInput>
                <TagInput data-upstream-index="2" label="Keywords" placeholder="Add a keyword">
                    <Icon data-upstream-index="3" slot="start" name="tag"></Icon>
                    <Icon data-upstream-index="4" slot="end" name="circle-info"></Icon>
                </TagInput>
            </div>
        </template>
        <template v-if="scenario === 'tag-input-18'">
            <form class="tag-input-validation">
                <TagInput
                    data-upstream-index="0"
                    name="tags"
                    label="Tags"
                    hint="Add between two and five tags."
                    :min-tags="2"
                    :max-tags="5"
                    required
                ></TagInput>
                <br />
                <Button data-upstream-index="1" appearance="filled" type="submit">Submit</Button>
                <Button data-upstream-index="2" type="reset">Reset</Button>
            </form>
        </template>
        <template v-if="scenario === 'tag-input-19'">
            <form class="tag-input-custom-validity">
                <TagInput
                    data-upstream-index="0"
                    name="emails"
                    label="Invite"
                    hint="Every tag must be an email address."
                    placeholder="name@example.com"
                ></TagInput>
                <br />
                <Button data-upstream-index="1" appearance="filled" type="submit"
                    >Send invites</Button
                >
            </form>
        </template>
        <template v-if="scenario === 'tag-input-20'">
            <TagInput
                data-upstream-index="0"
                class="tag-input-reject"
                label="Usernames"
                hint="Letters, numbers, and underscores only."
                placeholder="Add a username"
            ></TagInput>
        </template>
        <template v-if="scenario === 'tag-input-21'">
            <div class="tag-input-changes">
                <TagInput
                    data-upstream-index="0"
                    label="Labels"
                    default-value="bug, help wanted"
                ></TagInput>
                <p>Labels: <code class="output">bug, help wanted</code></p>
            </div>
        </template>
        <template v-if="scenario === 'tag-input-22'">
            <TagInput
                data-upstream-index="0"
                class="tag-input-styled"
                label="Genres"
                default-value="Jazz, Ambient, Techno"
            ></TagInput>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    CopyButton,
    Divider,
    Icon,
    TagInput,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
