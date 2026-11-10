<template>
    <div>
        <template v-if="scenario === 'zoomable-frame-1'">
            <ZoomableFrame data-upstream-index="0" src="/examples/themes/showcase" :zoom="0.5">
            </ZoomableFrame>
        </template>
        <template v-if="scenario === 'zoomable-frame-2'">
            <ZoomableFrame data-upstream-index="0" src="https://example.com/"> </ZoomableFrame>
        </template>
        <template v-if="scenario === 'zoomable-frame-3'">
            <ZoomableFrame
                data-upstream-index="0"
                src="https://example.com/"
                style="aspect-ratio: 4/3"
            >
            </ZoomableFrame>
        </template>
        <template v-if="scenario === 'zoomable-frame-4'">
            <ZoomableFrame
                data-upstream-index="0"
                srcdoc="<html><body><h1>Hello, World!</h1><p>This is inline content.</p></body></html>"
            >
            </ZoomableFrame>
        </template>
        <template v-if="scenario === 'zoomable-frame-5'">
            <ZoomableFrame
                data-upstream-index="0"
                src="/examples/themes/showcase"
                :zoom="0.5"
                zoom-levels="50% 0.75 100%"
            >
            </ZoomableFrame>
        </template>
        <template v-if="scenario === 'zoomable-frame-6'">
            <ZoomableFrame
                data-upstream-index="0"
                src="/examples/themes/showcase"
                without-controls
                :zoom="0.5"
            >
            </ZoomableFrame>
        </template>
        <template v-if="scenario === 'zoomable-frame-7'">
            <ZoomableFrame
                data-upstream-index="0"
                src="/examples/themes/showcase"
                :zoom="0.5"
                without-interaction
            >
            </ZoomableFrame>
        </template>
        <template v-if="scenario === 'zoomable-frame-8'">
            <div class="wa-stack">
                <ZoomableFrame
                    data-upstream-index="0"
                    sandbox=""
                    without-controls
                    style="height: 4rem; background: var(--wa-color-danger-fill-quiet)"
                    srcdoc="<body style='margin: 0; display: grid; place-items: center; height: 100vh; font-family: system-ui'><p><span id='icon' aria-hidden='true'>🧙</span> <span id='msg'>You shall not pass.</span></p><script>icon.textContent = '🐇'; msg.textContent = 'The script ran.'</script></body>"
                ></ZoomableFrame>

                <ZoomableFrame
                    data-upstream-index="1"
                    sandbox="allow-scripts"
                    without-controls
                    style="height: 4rem; background: var(--wa-color-success-fill-quiet)"
                    srcdoc="<body style='margin: 0; display: grid; place-items: center; height: 100vh; font-family: system-ui'><p><span id='icon' aria-hidden='true'>🧙</span> <span id='msg'>You shall not pass.</span></p><script>icon.textContent = '🐇'; msg.textContent = 'The script ran.'</script></body>"
                ></ZoomableFrame>
            </div>
        </template>
        <template v-if="scenario === 'zoomable-frame-9'">
            <ZoomableFrame
                data-upstream-index="0"
                src="https://example.com/"
                allow="clipboard-write; fullscreen"
            >
            </ZoomableFrame>
        </template>
        <template v-if="scenario === 'zoomable-frame-10'">
            <ZoomableFrame
                data-upstream-index="0"
                src="/examples/themes/showcase"
                label="Theme preview"
            >
            </ZoomableFrame>
        </template>
        <template v-if="scenario === 'zoomable-frame-11'">
            <ZoomableFrame
                data-upstream-index="0"
                src="/examples/themes/showcase"
                :zoom="0.5"
                with-theme-sync
            >
            </ZoomableFrame>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ZoomableFrame } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
