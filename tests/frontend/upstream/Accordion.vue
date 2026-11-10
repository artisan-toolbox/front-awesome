<template>
    <div>
        <template v-if="scenario === 'accordion-1'">
            <Accordion data-upstream-index="0">
                <AccordionItem data-upstream-index="1" label="What is Web Awesome?">
                    Web Awesome is a comprehensive library of web components you can use to build
                    beautiful, accessible web applications. It's built on open web standards and
                    works with any framework.
                </AccordionItem>
                <AccordionItem data-upstream-index="2" label="Is it free to use?">
                    The core Web Awesome library is completely free and open source. A Pro tier is
                    also available with additional components and features.
                </AccordionItem>
                <AccordionItem data-upstream-index="3" label="Does it work with my framework?">
                    Yes! Web Awesome components are built as native web components, so they work
                    with any framework including React, Vue, Angular, Svelte, or plain HTML.
                </AccordionItem>
            </Accordion>
        </template>
        <template v-if="scenario === 'accordion-2'">
            <Accordion data-upstream-index="0">
                <AccordionItem data-upstream-index="1" label="Already open" expanded>
                    This item is expanded by default. Click the header to collapse it.
                </AccordionItem>
                <AccordionItem data-upstream-index="2" label="Click to open">
                    This item starts collapsed. Click the header to expand it.
                </AccordionItem>
            </Accordion>
        </template>
        <template v-if="scenario === 'accordion-3'">
            <Accordion data-upstream-index="0">
                <AccordionItem data-upstream-index="1" label="Active item" expanded>
                    This item can be expanded and collapsed normally.
                </AccordionItem>
                <AccordionItem data-upstream-index="2" label="Disabled item" disabled>
                    This item is disabled and cannot be toggled.
                </AccordionItem>
            </Accordion>
        </template>
        <template v-if="scenario === 'accordion-4'">
            <Accordion data-upstream-index="0" heading-level="2">
                <AccordionItem data-upstream-index="1" label="Section one">
                    This trigger is wrapped in an <code>&lt;h2&gt;</code>.
                </AccordionItem>
                <AccordionItem data-upstream-index="2" label="Section two">
                    Match the level to where this accordion sits in your document outline.
                </AccordionItem>
            </Accordion>
        </template>
        <template v-if="scenario === 'accordion-5'">
            <Accordion data-upstream-index="0" heading-level="none">
                <AccordionItem data-upstream-index="1" label="Settings">
                    Adjust your preferences here.
                </AccordionItem>
                <AccordionItem data-upstream-index="2" label="Notifications">
                    Manage how and when you receive notifications.
                </AccordionItem>
            </Accordion>
        </template>
        <template v-if="scenario === 'accordion-6'">
            <Accordion data-upstream-index="0" style="font-size: 0.875rem">
                <AccordionItem data-upstream-index="1" label="Small accordion">
                    Text and icon scale down together.
                </AccordionItem>
                <AccordionItem data-upstream-index="2" label="Another item"
                    >Content here.</AccordionItem
                >
            </Accordion>

            <br />

            <Accordion data-upstream-index="3">
                <AccordionItem data-upstream-index="4" label="Default accordion">
                    The default size.
                </AccordionItem>
                <AccordionItem data-upstream-index="5" label="Another item"
                    >Content here.</AccordionItem
                >
            </Accordion>

            <br />

            <Accordion data-upstream-index="6" style="font-size: 1.25rem">
                <AccordionItem data-upstream-index="7" label="Large accordion">
                    Everything scales up together.
                </AccordionItem>
                <AccordionItem data-upstream-index="8" label="Another item"
                    >Content here.</AccordionItem
                >
            </Accordion>
        </template>
        <template v-if="scenario === 'accordion-7'">
            <div class="wa-stack">
                <Accordion data-upstream-index="0">
                    <AccordionItem data-upstream-index="1" label="Outlined (default)">
                        This is the default outlined appearance. It has a subtle border that helps
                        it stand out without being too flashy.
                    </AccordionItem>
                    <AccordionItem data-upstream-index="2" label="Another item"
                        >More content here.</AccordionItem
                    >
                </Accordion>

                <Accordion data-upstream-index="3" appearance="filled-outlined">
                    <AccordionItem data-upstream-index="4" label="Filled-outlined">
                        The filled-outlined appearance combines a filled header with an outlined
                        body. It gives the summary a bit more visual weight while keeping the
                        content area clean.
                    </AccordionItem>
                    <AccordionItem data-upstream-index="5" label="Another item"
                        >More content here.</AccordionItem
                    >
                </Accordion>

                <Accordion data-upstream-index="6" appearance="filled">
                    <AccordionItem data-upstream-index="7" label="Filled">
                        The filled appearance adds a background color to the entire component. Use
                        this when you want the details to really pop on the page.
                    </AccordionItem>
                    <AccordionItem data-upstream-index="8" label="Another item"
                        >More content here.</AccordionItem
                    >
                </Accordion>

                <Accordion data-upstream-index="9" appearance="plain">
                    <AccordionItem data-upstream-index="10" label="Plain">
                        No bells and whistles on this one. The plain appearance strips away borders
                        and backgrounds for a minimalist look.
                    </AccordionItem>
                    <AccordionItem data-upstream-index="11" label="Another item"
                        >More content here.</AccordionItem
                    >
                </Accordion>
            </div>
        </template>
        <template v-if="scenario === 'accordion-8'">
            <Accordion data-upstream-index="0" mode="single">
                <AccordionItem data-upstream-index="1" label="Section one" expanded>
                    Opening another section will automatically collapse this one. Only one section
                    can be open at a time.
                </AccordionItem>
                <AccordionItem data-upstream-index="2" label="Section two">
                    Try opening this section to see section one collapse automatically.
                </AccordionItem>
                <AccordionItem data-upstream-index="3" label="Section three">
                    Clicking an already-open section won't close it — open another instead.
                </AccordionItem>
            </Accordion>
        </template>
        <template v-if="scenario === 'accordion-9'">
            <Accordion data-upstream-index="0" mode="single-collapsible">
                <AccordionItem data-upstream-index="1" label="Filters">
                    Opening another section will collapse this one, and clicking the open section
                    closes it.
                </AccordionItem>
                <AccordionItem data-upstream-index="2" label="Sort">
                    Try opening and closing each section in turn.
                </AccordionItem>
                <AccordionItem data-upstream-index="3" label="Display">
                    Zero open sections is a valid state in this mode.
                </AccordionItem>
            </Accordion>
        </template>
        <template v-if="scenario === 'accordion-10'">
            <Accordion data-upstream-index="0" icon-placement="start">
                <AccordionItem data-upstream-index="1" label="Start"
                    >Icon is at the start of the header.</AccordionItem
                >
                <AccordionItem data-upstream-index="2" label="Another item"
                    >More content here.</AccordionItem
                >
            </Accordion>
        </template>
        <template v-if="scenario === 'accordion-11'">
            <Accordion data-upstream-index="0">
                <AccordionItem
                    data-upstream-index="1"
                    label="Rotate a custom icon"
                    class="circle-plus"
                >
                    <Icon
                        data-upstream-index="2"
                        slot="icon"
                        name="circle-plus"
                        variant="regular"
                    ></Icon>
                    Replace the default chevron and customize how it rotates.
                </AccordionItem>
                <AccordionItem
                    data-upstream-index="3"
                    label="Swap the icon instead"
                    class="plus-minus"
                >
                    <Icon
                        data-upstream-index="4"
                        slot="icon"
                        name="square-plus"
                        variant="regular"
                        data-when="collapsed"
                    ></Icon>
                    <Icon
                        data-upstream-index="5"
                        slot="icon"
                        name="square-minus"
                        variant="regular"
                        data-when="expanded"
                    ></Icon>
                    Prevent the rotation and swap + for − when the item expands.
                </AccordionItem>
            </Accordion>
        </template>
        <template v-if="scenario === 'accordion-12'">
            <Accordion data-upstream-index="0">
                <AccordionItem data-upstream-index="1">
                    <div slot="label" class="wa-split">
                        <span>Tasks</span>
                        <Badge
                            data-upstream-index="2"
                            appearance="filled"
                            variant="success"
                            style="font-size: var(--wa-font-size-xs)"
                            >3 ready</Badge
                        >
                    </div>
                    All three tasks are ready to be reviewed.
                </AccordionItem>
                <AccordionItem data-upstream-index="3">
                    <div slot="label" class="wa-split">
                        <span>Issues</span>
                        <Badge
                            data-upstream-index="4"
                            appearance="filled"
                            variant="danger"
                            style="font-size: var(--wa-font-size-xs)"
                            >2 open</Badge
                        >
                    </div>
                    There are two open issues that need your attention.
                </AccordionItem>
            </Accordion>
        </template>
        <template v-if="scenario === 'accordion-13'">
            <div>
                <Accordion data-upstream-index="0" id="accordion-methods">
                    <AccordionItem data-upstream-index="1" label="Section one"
                        >Content for the first section.</AccordionItem
                    >
                    <AccordionItem data-upstream-index="2" label="Section two"
                        >Content for the second section.</AccordionItem
                    >
                    <AccordionItem data-upstream-index="3" label="Section three"
                        >Content for the third section.</AccordionItem
                    >
                </Accordion>

                <Divider data-upstream-index="4"></Divider>

                <div class="wa-cluster">
                    <Button data-upstream-index="5" appearance="filled" id="expand-all"
                        >Expand All</Button
                    >
                    <Button data-upstream-index="6" appearance="filled" id="collapse-all"
                        >Collapse All</Button
                    >
                </div>
            </div>
        </template>
        <template v-if="scenario === 'accordion-14'">
            <Accordion data-upstream-index="0">
                <AccordionItem data-upstream-index="1" label="Fruits" expanded>
                    <Accordion data-upstream-index="2" mode="single">
                        <AccordionItem data-upstream-index="3" label="Apples"
                            >Crisp, sweet, and great for pies.</AccordionItem
                        >
                        <AccordionItem data-upstream-index="4" label="Oranges"
                            >Juicy and packed with vitamin C.</AccordionItem
                        >
                        <AccordionItem data-upstream-index="5" label="Bananas"
                            >Soft, sweet, and easy to peel.</AccordionItem
                        >
                    </Accordion>
                </AccordionItem>
                <AccordionItem data-upstream-index="6" label="Vegetables">
                    <Accordion data-upstream-index="7" mode="single">
                        <AccordionItem data-upstream-index="8" label="Carrots"
                            >Crunchy and rich in beta carotene.</AccordionItem
                        >
                        <AccordionItem data-upstream-index="9" label="Broccoli"
                            >A nutrient-dense cruciferous vegetable.</AccordionItem
                        >
                    </Accordion>
                </AccordionItem>
            </Accordion>
        </template>
        <template v-if="scenario === 'accordion-15'">
            <Accordion data-upstream-index="0" id="accordion-prevent">
                <AccordionItem data-upstream-index="1" label="Locked open" expanded>
                    This item is locked open — the <code>wa-collapse</code> event is being
                    intercepted and prevented.
                </AccordionItem>
                <AccordionItem data-upstream-index="2" label="Works normally">
                    This item can be toggled normally.
                </AccordionItem>
            </Accordion>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Accordion,
    AccordionItem,
    Badge,
    Button,
    Divider,
    Icon,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
