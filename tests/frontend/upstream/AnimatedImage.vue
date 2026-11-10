<template>
    <div>
        <template v-if="scenario === 'animated-image-1'">
            <AnimatedImage
                data-upstream-index="0"
                src="https://shoelace.style/assets/images/walk.gif"
                alt="Animation of untied shoes walking on pavement"
            ></AnimatedImage>
        </template>
        <template v-if="scenario === 'animated-image-2'">
            <AnimatedImage
                data-upstream-index="0"
                src="https://shoelace.style/assets/images/tie.webp"
                alt="Animation of a shoe being tied"
            ></AnimatedImage>
        </template>
        <template v-if="scenario === 'animated-image-3'">
            <AnimatedImage
                data-upstream-index="0"
                src="https://shoelace.style/assets/images/walk.gif"
                alt="Animation of untied shoes walking on pavement"
                style="width: 150px; height: 200px"
            >
            </AnimatedImage>
        </template>
        <template v-if="scenario === 'animated-image-4'">
            <AnimatedImage
                data-upstream-index="0"
                src="https://shoelace.style/assets/images/walk.gif"
                alt="Animation of untied shoes walking on pavement"
                class="animated-image-custom-control-box"
            ></AnimatedImage>
        </template>
    </div>
</template>

<script setup lang="ts">
import { AnimatedImage } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
