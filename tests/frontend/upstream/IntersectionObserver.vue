<template>
    <div>
        <template v-if="scenario === 'intersection-observer-1'">
            <div id="intersection__overview">
                <IntersectionObserver
                    data-upstream-index="0"
                    threshold="1"
                    intersect-class="visible"
                >
                    <div class="box"><Icon data-upstream-index="1" name="lightbulb"></Icon></div>
                </IntersectionObserver>
            </div>

            <small>Scroll to see the element intersect at 100% visibility</small>
        </template>
        <template v-if="scenario === 'intersection-observer-2'">
            <div id="scroll-container">
                <IntersectionObserver
                    data-upstream-index="0"
                    root="scroll-container"
                    root-margin="50px 0px"
                >
                    ...
                </IntersectionObserver>
            </div>
        </template>
        <template v-if="scenario === 'intersection-observer-3'">
            <IntersectionObserver data-upstream-index="0" threshold="0 0.25 0.5 0.75 1">
                ...
            </IntersectionObserver>
        </template>
        <template v-if="scenario === 'intersection-observer-4'">
            <div id="intersection__classes">
                <IntersectionObserver
                    data-upstream-index="0"
                    threshold="0.5"
                    intersect-class="visible"
                    root="intersection__classes"
                >
                    <div class="box fade">Fade In</div>
                    <div class="box slide">Slide In</div>
                    <div class="box scale">Scale & Rotate</div>
                    <div class="box bounce">Bounce</div>
                </IntersectionObserver>
            </div>

            <small>Scroll to see elements transition at 50% visibility</small>
        </template>
        <template v-if="scenario === 'intersection-observer-5'">
            <div style="display: flex; flex-direction: column">
                <IntersectionObserver data-upstream-index="0">
                    <div class="box">Box 1</div>
                    <div class="box">Box 2</div>
                    <div class="box">Box 3</div>
                </IntersectionObserver>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Icon, IntersectionObserver } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
