<template>
    <div>
        <template v-if="scenario === 'relative-time-1'">
            <!-- Web Awesome 3 release date 🎉 -->
            <RelativeTime data-upstream-index="0" date="2025-12-02T00:00:00-05:00"></RelativeTime>
        </template>
        <template v-if="scenario === 'relative-time-2'">
            <div class="relative-time-sync">
                <RelativeTime data-upstream-index="0" sync></RelativeTime>
            </div>
        </template>
        <template v-if="scenario === 'relative-time-3'">
            <RelativeTime
                data-upstream-index="0"
                date="2025-12-02T00:00:00-05:00"
                format="narrow"
            ></RelativeTime
            ><br />
            <RelativeTime
                data-upstream-index="1"
                date="2025-12-02T00:00:00-05:00"
                format="short"
            ></RelativeTime
            ><br />
            <RelativeTime
                data-upstream-index="2"
                date="2025-12-02T00:00:00-05:00"
                format="long"
            ></RelativeTime>
        </template>
        <template v-if="scenario === 'relative-time-4'">
            English:
            <RelativeTime
                data-upstream-index="0"
                date="2025-12-02T00:00:00-05:00"
                lang="en-US"
            ></RelativeTime
            ><br />
            Chinese:
            <RelativeTime
                data-upstream-index="1"
                date="2025-12-02T00:00:00-05:00"
                lang="zh-CN"
            ></RelativeTime
            ><br />
            German:
            <RelativeTime
                data-upstream-index="2"
                date="2025-12-02T00:00:00-05:00"
                lang="de"
            ></RelativeTime
            ><br />
            Greek:
            <RelativeTime
                data-upstream-index="3"
                date="2025-12-02T00:00:00-05:00"
                lang="el"
            ></RelativeTime
            ><br />
            Russian:
            <RelativeTime
                data-upstream-index="4"
                date="2025-12-02T00:00:00-05:00"
                lang="ru"
            ></RelativeTime>
        </template>
    </div>
</template>

<script setup lang="ts">
import { RelativeTime } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
