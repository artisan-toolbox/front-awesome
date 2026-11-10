<template>
    <div>
        <template v-if="scenario === 'details-1'">
            <Details data-upstream-index="0" summary="Toggle Me">
                Click the summary to expand and collapse the details component. You can put any
                content in here that you want to reveal on demand!
            </Details>
        </template>
        <template v-if="scenario === 'details-2'">
            <Details data-upstream-index="0" summary="Toggle Me" open>
                This details component is expanded by default. Users can click the summary to
                collapse it if they want to hide the content.
            </Details>
        </template>
        <template v-if="scenario === 'details-3'">
            <Details data-upstream-index="0" summary="Disabled" disabled>
                This content can't be seen because the details component is disabled. Try removing
                the disabled attribute to reveal what's inside!
            </Details>
        </template>
        <template v-if="scenario === 'details-4'">
            <Details data-upstream-index="0" summary="Toggle Me" class="custom-icons">
                <Icon
                    data-upstream-index="1"
                    name="square-plus"
                    slot="expand-icon"
                    variant="regular"
                ></Icon>
                <Icon
                    data-upstream-index="2"
                    name="square-minus"
                    slot="collapse-icon"
                    variant="regular"
                ></Icon>

                This example uses custom plus and minus icons for expanding and collapsing. You can
                use any icon you want to match the look and feel of your app.
            </Details>
        </template>
        <template v-if="scenario === 'details-5'">
            <div class="wa-stack">
                <Details data-upstream-index="0" summary="Start" icon-placement="start">
                    The expand/collapse icon is at the start of the summary. This is a common
                    pattern that feels familiar to users who are used to tree views and file
                    explorers.
                </Details>
                <Details data-upstream-index="1" summary="End" icon-placement="end">
                    The expand/collapse icon is at the end of the summary. This is the default
                    placement and works great for most use cases.
                </Details>
            </div>
        </template>
        <template v-if="scenario === 'details-6'">
            <Details data-upstream-index="0">
                <span slot="summary">
                    Some text
                    <a href="https://webawesome.com" target="_blank">a link</a>
                    more text
                </span>

                You can use the summary slot to put HTML in the summary, including links and other
                interactive elements. Pretty neat, right?
            </Details>
        </template>
        <template v-if="scenario === 'details-7'">
            <div class="wa-stack">
                <Details data-upstream-index="0" summary="تبديلني" lang="ar" dir="rtl">
                    استخدام طريقة لوريم إيبسوم لأنها تعطي توزيعاَ طبيعياَ -إلى حد ما- للأحرف عوضاً
                    عن
                </Details>
                <Details
                    data-upstream-index="1"
                    summary="تبديلني"
                    lang="ar"
                    dir="rtl"
                    icon-placement="start"
                >
                    استخدام طريقة لوريم إيبسوم لأنها تعطي توزيعاَ طبيعياَ -إلى حد ما- للأحرف عوضاً
                    عن
                </Details>
            </div>
        </template>
        <template v-if="scenario === 'details-8'">
            <div class="wa-stack">
                <Details data-upstream-index="0" summary="Outlined (default)">
                    This is the default outlined appearance. It has a subtle border that helps it
                    stand out without being too flashy.
                </Details>
                <Details
                    data-upstream-index="1"
                    summary="Filled-outlined"
                    appearance="filled-outlined"
                >
                    The filled-outlined appearance combines a filled header with an outlined body.
                    It gives the summary a bit more visual weight while keeping the content area
                    clean.
                </Details>
                <Details data-upstream-index="2" summary="Filled" appearance="filled">
                    The filled appearance adds a background color to the entire component. Use this
                    when you want the details to really pop on the page.
                </Details>
                <Details data-upstream-index="3" summary="Plain" appearance="plain">
                    No bells and whistles on this one. The plain appearance strips away borders and
                    backgrounds for a minimalist look.
                </Details>
            </div>
        </template>
        <template v-if="scenario === 'details-9'">
            <div class="wa-stack">
                <Details data-upstream-index="0" name="group-1" summary="Section 1" open>
                    This is the first section of the accordion. When you open another section, this
                    one will close automatically. Give it a try!
                </Details>

                <Details data-upstream-index="1" name="group-1" summary="Section 2">
                    This is the second section. Notice how the first section closed when you opened
                    this one? That's the accordion behavior in action, powered by the shared name
                    attribute.
                </Details>

                <Details data-upstream-index="2" name="group-1" summary="Section 3">
                    And here's the third section. You can have as many sections as you need — just
                    make sure they all share the same name and only one will be open at a time.
                </Details>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Details, Icon } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
