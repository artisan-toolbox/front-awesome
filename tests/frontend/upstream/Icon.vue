<template>
    <div>
        <template v-if="scenario === 'icon-1'">
            <div class="icon-rebuses" style="font-size: 2em">
                <!-- Catfish -->
                <Icon data-upstream-index="0" name="cat"></Icon>
                <Icon data-upstream-index="1" name="fish"></Icon>

                <!-- Brainstorm -->
                <Icon data-upstream-index="2" name="brain"></Icon>
                <Icon data-upstream-index="3" name="cloud-bolt"></Icon>

                <!-- Bookworm -->
                <Icon data-upstream-index="4" name="book"></Icon>
                <Icon data-upstream-index="5" name="worm"></Icon>

                <!-- Moonwalk -->
                <Icon data-upstream-index="6" name="moon"></Icon>
                <Icon data-upstream-index="7" name="person-walking"></Icon>
            </div>
        </template>
        <template v-if="scenario === 'icon-2'">
            <Icon
                data-upstream-index="0"
                src="https://shoelace.style/assets/images/shoe.svg"
                style="font-size: 4rem"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-3'">
            <Icon data-upstream-index="0"></Icon>
        </template>
        <template v-if="scenario === 'icon-4'">
            <Icon data-upstream-index="0"></Icon>
        </template>
        <template v-if="scenario === 'icon-5'">
            <Icon data-upstream-index="0"></Icon>
        </template>
        <template v-if="scenario === 'icon-6'">
            <Icon data-upstream-index="0"></Icon>
        </template>
        <template v-if="scenario === 'icon-7'">
            <Icon data-upstream-index="0"></Icon>
        </template>
        <template v-if="scenario === 'icon-8'">
            <Icon data-upstream-index="0"></Icon>
        </template>
        <template v-if="scenario === 'icon-9'">
            <!-- This will show the icon located at /assets/icons/smile.svg -->
            <Icon data-upstream-index="0" library="my-icons" name="smile"></Icon>
        </template>
        <template v-if="scenario === 'icon-10'">
            <div style="font-size: 24px">
                <Icon data-upstream-index="0" library="bootstrap" name="backpack"></Icon>
                <Icon data-upstream-index="1" library="bootstrap" name="cup-hot"></Icon>
                <Icon data-upstream-index="2" library="bootstrap" name="envelope-heart"></Icon>
                <Icon data-upstream-index="3" library="bootstrap" name="inboxes"></Icon>
                <Icon data-upstream-index="4" library="bootstrap" name="lamp"></Icon>
                <Icon data-upstream-index="5" library="bootstrap" name="piggy-bank"></Icon>
                <br />
                <Icon
                    data-upstream-index="6"
                    library="bootstrap"
                    family="filled"
                    name="backpack"
                ></Icon>
                <Icon
                    data-upstream-index="7"
                    library="bootstrap"
                    family="filled"
                    name="cup-hot"
                ></Icon>
                <Icon
                    data-upstream-index="8"
                    library="bootstrap"
                    family="filled"
                    name="envelope-heart"
                ></Icon>
                <Icon
                    data-upstream-index="9"
                    library="bootstrap"
                    family="filled"
                    name="inboxes"
                ></Icon>
                <Icon
                    data-upstream-index="10"
                    library="bootstrap"
                    family="filled"
                    name="lamp"
                ></Icon>
                <Icon
                    data-upstream-index="11"
                    library="bootstrap"
                    family="filled"
                    name="piggy-bank"
                ></Icon>
            </div>
        </template>
        <template v-if="scenario === 'icon-11'">
            <div style="font-size: 24px">
                <Icon data-upstream-index="0" library="boxicons" name="bx-bot"></Icon>
                <Icon data-upstream-index="1" library="boxicons" name="bx-cookie"></Icon>
                <Icon data-upstream-index="2" library="boxicons" name="bx-joystick"></Icon>
                <Icon data-upstream-index="3" library="boxicons" name="bx-save"></Icon>
                <Icon data-upstream-index="4" library="boxicons" name="bx-server"></Icon>
                <Icon data-upstream-index="5" library="boxicons" name="bx-wine"></Icon>
                <br />
                <Icon data-upstream-index="6" library="boxicons" name="bxs-bot"></Icon>
                <Icon data-upstream-index="7" library="boxicons" name="bxs-cookie"></Icon>
                <Icon data-upstream-index="8" library="boxicons" name="bxs-joystick"></Icon>
                <Icon data-upstream-index="9" library="boxicons" name="bxs-save"></Icon>
                <Icon data-upstream-index="10" library="boxicons" name="bxs-server"></Icon>
                <Icon data-upstream-index="11" library="boxicons" name="bxs-wine"></Icon>
                <br />
                <Icon data-upstream-index="12" library="boxicons" name="bxl-apple"></Icon>
                <Icon data-upstream-index="13" library="boxicons" name="bxl-chrome"></Icon>
                <Icon data-upstream-index="14" library="boxicons" name="bxl-edge"></Icon>
                <Icon data-upstream-index="15" library="boxicons" name="bxl-firefox"></Icon>
                <Icon data-upstream-index="16" library="boxicons" name="bxl-opera"></Icon>
                <Icon data-upstream-index="17" library="boxicons" name="bxl-microsoft"></Icon>
            </div>
        </template>
        <template v-if="scenario === 'icon-12'">
            <div style="font-size: 24px">
                <Icon data-upstream-index="0" library="lucide" name="feather"></Icon>
                <Icon data-upstream-index="1" library="lucide" name="pie-chart"></Icon>
                <Icon data-upstream-index="2" library="lucide" name="settings"></Icon>
                <Icon data-upstream-index="3" library="lucide" name="map-pin"></Icon>
                <Icon data-upstream-index="4" library="lucide" name="printer"></Icon>
                <Icon data-upstream-index="5" library="lucide" name="shopping-cart"></Icon>
            </div>
        </template>
        <template v-if="scenario === 'icon-13'">
            <div style="font-size: 24px">
                <Icon data-upstream-index="0" library="heroicons" name="chat-bubble-left"></Icon>
                <Icon data-upstream-index="1" library="heroicons" name="cloud"></Icon>
                <Icon data-upstream-index="2" library="heroicons" name="cog"></Icon>
                <Icon data-upstream-index="3" library="heroicons" name="document-text"></Icon>
                <Icon data-upstream-index="4" library="heroicons" name="gift"></Icon>
                <Icon data-upstream-index="5" library="heroicons" name="speaker-wave"></Icon>
            </div>
        </template>
        <template v-if="scenario === 'icon-14'">
            <div style="font-size: 24px">
                <Icon data-upstream-index="0" library="iconoir" name="check-circle"></Icon>
                <Icon data-upstream-index="1" library="iconoir" name="drawer"></Icon>
                <Icon data-upstream-index="2" library="iconoir" name="keyframes"></Icon>
                <Icon data-upstream-index="3" library="iconoir" name="headset-help"></Icon>
                <Icon data-upstream-index="4" library="iconoir" name="color-picker"></Icon>
                <Icon data-upstream-index="5" library="iconoir" name="wifi"></Icon>
            </div>
        </template>
        <template v-if="scenario === 'icon-15'">
            <div style="font-size: 24px">
                <Icon data-upstream-index="0" library="ionicons" name="alarm"></Icon>
                <Icon data-upstream-index="1" library="ionicons" name="american-football"></Icon>
                <Icon data-upstream-index="2" library="ionicons" name="bug"></Icon>
                <Icon data-upstream-index="3" library="ionicons" name="chatbubble"></Icon>
                <Icon data-upstream-index="4" library="ionicons" name="settings"></Icon>
                <Icon data-upstream-index="5" library="ionicons" name="warning"></Icon>
                <br />
                <Icon data-upstream-index="6" library="ionicons" name="alarm-outline"></Icon>
                <Icon
                    data-upstream-index="7"
                    library="ionicons"
                    name="american-football-outline"
                ></Icon>
                <Icon data-upstream-index="8" library="ionicons" name="bug-outline"></Icon>
                <Icon data-upstream-index="9" library="ionicons" name="chatbubble-outline"></Icon>
                <Icon data-upstream-index="10" library="ionicons" name="settings-outline"></Icon>
                <Icon data-upstream-index="11" library="ionicons" name="warning-outline"></Icon>
                <br />
                <Icon data-upstream-index="12" library="ionicons" name="alarm-sharp"></Icon>
                <Icon
                    data-upstream-index="13"
                    library="ionicons"
                    name="american-football-sharp"
                ></Icon>
                <Icon data-upstream-index="14" library="ionicons" name="bug-sharp"></Icon>
                <Icon data-upstream-index="15" library="ionicons" name="chatbubble-sharp"></Icon>
                <Icon data-upstream-index="16" library="ionicons" name="settings-sharp"></Icon>
                <Icon data-upstream-index="17" library="ionicons" name="warning-sharp"></Icon>
            </div>
        </template>
        <template v-if="scenario === 'icon-16'">
            <div style="font-size: 24px">
                <Icon data-upstream-index="0" library="jam" name="calendar"></Icon>
                <Icon data-upstream-index="1" library="jam" name="camera"></Icon>
                <Icon data-upstream-index="2" library="jam" name="filter"></Icon>
                <Icon data-upstream-index="3" library="jam" name="leaf"></Icon>
                <Icon data-upstream-index="4" library="jam" name="picture"></Icon>
                <Icon data-upstream-index="5" library="jam" name="set-square"></Icon>
                <br />
                <Icon data-upstream-index="6" library="jam" name="calendar-f"></Icon>
                <Icon data-upstream-index="7" library="jam" name="camera-f"></Icon>
                <Icon data-upstream-index="8" library="jam" name="filter-f"></Icon>
                <Icon data-upstream-index="9" library="jam" name="leaf-f"></Icon>
                <Icon data-upstream-index="10" library="jam" name="picture-f"></Icon>
                <Icon data-upstream-index="11" library="jam" name="set-square-f"></Icon>
            </div>
        </template>
        <template v-if="scenario === 'icon-17'">
            <div style="font-size: 24px">
                <Icon data-upstream-index="0" library="material" name="notifications"></Icon>
                <Icon data-upstream-index="1" library="material" name="email"></Icon>
                <Icon data-upstream-index="2" library="material" name="delete"></Icon>
                <Icon data-upstream-index="3" library="material" name="volume_up"></Icon>
                <Icon data-upstream-index="4" library="material" name="settings"></Icon>
                <Icon data-upstream-index="5" library="material" name="shopping_basket"></Icon>
                <br />
                <Icon data-upstream-index="6" library="material" name="notifications_round"></Icon>
                <Icon data-upstream-index="7" library="material" name="email_round"></Icon>
                <Icon data-upstream-index="8" library="material" name="delete_round"></Icon>
                <Icon data-upstream-index="9" library="material" name="volume_up_round"></Icon>
                <Icon data-upstream-index="10" library="material" name="settings_round"></Icon>
                <Icon
                    data-upstream-index="11"
                    library="material"
                    name="shopping_basket_round"
                ></Icon>
                <br />
                <Icon data-upstream-index="12" library="material" name="notifications_sharp"></Icon>
                <Icon data-upstream-index="13" library="material" name="email_sharp"></Icon>
                <Icon data-upstream-index="14" library="material" name="delete_sharp"></Icon>
                <Icon data-upstream-index="15" library="material" name="volume_up_sharp"></Icon>
                <Icon data-upstream-index="16" library="material" name="settings_sharp"></Icon>
                <Icon
                    data-upstream-index="17"
                    library="material"
                    name="shopping_basket_sharp"
                ></Icon>
            </div>
        </template>
        <template v-if="scenario === 'icon-18'">
            <div style="font-size: 24px">
                <Icon data-upstream-index="0" library="remixicon" name="business/cloud-line"></Icon>
                <Icon data-upstream-index="1" library="remixicon" name="design/brush-line"></Icon>
                <Icon
                    data-upstream-index="2"
                    library="remixicon"
                    name="business/pie-chart-line"
                ></Icon>
                <Icon
                    data-upstream-index="3"
                    library="remixicon"
                    name="development/bug-line"
                ></Icon>
                <Icon data-upstream-index="4" library="remixicon" name="media/image-line"></Icon>
                <Icon data-upstream-index="5" library="remixicon" name="system/alert-line"></Icon>
                <br />
                <Icon data-upstream-index="6" library="remixicon" name="business/cloud-fill"></Icon>
                <Icon data-upstream-index="7" library="remixicon" name="design/brush-fill"></Icon>
                <Icon
                    data-upstream-index="8"
                    library="remixicon"
                    name="business/pie-chart-fill"
                ></Icon>
                <Icon
                    data-upstream-index="9"
                    library="remixicon"
                    name="development/bug-fill"
                ></Icon>
                <Icon data-upstream-index="10" library="remixicon" name="media/image-fill"></Icon>
                <Icon data-upstream-index="11" library="remixicon" name="system/alert-fill"></Icon>
            </div>
        </template>
        <template v-if="scenario === 'icon-19'">
            <div style="font-size: 24px">
                <Icon data-upstream-index="0" library="tabler" name="alert-triangle"></Icon>
                <Icon data-upstream-index="1" library="tabler" name="arrow-back"></Icon>
                <Icon data-upstream-index="2" library="tabler" name="at"></Icon>
                <Icon data-upstream-index="3" library="tabler" name="ball-baseball"></Icon>
                <Icon data-upstream-index="4" library="tabler" name="cake"></Icon>
                <Icon data-upstream-index="5" library="tabler" name="files"></Icon>
                <br />
                <Icon data-upstream-index="6" library="tabler" name="keyboard"></Icon>
                <Icon data-upstream-index="7" library="tabler" name="moon"></Icon>
                <Icon data-upstream-index="8" library="tabler" name="pig"></Icon>
                <Icon data-upstream-index="9" library="tabler" name="printer"></Icon>
                <Icon data-upstream-index="10" library="tabler" name="ship"></Icon>
                <Icon data-upstream-index="11" library="tabler" name="toilet-paper"></Icon>
            </div>
        </template>
        <template v-if="scenario === 'icon-20'">
            <div style="font-size: 24px">
                <Icon data-upstream-index="0" library="unicons" name="clock"></Icon>
                <Icon data-upstream-index="1" library="unicons" name="graph-bar"></Icon>
                <Icon data-upstream-index="2" library="unicons" name="padlock"></Icon>
                <Icon data-upstream-index="3" library="unicons" name="polygon"></Icon>
                <Icon data-upstream-index="4" library="unicons" name="rocket"></Icon>
                <Icon data-upstream-index="5" library="unicons" name="star"></Icon>
                <br />
                <Icon data-upstream-index="6" library="unicons" name="clock-s"></Icon>
                <Icon data-upstream-index="7" library="unicons" name="graph-bar-s"></Icon>
                <Icon data-upstream-index="8" library="unicons" name="padlock-s"></Icon>
                <Icon data-upstream-index="9" library="unicons" name="polygon-s"></Icon>
                <Icon data-upstream-index="10" library="unicons" name="rocket-s"></Icon>
                <Icon data-upstream-index="11" library="unicons" name="star-s"></Icon>
            </div>
        </template>
        <template v-if="scenario === 'icon-21'">
            <Icon
                data-upstream-index="0"
                name="circle-check"
                label="Task complete"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="1"
                name="triangle-exclamation"
                label="Warning"
                style="font-size: 2em"
            ></Icon>
            <Icon data-upstream-index="2" name="trash" label="Delete" style="font-size: 2em"></Icon>
            <Icon
                data-upstream-index="3"
                name="bell"
                label="Notifications"
                style="font-size: 2em"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-22'">
            <div class="icon-sizing">
                <div class="wa-cluster icon-sizing-preview" style="font-size: 2rem">
                    <Icon data-upstream-index="0" name="bell"></Icon>
                    <Icon data-upstream-index="1" name="heart"></Icon>
                    <Icon data-upstream-index="2" name="image"></Icon>
                    <Icon data-upstream-index="3" name="microphone"></Icon>
                    <Icon data-upstream-index="4" name="search"></Icon>
                    <Icon data-upstream-index="5" name="star"></Icon>
                </div>

                <Divider data-upstream-index="6"></Divider>

                <Slider
                    data-upstream-index="7"
                    label="Font size"
                    :min="0"
                    :max="4"
                    :value="2"
                    with-markers
                >
                    <span slot="reference">1rem</span>
                    <span slot="reference">1.5rem</span>
                    <span slot="reference">2rem</span>
                    <span slot="reference">3rem</span>
                    <span slot="reference">4rem</span>
                </Slider>
            </div>
        </template>
        <template v-if="scenario === 'icon-23'">
            <div class="wa-cluster" style="font-size: 1.5em">
                <Icon data-upstream-index="0" name="heart" style="color: salmon"></Icon>
                <Icon data-upstream-index="1" name="fire" style="color: coral"></Icon>
                <Icon data-upstream-index="2" name="sun" style="color: gold"></Icon>
                <Icon data-upstream-index="3" name="leaf" style="color: mediumseagreen"></Icon>
                <Icon
                    data-upstream-index="4"
                    name="cloud-showers-heavy"
                    style="color: steelblue"
                ></Icon>
                <Icon data-upstream-index="5" name="hat-wizard" style="color: mediumpurple"></Icon>
            </div>
        </template>
        <template v-if="scenario === 'icon-24'">
            <div class="canvas-demo">
                <div class="canvas-demo-preview wa-cluster">
                    <Icon
                        data-upstream-index="0"
                        name="ruler-horizontal"
                        style="
                            background: var(--wa-color-brand-fill-quiet);
                            border: var(--wa-border-width-s) dashed
                                var(--wa-color-brand-border-loud);
                        "
                    ></Icon>
                    <Icon
                        data-upstream-index="1"
                        name="image"
                        style="
                            background: var(--wa-color-brand-fill-quiet);
                            border: var(--wa-border-width-s) dashed
                                var(--wa-color-brand-border-loud);
                        "
                    ></Icon>
                    <Icon
                        data-upstream-index="2"
                        name="face-smile"
                        style="
                            background: var(--wa-color-brand-fill-quiet);
                            border: var(--wa-border-width-s) dashed
                                var(--wa-color-brand-border-loud);
                        "
                    ></Icon>
                    <Icon
                        data-upstream-index="3"
                        name="file"
                        style="
                            background: var(--wa-color-brand-fill-quiet);
                            border: var(--wa-border-width-s) dashed
                                var(--wa-color-brand-border-loud);
                        "
                    ></Icon>
                    <Icon
                        data-upstream-index="4"
                        name="ruler-vertical"
                        style="
                            background: var(--wa-color-brand-fill-quiet);
                            border: var(--wa-border-width-s) dashed
                                var(--wa-color-brand-border-loud);
                        "
                    ></Icon>
                </div>

                <Divider data-upstream-index="5"></Divider>

                <div class="wa-cluster wa-gap-xl" style="align-items: start">
                    <Select data-upstream-index="6" label="Canvas" name="canvas" value="fixed">
                        <Option data-upstream-index="7" value="fixed">fixed</Option>
                        <Option data-upstream-index="8" value="auto">auto</Option>
                        <Option data-upstream-index="9" value="square">square</Option>
                        <Option data-upstream-index="10" value="roomy">roomy</Option>
                    </Select>
                    <Slider
                        data-upstream-index="11"
                        label="Size"
                        :min="0"
                        :max="4"
                        :value="2"
                        with-markers
                        style="flex: 1 1 14rem"
                    >
                        <span slot="reference">1.5rem</span>
                        <span slot="reference">2rem</span>
                        <span slot="reference">3rem</span>
                        <span slot="reference">4rem</span>
                        <span slot="reference">5rem</span>
                    </Slider>
                </div>
            </div>
        </template>
        <template v-if="scenario === 'icon-25'">
            <Icon data-upstream-index="0" name="snowboarding" style="font-size: 2em"></Icon>
            <Icon
                data-upstream-index="1"
                name="snowboarding"
                :rotate="45"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="2"
                name="snowboarding"
                :rotate="135"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="3"
                name="snowboarding"
                :rotate="270"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="4"
                name="snowboarding"
                flip="both"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="5"
                name="snowboarding"
                :rotate="45"
                flip="x"
                style="font-size: 2em"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-26'">
            <Icon
                data-upstream-index="0"
                name="heart"
                animation="beat"
                label="Beating Heart"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="1"
                name="circle-plus"
                animation="beat"
                label="Beating Circle Plus"
                style="font-size: 2em"
            ></Icon>
            <!-- Use --beat-scale to control how far it grows -->
            <Icon
                data-upstream-index="2"
                name="face-grin-hearts"
                animation="beat"
                label="Beating Smiley"
                style="font-size: 2em; --beat-scale: 1.5"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-27'">
            <Icon
                data-upstream-index="0"
                name="triangle-exclamation"
                animation="fade"
                label="Fading Warning"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="1"
                name="skull-crossbones"
                animation="fade"
                label="Fading Danger"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="2"
                name="cloud-arrow-down"
                animation="fade"
                label="Fading Download"
                style="font-size: 2em"
            ></Icon>
            <!-- Use --fade-opacity to set how faint it fades (and --animation-duration the pace) -->
            <Icon
                data-upstream-index="3"
                name="i-cursor"
                animation="fade"
                label="Fading Cursor"
                style="font-size: 2em; --animation-duration: 2s; --fade-opacity: 0.6"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-28'">
            <Icon
                data-upstream-index="0"
                name="person-digging"
                animation="beat-fade"
                label="Beat-Fading Construction"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="1"
                name="circle-exclamation"
                animation="beat-fade"
                label="Beat-Fading Alert"
                style="font-size: 2em"
            ></Icon>
            <!-- Stronger pulse: lower --beat-fade-opacity, higher --beat-fade-scale -->
            <Icon
                data-upstream-index="2"
                name="square-exclamation"
                animation="beat-fade"
                label="Beat-Fading Alert"
                style="font-size: 2em; --beat-fade-opacity: 0.1; --beat-fade-scale: 1.25"
            ></Icon>
            <!-- Subtler pulse -->
            <Icon
                data-upstream-index="3"
                name="circle-info"
                animation="beat-fade"
                label="Beat-Fading Info"
                style="font-size: 2em; --beat-fade-opacity: 0.67; --beat-fade-scale: 1.075"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-29'">
            <Icon
                data-upstream-index="0"
                name="volleyball"
                animation="bounce"
                label="Bouncing Volleyball"
                style="font-size: 2em"
            ></Icon>

            <!-- bounce with extra rebound and "squish" on landing -->
            <Icon
                data-upstream-index="1"
                name="basketball"
                animation="bounce"
                label="Bouncing Basketball"
                style="
                    font-size: 2em;
                    --bounce-land-scale-x: 1.2;
                    --bounce-land-scale-y: 0.8;
                    --bounce-rebound: 5px;
                "
            ></Icon>

            <!-- bounce animation with no "squish" -->
            <Icon
                data-upstream-index="2"
                name="frog"
                animation="bounce"
                label="Bouncing Frog"
                style="
                    font-size: 2em;
                    --bounce-start-scale-x: 1;
                    --bounce-start-scale-y: 1;
                    --bounce-jump-scale-x: 1;
                    --bounce-jump-scale-y: 1;
                    --bounce-land-scale-x: 1;
                    --bounce-land-scale-y: 1;
                "
            ></Icon>

            <!-- bounce animation with no "squish" or "rebound" -->
            <Icon
                data-upstream-index="3"
                name="envelope"
                animation="bounce"
                label="Bouncing Envelope"
                style="
                    font-size: 2em;
                    --bounce-start-scale-x: 1;
                    --bounce-start-scale-y: 1;
                    --bounce-jump-scale-x: 1;
                    --bounce-jump-scale-y: 1;
                    --bounce-land-scale-x: 1;
                    --bounce-land-scale-y: 1;
                    --bounce-rebound: 0;
                "
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-30'">
            <Icon
                data-upstream-index="0"
                name="compact-disc"
                animation="flip"
                label="Flipping Compact Disc"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="1"
                name="camera-rotate"
                animation="flip"
                label="Flipping Camera Rotate"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="2"
                name="compact-disc"
                animation="flip"
                label="Flipping Disc"
                style="font-size: 2em"
            ></Icon>
            <!-- Set the flip axis with --flip-x / --flip-y -->
            <Icon
                data-upstream-index="3"
                name="scroll"
                animation="flip"
                label="Flipping Scroll"
                style="font-size: 2em; --flip-x: 1; --flip-y: 0"
            ></Icon>
            <!-- Slow it down with --animation-duration -->
            <Icon
                data-upstream-index="4"
                name="money-check-dollar"
                animation="flip"
                label="Flipping Money Check Dollar"
                style="font-size: 2em; --animation-duration: 3s"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-31'">
            <Icon
                data-upstream-index="0"
                name="compact-disc"
                animation="flip-360"
                label="Flipping Compact Disc"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="1"
                name="camera-rotate"
                animation="flip-360"
                label="Flipping Camera Rotate"
                style="font-size: 2em"
            ></Icon>
            <!-- Set the flip axis with --flip-x / --flip-y -->
            <Icon
                data-upstream-index="2"
                name="scroll"
                animation="flip-360"
                label="Flipping Scroll"
                style="font-size: 2em; --flip-x: 1; --flip-y: 0"
            ></Icon>
            <!-- Slow it down with --animation-duration -->
            <Icon
                data-upstream-index="3"
                name="compact-disc"
                animation="flip-360"
                label="Flipping Compact Disc"
                style="font-size: 2em; --animation-duration: 3s"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-32'">
            <Icon
                data-upstream-index="0"
                name="bell"
                animation="shake"
                label="Shaking Bell"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="1"
                name="lock"
                animation="shake"
                label="Shaking Lock"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="2"
                name="stopwatch"
                animation="shake"
                label="Shaking Stopwatch"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="3"
                name="bomb"
                animation="shake"
                label="Shaking Bomb"
                style="font-size: 2em"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-33'">
            <Icon
                data-upstream-index="0"
                name="sync"
                animation="spin"
                label="Spinning Sync"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="1"
                name="circle-notch"
                animation="spin"
                label="Spinning Circle Notch"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="2"
                name="cog"
                animation="spin"
                label="Spinning Cog"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="3"
                name="cog"
                animation="spin-reverse"
                label="Reverse Spinning Cog"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="4"
                name="spinner"
                animation="spin-pulse"
                label="Pulse Spinning Spinner"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="5"
                name="spinner"
                animation="spin-pulse"
                label="Pulse Spinning Spinner"
                style="font-size: 2em; --animation-direction: reverse"
            ></Icon>

            <!-- spin a set number of times, then stop -->
            <Icon
                data-upstream-index="6"
                name="compact-disc"
                animation="spin"
                label="Spinning Compact Disc"
                style="
                    font-size: 2em;
                    --animation-duration: 3s;
                    --animation-iteration-count: 5;
                    --animation-timing: ease-in-out;
                "
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-34'">
            <Icon
                data-upstream-index="0"
                name="gear"
                animation="spin-snap"
                label="Snapping Gear"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="1"
                name="gear"
                animation="spin-snap-4"
                label="Snapping Gear, four stops"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="2"
                name="gear"
                animation="spin-snap-8"
                label="Snapping Gear, eight stops"
                style="font-size: 2em"
            ></Icon>
            <!-- Add --animation-direction: reverse to run counter-clockwise -->
            <Icon
                data-upstream-index="3"
                name="gear"
                animation="spin-snap"
                label="Snapping Gear, reversed"
                style="font-size: 2em; --animation-direction: reverse"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-35'">
            <Icon
                data-upstream-index="0"
                name="bell"
                animation="buzz"
                label="Buzzing Bell"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="1"
                name="mobile"
                animation="buzz"
                label="Buzzing Phone"
                style="font-size: 2em"
            ></Icon>
            <!-- Use --buzz-distance to control how far it travels -->
            <Icon
                data-upstream-index="2"
                name="triangle-exclamation"
                animation="buzz"
                label="Buzzing Warning"
                style="font-size: 2em; --buzz-distance: 9px"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-36'">
            <Icon
                data-upstream-index="0"
                name="feather"
                animation="float"
                label="Floating Feather"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="1"
                name="ghost"
                animation="float"
                label="Floating Ghost"
                style="font-size: 2em"
            ></Icon>
            <!-- Use --float-height to control the rise (and --animation-duration the pace) -->
            <Icon
                data-upstream-index="2"
                name="feather"
                animation="float"
                label="Floating Feather"
                style="font-size: 2em; --animation-duration: 2s; --float-height: 0.5em"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-37'">
            <Icon
                data-upstream-index="0"
                name="cube"
                animation="jello"
                label="Jiggling Cube"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="1"
                name="droplet"
                animation="jello"
                label="Jiggling Droplet"
                style="font-size: 2em"
            ></Icon>
            <!-- Use --jello-scale-x to control how far it stretches -->
            <Icon
                data-upstream-index="2"
                name="star"
                animation="jello"
                label="Jiggling Star"
                style="font-size: 2em; --animation-duration: 2s; --jello-scale-x: 1.3"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-38'">
            <Icon
                data-upstream-index="0"
                name="bell"
                animation="swing"
                label="Swinging Bell"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="1"
                name="key"
                animation="swing"
                label="Swinging Key"
                style="font-size: 2em"
            ></Icon>
            <!-- Use --swing-angle to control the peak rotation -->
            <Icon
                data-upstream-index="2"
                name="tag"
                animation="swing"
                label="Swinging Tag"
                style="font-size: 2em; --animation-duration: 2s; --swing-angle: 45deg"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-39'">
            <Icon
                data-upstream-index="0"
                name="hand-pointer"
                animation="wag"
                label="Wagging Pointer"
                style="font-size: 2em"
            ></Icon>
            <Icon
                data-upstream-index="1"
                name="hand-point-up"
                animation="wag"
                label="Wagging Finger"
                style="font-size: 2em"
            ></Icon>
            <!-- Use --wag-angle to control the peak rotation -->
            <Icon
                data-upstream-index="2"
                name="hand-point-right"
                animation="wag"
                label="Wagging Finger"
                style="font-size: 2em; --animation-duration: 2s; --wag-angle: 45deg"
            ></Icon>
        </template>
        <template v-if="scenario === 'icon-40'">
            <div class="duotone-demo">
                <div class="duotone-demo-preview wa-cluster">
                    <Icon
                        data-upstream-index="0"
                        family="duotone"
                        name="palette"
                        label="Palette"
                    ></Icon>
                    <Icon data-upstream-index="1" family="duotone" name="crow" label="Crow"></Icon>
                    <Icon
                        data-upstream-index="2"
                        family="duotone"
                        name="campfire"
                        label="Campfire"
                    ></Icon>
                    <Icon
                        data-upstream-index="3"
                        family="duotone"
                        name="cloud-sun"
                        label="Cloud and sun"
                    ></Icon>
                    <Icon data-upstream-index="4" family="duotone" name="bell" label="Bell"></Icon>
                </div>

                <Divider data-upstream-index="5"></Divider>

                <div class="wa-cluster wa-gap-xl duotone-demo-controls">
                    <ColorPicker data-upstream-index="6" label="Primary color"></ColorPicker>
                    <ColorPicker data-upstream-index="7" label="Secondary color"></ColorPicker>
                    <Slider
                        data-upstream-index="8"
                        label="Primary opacity"
                        :min="0"
                        :max="1"
                        :step="0.1"
                        :value="1"
                    ></Slider>
                    <Slider
                        data-upstream-index="9"
                        label="Secondary opacity"
                        :min="0"
                        :max="1"
                        :step="0.1"
                        :value="0.4"
                    ></Slider>
                </div>
            </div>
        </template>
        <template v-if="scenario === 'icon-41'">
            <div class="wa-stack">
                <div class="wa-cluster" style="font-size: 1.5em">
                    <Icon data-upstream-index="0" family="duotone" name="home"></Icon>
                    <Icon data-upstream-index="1" family="duotone" name="user"></Icon>
                    <Icon data-upstream-index="2" family="duotone" name="envelope"></Icon>
                    <Icon data-upstream-index="3" family="duotone" name="calendar"></Icon>
                    <span style="font-size: 1rem">Normal</span>
                </div>
                <div class="wa-cluster" style="font-size: 1.5em">
                    <Icon data-upstream-index="4" family="duotone" name="home" swap-opacity></Icon>
                    <Icon data-upstream-index="5" family="duotone" name="user" swap-opacity></Icon>
                    <Icon
                        data-upstream-index="6"
                        family="duotone"
                        name="envelope"
                        swap-opacity
                    ></Icon>
                    <Icon
                        data-upstream-index="7"
                        family="duotone"
                        name="calendar"
                        swap-opacity
                    ></Icon>
                    <span style="font-size: 1rem">Swapped Opacity</span>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    ColorPicker,
    Divider,
    Icon,
    Option,
    Select,
    Slider,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
