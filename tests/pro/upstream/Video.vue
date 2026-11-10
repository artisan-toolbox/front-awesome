<template>
    <div>
        <template v-if="scenario === 'video-1'">
            <Video data-upstream-index="0" title="Web Awesome" controls="full">
                <source src="https://uploads.webawesome.com/waks_compressed.mp4" type="video/mp4" />
            </Video>
        </template>
        <template v-if="scenario === 'video-2'">
            <Video
                data-upstream-index="0"
                src="https://uploads.webawesome.com/01-create-your-first-kit.mp4"
                title="Creating a Font Awesome Kit"
                poster="/assets/images/fa-part-1.jpg"
            ></Video>
        </template>
        <template v-if="scenario === 'video-3'">
            <Video
                data-upstream-index="0"
                title="Creating a Font Awesome Kit"
                poster="/assets/images/fa-part-1.jpg"
            >
                <source
                    src="https://uploads.webawesome.com/01-create-your-first-kit.mp4"
                    type="video/mp4"
                />
                <source
                    src="https://uploads.webawesome.com/01-create-your-first-kit.ogv"
                    type="video/ogg"
                />
                <source
                    src="https://uploads.webawesome.com/01-create-your-first-kit.webm"
                    type="video/webm"
                />
            </Video>
        </template>
        <template v-if="scenario === 'video-4'">
            <div class="video-controls-demo">
                <Video
                    data-upstream-index="0"
                    controls="standard"
                    title="Using Kits in Your Project"
                    poster="/assets/images/fa-part-2.jpg"
                >
                    <source
                        src="https://uploads.webawesome.com/02-using-kits-in-your-project.mp4"
                        type="video/mp4"
                    />
                    <track
                        src="https://uploads.webawesome.com/02-using-kits-in-your-project.vtt"
                        kind="subtitles"
                        srclang="en"
                        label="English"
                    />
                </Video>

                <Divider data-upstream-index="1"></Divider>

                <RadioGroup
                    data-upstream-index="2"
                    label="Controls"
                    value="standard"
                    orientation="horizontal"
                >
                    <Radio data-upstream-index="3" appearance="button" value="standard"
                        >standard</Radio
                    >
                    <Radio data-upstream-index="4" appearance="button" value="full">full</Radio>
                    <Radio data-upstream-index="5" appearance="button" value="none">none</Radio>
                </RadioGroup>
            </div>
        </template>
        <template v-if="scenario === 'video-5'">
            <Video
                data-upstream-index="0"
                title="Using Teams"
                poster="/assets/images/teams.jpg"
                controls="full"
            >
                <source
                    src="https://uploads.webawesome.com/Doing%20More%20with%20FA%20Ep.%202%20'Using%20Teams'.mp4"
                    type="video/mp4"
                />
            </Video>
        </template>
        <template v-if="scenario === 'video-6'">
            <Video
                data-upstream-index="0"
                controls="standard"
                title="Creating a Font Awesome Kit"
                poster="/assets/images/fa-part-1.jpg"
            >
                <source
                    src="https://uploads.webawesome.com/01-create-your-first-kit.mp4"
                    type="video/mp4"
                />
                <track
                    src="https://uploads.webawesome.com/01-create-your-first-kit.vtt"
                    kind="subtitles"
                    srclang="en"
                    label="English"
                />
            </Video>
        </template>
        <template v-if="scenario === 'video-7'">
            <Video
                data-upstream-index="0"
                title="Using Teams"
                poster="/assets/images/teams.jpg"
                controls="full"
            >
                <Icon data-upstream-index="1" slot="poster-icon" name="film"></Icon>
                <Icon data-upstream-index="2" slot="play-icon" name="circle-play"></Icon>
                <Icon data-upstream-index="3" slot="pause-icon" name="circle-pause"></Icon>
                <source
                    src="https://uploads.webawesome.com/Doing%20More%20with%20FA%20Ep.%202%20'Using%20Teams'.mp4"
                    type="video/mp4"
                />
            </Video>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Divider,
    Icon,
    Radio,
    RadioGroup,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
import { Video } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
</script>
