<template>
    <div>
        <template v-if="scenario === 'popover-1'">
            <Popover data-upstream-index="0" for="popover__overview">
                <div style="display: flex; flex-direction: column; gap: 1rem">
                    <p>
                        This popover contains interactive content that users can engage with
                        directly.
                    </p>
                    <Button data-upstream-index="1" appearance="filled" variant="brand" size="s"
                        >Take Action</Button
                    >
                </div>
            </Popover>

            <Button data-upstream-index="2" appearance="filled" id="popover__overview"
                >Show popover</Button
            >
        </template>
        <template v-if="scenario === 'popover-2'">
            <Button data-upstream-index="0" appearance="filled" id="popover__anchor-button"
                >Show Popover</Button
            >

            <Popover data-upstream-index="1" for="popover__anchor-button">
                I'm anchored to a Web Awesome button.
            </Popover>

            <br /><br />

            <button class="wa-filled" id="popover__anchor-native-button">Show Popover</button>

            <Popover data-upstream-index="2" for="popover__anchor-native-button">
                I'm anchored to a native button.
            </Popover>
        </template>
        <template v-if="scenario === 'popover-3'">
            <Popover data-upstream-index="0" for="popover__opening">
                <p>
                    The button below has <code>data-popover="close"</code> so clicking it will close
                    the popover.
                </p>
                <Button
                    data-upstream-index="1"
                    appearance="filled"
                    data-popover="close"
                    variant="brand"
                    >Dismiss</Button
                >
            </Popover>

            <Button data-upstream-index="2" appearance="filled" id="popover__opening"
                >Show popover</Button
            >
        </template>
        <template v-if="scenario === 'popover-4'">
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center">
                <Button data-upstream-index="0" appearance="filled" id="popover__top">Top</Button>
                <Popover data-upstream-index="1" for="popover__top" placement="top"
                    >I'm on the top</Popover
                >

                <Button data-upstream-index="2" appearance="filled" id="popover__bottom"
                    >Bottom</Button
                >
                <Popover data-upstream-index="3" for="popover__bottom" placement="bottom"
                    >I'm on the bottom</Popover
                >

                <Button data-upstream-index="4" appearance="filled" id="popover__left">Left</Button>
                <Popover data-upstream-index="5" for="popover__left" placement="left"
                    >I'm on the left</Popover
                >

                <Button data-upstream-index="6" appearance="filled" id="popover__right"
                    >Right</Button
                >
                <Popover data-upstream-index="7" for="popover__right" placement="right"
                    >I'm on the right</Popover
                >
            </div>
        </template>
        <template v-if="scenario === 'popover-5'">
            <div style="display: flex; gap: 1rem; align-items: center">
                <Button data-upstream-index="0" appearance="filled" id="popover__distance-near"
                    >Near</Button
                >
                <Popover data-upstream-index="1" for="popover__distance-near" :distance="0"
                    >I'm very close</Popover
                >

                <Button data-upstream-index="2" appearance="filled" id="popover__distance-far"
                    >Far</Button
                >
                <Popover data-upstream-index="3" for="popover__distance-far" :distance="30"
                    >I'm farther away</Popover
                >
            </div>
        </template>
        <template v-if="scenario === 'popover-6'">
            <div style="display: flex; gap: 1rem; align-items: center">
                <Button data-upstream-index="0" appearance="filled" id="popover__big-arrow"
                    >Big arrow</Button
                >
                <Popover data-upstream-index="1" for="popover__big-arrow" style="--arrow-size: 8px"
                    >I have a big arrow</Popover
                >

                <Button data-upstream-index="2" appearance="filled" id="popover__no-arrow"
                    >No arrow</Button
                >
                <Popover data-upstream-index="3" for="popover__no-arrow" without-arrow
                    >I don't have an arrow</Popover
                >
            </div>
        </template>
        <template v-if="scenario === 'popover-7'">
            <Button data-upstream-index="0" appearance="filled" id="popover__max-width"
                >Toggle me</Button
            >
            <Popover data-upstream-index="1" for="popover__max-width" style="--max-width: 160px">
                Popovers will usually grow to be much wider, but this one has a custom max width
                that forces text to wrap.
            </Popover>
        </template>
        <template v-if="scenario === 'popover-8'">
            <Popover data-upstream-index="0" for="popover__autofocus">
                <div style="display: flex; flex-direction: column; gap: 1rem">
                    <Textarea
                        data-upstream-index="1"
                        autofocus
                        placeholder="What's on your mind?"
                        size="s"
                        resize="none"
                        :rows="2"
                    ></Textarea>
                    <Button
                        data-upstream-index="2"
                        appearance="filled"
                        variant="brand"
                        size="s"
                        data-popover="close"
                    >
                        Submit
                    </Button>
                </div>
            </Popover>

            <Button data-upstream-index="3" appearance="filled" id="popover__autofocus">
                <Icon data-upstream-index="4" name="comment" slot="start"></Icon>
                Feedback
            </Button>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Icon,
    Popover,
    Textarea,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
