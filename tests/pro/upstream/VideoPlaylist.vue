<template>
    <div>
        <template v-if="scenario === 'video-playlist-1'">
            <VideoPlaylist data-upstream-index="0">
                <Video
                    data-upstream-index="1"
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

                <Video
                    data-upstream-index="2"
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
                <Video
                    data-upstream-index="3"
                    title="Downloading Kits"
                    poster="/assets/images/kits.jpg"
                >
                    <source
                        src="https://uploads.webawesome.com/Doing%20More%20with%20FA%20Ep.%203%20'Downloading%20Kits'.mp4"
                        type="video/mp4"
                    />
                </Video>
                <Video
                    data-upstream-index="4"
                    title="Using Teams"
                    poster="/assets/images/teams.jpg"
                >
                    <source
                        src="https://uploads.webawesome.com/Doing%20More%20with%20FA%20Ep.%202%20'Using%20Teams'.mp4"
                        type="video/mp4"
                    />
                </Video>
            </VideoPlaylist>
        </template>
        <template v-if="scenario === 'video-playlist-2'">
            <VideoPlaylist data-upstream-index="0" controls="standard">
                <Video
                    data-upstream-index="1"
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

                <Video
                    data-upstream-index="2"
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
            </VideoPlaylist>
        </template>
        <template v-if="scenario === 'video-playlist-3'">
            <div>
                <VideoPlaylist data-upstream-index="0" id="demo-playlist">
                    <Video
                        data-upstream-index="1"
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

                    <Video
                        data-upstream-index="2"
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
                    <Video
                        data-upstream-index="3"
                        title="Downloading Kits"
                        poster="/assets/images/kits.jpg"
                    >
                        <source
                            src="https://uploads.webawesome.com/Doing%20More%20with%20FA%20Ep.%203%20'Downloading%20Kits'.mp4"
                            type="video/mp4"
                        />
                    </Video>
                    <Video
                        data-upstream-index="4"
                        title="Using Teams"
                        poster="/assets/images/teams.jpg"
                    >
                        <source
                            src="https://uploads.webawesome.com/Doing%20More%20with%20FA%20Ep.%202%20'Using%20Teams'.mp4"
                            type="video/mp4"
                        />
                    </Video>
                </VideoPlaylist>

                <Divider data-upstream-index="5"></Divider>

                <div class="wa-cluster">
                    <Button
                        data-upstream-index="6"
                        appearance="filled"
                        onclick="document.getElementById('demo-playlist').goTo(0)"
                        >First</Button
                    >
                    <Button
                        data-upstream-index="7"
                        appearance="filled"
                        onclick="document.getElementById('demo-playlist').previous()"
                        >Previous</Button
                    >
                    <Button
                        data-upstream-index="8"
                        appearance="filled"
                        onclick="document.getElementById('demo-playlist').next()"
                        >Next</Button
                    >
                </div>
            </div>
        </template>
        <template v-if="scenario === 'video-playlist-4'">
            <VideoPlaylist data-upstream-index="0" id="event-playlist">
                <Video
                    data-upstream-index="1"
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

                <Video
                    data-upstream-index="2"
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
            </VideoPlaylist>

            <div
                id="event-log"
                style="
                    margin-block-start: var(--wa-space-m);
                    font-size: var(--wa-font-size-s);
                    color: var(--wa-color-text-quiet);
                "
            >
                No change yet.
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, Divider } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import { Video, VideoPlaylist } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
</script>
