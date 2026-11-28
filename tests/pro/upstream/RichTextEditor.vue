<template>
    <div>
        <template v-if="scenario === 'rich-text-editor-1'">
            <RichTextEditor
                data-upstream-index="0"
                label="Description"
                placeholder="Describe the project"
            ></RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-2'">
            <RichTextEditor
                data-upstream-index="0"
                label="Release Notes"
                hint="Summarize what changed in this version."
            >
                <p>
                    Exports now include <strong>custom fields</strong> and respect the active
                    filters.
                </p>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-3'">
            <RichTextEditor data-upstream-index="0" label="Comment"></RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-4'">
            <RichTextEditor
                data-upstream-index="0"
                label="Bio"
                hint="A few sentences about your background and interests."
            ></RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-5'">
            <RichTextEditor
                data-upstream-index="0"
                label="Reply"
                placeholder="Write a reply"
            ></RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-6'">
            <RichTextEditor data-upstream-index="0" label="Meeting Notes">
                <h2>Decisions</h2>
                <ul>
                    <li>Ship the import tool in the next release.</li>
                    <li>Move the weekly check-in to <strong>Thursdays</strong>.</li>
                </ul>
                <p>Next review is scheduled for <em>the end of the month</em>.</p>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-7'">
            <RichTextEditor
                data-upstream-index="0"
                label="Product Summary"
                default-value="<p>Lightweight, water-resistant, and built for <strong>everyday carry</strong>.</p>"
            ></RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-8'">
            <div class="wa-stack">
                <RichTextEditor
                    data-upstream-index="0"
                    appearance="outlined"
                    label="Outlined"
                    toolbar="bold italic underline"
                ></RichTextEditor> <RichTextEditor
                    data-upstream-index="1"
                    appearance="filled"
                    label="Filled"
                    toolbar="bold italic underline"
                ></RichTextEditor> <RichTextEditor
                    data-upstream-index="2"
                    appearance="filled-outlined"
                    label="Filled outlined"
                    toolbar="bold italic underline"
                ></RichTextEditor>
            </div>
        </template>
        <template v-if="scenario === 'rich-text-editor-9'">
            <div class="wa-stack">
                <RichTextEditor
                    data-upstream-index="0"
                    size="xs"
                    label="Extra small"
                    toolbar="bold italic underline"
                ></RichTextEditor> <RichTextEditor
                    data-upstream-index="1"
                    size="s"
                    label="Small"
                    toolbar="bold italic underline"
                ></RichTextEditor> <RichTextEditor
                    data-upstream-index="2"
                    size="m"
                    label="Medium"
                    toolbar="bold italic underline"
                ></RichTextEditor> <RichTextEditor
                    data-upstream-index="3"
                    size="l"
                    label="Large"
                    toolbar="bold italic underline"
                ></RichTextEditor> <RichTextEditor
                    data-upstream-index="4"
                    size="xl"
                    label="Extra large"
                    toolbar="bold italic underline"
                ></RichTextEditor>
            </div>
        </template>
        <template v-if="scenario === 'rich-text-editor-10'">
            <RichTextEditor data-upstream-index="0" label="Notes" disabled>
                <p>This content can't be edited or focused.</p>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-11'">
            <RichTextEditor data-upstream-index="0" label="Terms" readonly>
                <p>
                    Subscriptions renew automatically at the end of each billing period. You can
                    cancel at any time from your <strong>account settings</strong>.
                </p>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-12'">
            <div class="wa-stack">
                <RichTextEditor
                    data-upstream-index="0"
                    label="Comment"
                    hint="Share your feedback."
                    with-count
                ></RichTextEditor> <RichTextEditor
                    data-upstream-index="1"
                    label="Summary"
                    hint="Keep it short."
                    with-count
                    :maxlength="140"
                ></RichTextEditor>
            </div>
        </template>
        <template v-if="scenario === 'rich-text-editor-13'">
            <form id="rich-text-editor__form" class="wa-stack">
                <RichTextEditor
                    data-upstream-index="0"
                    name="feedback"
                    label="Feedback"
                    hint="At least 20 characters."
                    toolbar="bold italic | bullet-list ordered-list | link"
                    required
                    :minlength="20"
                    :maxlength="500"
                    with-count
                ></RichTextEditor>
                <div class="wa-cluster">
                    <Button data-upstream-index="1" type="submit" variant="brand"
                        >Submit</Button
                    > <Button data-upstream-index="2" type="reset">Reset</Button>
                </div>
            </form>
        </template>
        <template v-if="scenario === 'rich-text-editor-14'">
            <RichTextEditor
                data-upstream-index="0"
                label="Commit Message"
                spellcheck="false"
                autocorrect="off"
                autocapitalize="off"
            >
                <p>Rename fetchUsr to fetchUserById and drop the cachd flag.</p>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-15'">
            <div id="rich-text-editor__markdown" class="wa-stack">
                <RichTextEditor data-upstream-index="0" label="Release Notes" format="markdown">
                    ## What's New - **Faster sync** for large libraries - Export to ==CSV== and
                    ~~XML~~ JSON Read the [full changelog](https://example.com/changelog).
                </RichTextEditor> <Textarea
                    data-upstream-index="1"
                    label="Markdown"
                    :rows="8"
                    readonly
                ></Textarea>
            </div>
        </template>
        <template v-if="scenario === 'rich-text-editor-16'">
            <RichTextEditor
                data-upstream-index="0"
                label="Comment"
                toolbar="bold italic underline | link | undo redo"
            >
                <p>
                    The <strong>groups</strong> in this toolbar follow the
                    <a href="https://example.com/style-guide">style guide</a>.
                </p>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-17'">
            <div class="wa-stack">
                <RichTextEditor
                    data-upstream-index="0"
                    label="Format menu"
                    toolbar="bold italic format-menu"
                >
                    <p>Open the menu to see every text format without a button of its own.</p>
                </RichTextEditor> <RichTextEditor
                    data-upstream-index="1"
                    label="Format menu with underline and strikethrough buttons"
                    toolbar="bold italic underline strikethrough format-menu"
                >
                    <p>Underline and strikethrough have left this menu.</p>
                </RichTextEditor>
            </div>
        </template>
        <template v-if="scenario === 'rich-text-editor-18'">
            <RichTextEditor
                data-upstream-index="0"
                id="rich-text-editor__every-tool"
                label="Article"
                toolbar="block | bold italic underline strikethrough highlight code subscript superscript | color clear-formatting | align bullet-list ordered-list indent outdent | blockquote code-block horizontal-rule | link image embed table | paste-plain-text | undo redo"
            >
                <h2>Field Notes</h2>
                <p>
                    The <strong>north trail</strong> reopens <em>Friday</em>. Bring
                    <mark>water</mark>; the pump at mile 3 is <s>working</s> offline.
                </p>
                <ul>
                    <li>
                        Permits are issued at the
                        <a href="https://example.com/permits">ranger station</a>.
                    </li>
                    <li>Dogs stay leashed past the ridge.</li>
                </ul>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-19'">
            <RichTextEditor
                data-upstream-index="0"
                label="Quick Note"
                toolbar=""
                placeholder="Type # and a space to start a heading"
            ></RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-20'">
            <RichTextEditor
                data-upstream-index="0"
                label="Message"
                placeholder="Write a message"
                toolbar-placement="bottom"
                toolbar="bold italic | link"
                disabled-features="image embed table color align"
                style="--content-min-height: 3em"
            ></RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-21'">
            <RichTextEditor
                data-upstream-index="0"
                id="rich-text-editor__actions"
                label="Support Reply"
                toolbar="bold italic link | actions | undo redo"
            >
                <p>Thanks for reaching out.</p>
                <Button
                    data-upstream-index="1"
                    slot="actions"
                    appearance="plain"
                    size="s"
                    data-action="ticket"
                >
                    <Icon data-upstream-index="2" name="ticket" label="Insert ticket link"></Icon>
                </Button> <Button
                    data-upstream-index="3"
                    slot="actions"
                    appearance="plain"
                    size="s"
                    data-action="date"
                >
                    <Icon
                        data-upstream-index="4"
                        name="calendar-day"
                        label="Insert today's date"
                    ></Icon>
                </Button>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-22'">
            <RichTextEditor
                data-upstream-index="0"
                label="Comment"
                toolbar="bold italic underline strikethrough | bullet-list ordered-list | link"
                disabled-features="image embed table color align"
            ></RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-23'">
            <RichTextEditor
                data-upstream-index="0"
                label="Support Reply"
                disabled-features="table image embed code-block"
            >
                <p>
                    The table and code block below are reduced to paragraphs because tables and code
                    blocks are disabled.
                </p>
                <table>
                    <tbody>
                        <tr>
                            <th>Plan</th>
                            <th>Seats</th>
                        </tr>
                        <tr>
                            <td>Team</td>
                            <td>10</td>
                        </tr>
                    </tbody>
                </table>
                <pre><code>npm install</code></pre>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-24'">
            <RichTextEditor data-upstream-index="0" label="Section" heading-levels="2 3">
                <h1>This heading becomes level 2</h1>
                <p>Open the block menu to see the available levels.</p>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-25'">
            <RichTextEditor
                data-upstream-index="0"
                label="Resources"
                link-target="_blank"
                toolbar="bold italic | link | undo redo"
            >
                <p>Select this text and press the link button to try it.</p>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-26'">
            <RichTextEditor
                data-upstream-index="0"
                label="Post"
                toolbar="block | bold italic | image | undo redo"
            >
                <p>Click the image button and enter the URL of an image.</p>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-27'">
            <RichTextEditor
                data-upstream-index="0"
                label="Story"
                toolbar="bold italic | image | undo redo"
            >
                <p>
                    <img
                        :src="'/assets/images/kits.jpg'"
                        alt="Downloading kits"
                        width="160"
                        style="float: inline-start; margin-inline-end: 1em"
                    />
                    Click the image and choose an alignment. Wrapped images float beside the text of
                    their paragraph, so long paragraphs flow around them while the next paragraph
                    starts below.
                </p>
                <p>This paragraph starts below the image.</p>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-28'">
            <RichTextEditor
                data-upstream-index="0"
                id="rich-text-editor__image-provider"
                label="Post"
                hint="Choose an image with the image button, or paste or drop one."
                toolbar="bold italic | image | undo redo"
            ></RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-29'">
            <RichTextEditor
                data-upstream-index="0"
                label="Lesson"
                toolbar="block | bold italic | link embed | undo redo"
            >
                <p>Click the embed button and paste a video link or embed code.</p>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-30'">
            <RichTextEditor
                data-upstream-index="0"
                label="Pricing Notes"
                toolbar="bold italic | table | undo redo"
            >
                <table>
                    <tbody>
                        <tr>
                            <th>Plan</th>
                            <th>Seats</th>
                            <th>Support</th>
                        </tr>
                        <tr>
                            <td>Starter</td>
                            <td>3</td>
                            <td>Email</td>
                        </tr>
                        <tr>
                            <td>Team</td>
                            <td>25</td>
                            <td>Priority</td>
                        </tr>
                    </tbody>
                </table>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-31'">
            <RichTextEditor
                data-upstream-index="0"
                label="Status Update"
                toolbar="bold italic color | undo redo"
                text-colors="rgb(220 38 38); rgb(234 88 12); rgb(202 138 4); rgb(22 163 74); rgb(37 99 235); rgb(147 51 234); rgb(219 39 119); rgb(75 85 99)"
                highlight-colors="rgb(248 113 113 / 40%); rgb(251 146 60 / 40%); rgb(250 204 21 / 40%); rgb(74 222 128 / 40%); rgb(96 165 250 / 40%); rgb(192 132 252 / 40%); rgb(244 114 182 / 40%); rgb(156 163 175 / 40%)"
            >
                <p>
                    The redesign is <span style="color: rgb(22 163 74)">on track</span> for Friday,
                    but the icon audit is <span style="color: rgb(220 38 38)">blocked</span>.
                    <mark style="background-color: rgb(250 204 21 / 40%)"
                        >Sign-off is due Thursday</mark
                    >, and the
                    <mark style="background-color: rgb(96 165 250 / 40%)">launch checklist</mark> is
                    ready for review.
                </p>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-32'">
            <RichTextEditor
                data-upstream-index="0"
                id="rich-text-editor__colors"
                label="Announcement"
                toolbar="bold italic color | undo redo"
            >
                <p>Select some text, then choose a color. Hover a swatch to see its name.</p>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-33'">
            <div class="wa-stack">
                <RichTextEditor
                    data-upstream-index="0"
                    id="rich-text-editor__shortcuts"
                    label="Release Notes"
                    placeholder='Try typing "# Heading", "- item", "--", or "..."'
                ></RichTextEditor>
                <div class="wa-cluster">
                    <Switch data-upstream-index="1" id="rich-text-editor__smart-punctuation" checked
                        >Smart punctuation</Switch
                    > <Switch
                        data-upstream-index="2"
                        id="rich-text-editor__markdown-shortcuts"
                        checked
                        >Markdown shortcuts</Switch
                    >
                </div>
            </div>
        </template>
        <template v-if="scenario === 'rich-text-editor-34'">
            <RichTextEditor
                data-upstream-index="0"
                id="rich-text-editor__suggestions"
                label="Comment"
                hint="Type @ to mention a teammate or # to add a tag."
                toolbar="bold italic | link"
            ></RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-35'">
            <RichTextEditor
                data-upstream-index="0"
                id="rich-text-editor__formatter"
                label="Comment"
                hint="Type @ to mention a teammate."
                toolbar="bold italic | link"
                data-wa-preload="wa-avatar"
            ></RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-36'">
            <div class="wa-stack">
                <RichTextEditor
                    data-upstream-index="0"
                    id="rich-text-editor__watch"
                    label="Draft"
                    toolbar="block | bold italic | bullet-list | undo redo"
                >
                    <p>Edit this text to see the value change.</p>
                </RichTextEditor>
                <pre
                    id="rich-text-editor__watch-output"
                    style="white-space: pre-wrap; margin: 0"
                ></pre>
            </div>
        </template>
        <template v-if="scenario === 'rich-text-editor-37'">
            <div class="wa-stack">
                <RichTextEditor
                    data-upstream-index="0"
                    id="rich-text-editor__dirty"
                    label="Notes"
                    toolbar="bold italic | bullet-list | undo redo"
                >
                    <p>Edit this text, then save it.</p>
                </RichTextEditor>
                <div class="wa-cluster">
                    <Button
                        data-upstream-index="1"
                        id="rich-text-editor__dirty-save"
                        size="s"
                        disabled
                        >Save</Button
                    > <span id="rich-text-editor__dirty-status">All changes saved</span>
                </div>
            </div>
        </template>
        <template v-if="scenario === 'rich-text-editor-38'">
            <div class="wa-stack">
                <RichTextEditor
                    data-upstream-index="0"
                    id="rich-text-editor__control"
                    label="Changelog"
                    toolbar=""
                >
                    <p>Select text, then use the buttons below.</p>
                    <p>Visit <a href="https://example.com">the release page</a> for details.</p>
                </RichTextEditor>
                <div class="wa-cluster">
                    <Button data-upstream-index="1" id="rich-text-editor__control-heading" size="s"
                        >Heading 2</Button
                    > <Button data-upstream-index="2" id="rich-text-editor__control-date" size="s"
                        >Insert Date</Button
                    > <Button
                        data-upstream-index="3"
                        id="rich-text-editor__control-unlink"
                        size="s"
                        disabled
                        >Remove Link</Button
                    > <Button
                        data-upstream-index="4"
                        id="rich-text-editor__control-undo"
                        size="s"
                        disabled
                        >Undo</Button
                    > <Button
                        data-upstream-index="5"
                        id="rich-text-editor__control-redo"
                        size="s"
                        disabled
                        >Redo</Button
                    >
                </div>
            </div>
        </template>
        <template v-if="scenario === 'rich-text-editor-39'">
            <RichTextEditor data-upstream-index="0" id="rich-text-editor__styling" label="Article">
                <h2>Getting Started</h2>
                <p>Create a workspace, then invite your team.</p>
                <blockquote><p>Most teams are up and running in under ten minutes.</p></blockquote>
            </RichTextEditor>
        </template>
        <template v-if="scenario === 'rich-text-editor-40'">
            <RichTextEditor
                data-upstream-index="0"
                label="Changelog"
                toolbar="bold italic | bullet-list | undo redo"
                style="--content-min-height: 4em; --content-max-height: 10em"
            >
                <ul>
                    <li>Added bulk editing for tasks.</li>
                    <li>Added keyboard shortcuts to the board view.</li>
                    <li>Improved search ranking for recent items.</li>
                    <li>Fixed a bug where due dates shifted across time zones.</li>
                    <li>Fixed a bug where archived projects appeared in search.</li>
                    <li>Removed the legacy export format.</li>
                </ul>
            </RichTextEditor>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Icon,
    Switch,
    Textarea,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
import { RichTextEditor } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
</script>
