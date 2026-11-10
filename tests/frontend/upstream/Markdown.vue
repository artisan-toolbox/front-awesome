<template>
    <div>
        <template v-if="scenario === 'markdown-1'">
            <Markdown data-upstream-index="0">
                <component
                    :is="'script'"
                    type="text/markdown"
                    :text-content="markdownContents[0]"
                ></component>
            </Markdown>
        </template>
        <template v-if="scenario === 'markdown-2'">
            <Markdown data-upstream-index="0">
                <component
                    :is="'script'"
                    type="text/markdown"
                    :text-content="markdownContents[1]"
                ></component>
            </Markdown>
        </template>
        <template v-if="scenario === 'markdown-3'">
            <Markdown data-upstream-index="0">
                <component
                    :is="'script'"
                    type="text/markdown"
                    :text-content="markdownContents[2]"
                ></component>
            </Markdown>
        </template>
        <template v-if="scenario === 'markdown-4'">
            <Markdown data-upstream-index="0" :tab-size="2">
                <component
                    :is="'script'"
                    type="text/markdown"
                    :text-content="markdownContents[3]"
                ></component>
            </Markdown>
        </template>
        <template v-if="scenario === 'markdown-5'">
            <Markdown data-upstream-index="0">
                <component
                    :is="'script'"
                    type="text/markdown"
                    :text-content="markdownContents[4]"
                ></component>
            </Markdown>
        </template>
        <template v-if="scenario === 'markdown-6'">
            <Markdown data-upstream-index="0" id="markdown__config">
                <component
                    :is="'script'"
                    type="text/markdown"
                    :text-content="markdownContents[5]"
                ></component>
            </Markdown>
        </template>
        <template v-if="scenario === 'markdown-7'">
            <Markdown data-upstream-index="0" id="markdown__plugin">
                <component
                    :is="'script'"
                    type="text/markdown"
                    :text-content="markdownContents[6]"
                ></component>
            </Markdown>
        </template>
        <template v-if="scenario === 'markdown-8'">
            <div id="markdown__dynamic">
                <Markdown data-upstream-index="0" id="markdown__dynamic-md">
                    <component
                        :is="'script'"
                        type="text/markdown"
                        :text-content="markdownContents[7]"
                    ></component>
                </Markdown>
                <br />
                <Button data-upstream-index="1">Update content</Button>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, Markdown } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
const markdownContents = [
    "\n    ## Getting Started\n\n    Here's a quick overview with **bold**, _italic_, and `inline code`.\n\n    - Install the package\n    - Import the component\n    - Start writing markdown\n  ",
    "\n    Markdown with `<angle brackets>` and **formatting** that won't get parsed as HTML.\n  ",
    '\n    ## Deeply Indented\n\n    Even though this content is heavily indented in the source,\n    the shared whitespace is stripped before parsing.\n\n        Lines with extra indentation beyond the common\n        prefix are preserved, like this code block.\n  ',
    '\n    ...\n  ',
    '\n    ## Feature Overview\n\n    Steps to set up your project:\n\n    1. Clone the repository\n    2. Install dependencies\n    3. Run the dev server\n\n    A relevant quote:\n\n    > "Simplicity is the ultimate sophistication." — Leonardo da Vinci\n\n    And an autolink: <https://developer.mozilla.org>\n  ',
    '\n    Visit https://developer.mozilla.org for documentation.\n  ',
    '\n    This text has a ==highlighted phrase== in the middle.\n  ',
    '\n      Click the button to swap this content out.\n    ',
];
</script>
