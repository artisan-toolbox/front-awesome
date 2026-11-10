<template>
    <div>
        <template v-if="scenario === 'skeleton-1'">
            <div class="skeleton-overview">
                <header>
                    <Skeleton data-upstream-index="0" effect="sheen"></Skeleton>
                    <Skeleton data-upstream-index="1" effect="sheen"></Skeleton>
                </header>

                <Skeleton data-upstream-index="2" effect="sheen"></Skeleton>
                <Skeleton data-upstream-index="3" effect="sheen"></Skeleton>
                <Skeleton data-upstream-index="4" effect="sheen"></Skeleton>
            </div>
        </template>
        <template v-if="scenario === 'skeleton-2'">
            <div class="skeleton-effects">
                <Skeleton data-upstream-index="0" effect="none"></Skeleton>
                None

                <Skeleton data-upstream-index="1" effect="sheen"></Skeleton>
                Sheen

                <Skeleton data-upstream-index="2" effect="pulse"></Skeleton>
                Pulse
            </div>
        </template>
        <template v-if="scenario === 'skeleton-3'">
            <div class="skeleton-paragraphs">
                <Skeleton data-upstream-index="0"></Skeleton>
                <Skeleton data-upstream-index="1"></Skeleton>
                <Skeleton data-upstream-index="2"></Skeleton>
                <Skeleton data-upstream-index="3"></Skeleton>
                <Skeleton data-upstream-index="4"></Skeleton>
            </div>
        </template>
        <template v-if="scenario === 'skeleton-4'">
            <div class="skeleton-avatars">
                <Skeleton data-upstream-index="0"></Skeleton>
                <Skeleton data-upstream-index="1"></Skeleton>
                <Skeleton data-upstream-index="2"></Skeleton>
            </div>
        </template>
        <template v-if="scenario === 'skeleton-5'">
            <div class="skeleton-shapes">
                <Skeleton data-upstream-index="0" class="square"></Skeleton>
                <Skeleton data-upstream-index="1" class="circle"></Skeleton>
                <Skeleton data-upstream-index="2" class="triangle"></Skeleton>
                <Skeleton data-upstream-index="3" class="cross"></Skeleton>
                <Skeleton data-upstream-index="4" class="comment"></Skeleton>
            </div>
        </template>
        <template v-if="scenario === 'skeleton-6'">
            <Skeleton
                data-upstream-index="0"
                effect="sheen"
                style="
                    --color: var(--wa-color-brand-fill-loud);
                    --sheen-color: var(--wa-color-brand-fill-quiet);
                "
            ></Skeleton>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
