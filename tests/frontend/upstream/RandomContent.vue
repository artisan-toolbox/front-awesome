<template>
    <div>
        <template v-if="scenario === 'random-content-1'">
            <div>
                <RandomContent data-upstream-index="0" id="rc-overview">
                    <Callout data-upstream-index="1" variant="brand">
                        <Icon data-upstream-index="2" slot="icon" name="paperclip-vertical"></Icon>
                        <strong>It looks like you're writing a letter!</strong><br />
                        Want a hand with the formatting?
                    </Callout>
                    <Callout data-upstream-index="3" variant="brand">
                        <Icon data-upstream-index="4" slot="icon" name="paperclip-vertical"></Icon>
                        <strong>It looks like you're building a web app!</strong><br />
                        I can recommend a few components.
                    </Callout>
                    <Callout data-upstream-index="5" variant="brand">
                        <Icon data-upstream-index="6" slot="icon" name="paperclip-vertical"></Icon>
                        <strong>It looks like you're stuck.</strong><br />
                        Have you tried turning it off and on again?
                    </Callout>
                    <Callout data-upstream-index="7" variant="brand">
                        <Icon data-upstream-index="8" slot="icon" name="paperclip-vertical"></Icon>
                        <strong>It looks like you're shipping on a Friday.</strong><br />
                        Bold move. I respect it.
                    </Callout>
                </RandomContent>

                <Divider data-upstream-index="9"></Divider>

                <Button
                    data-upstream-index="10"
                    appearance="filled"
                    onclick="document.getElementById('rc-overview').randomize()"
                    >Shuffle</Button
                >
            </div>
        </template>
        <template v-if="scenario === 'random-content-2'">
            <div>
                <div class="wa-cluster wa-align-items-center" style="min-height: 5rem">
                    <RandomContent data-upstream-index="0" id="rc-providing">
                        <p>Plain text works fine.</p>
                        <Badge data-upstream-index="1" variant="brand">So do components</Badge>
                        <Card data-upstream-index="2">Even rich cards with their own content.</Card>
                    </RandomContent>
                </div>

                <Divider data-upstream-index="3"></Divider>

                <Button
                    data-upstream-index="4"
                    appearance="filled"
                    onclick="document.getElementById('rc-providing').randomize()"
                    >Shuffle</Button
                >
            </div>
        </template>
        <template v-if="scenario === 'random-content-3'">
            <div class="rc-items-demo">
                <RandomContent data-upstream-index="0" id="rc-items" :items="2">
                    <Badge data-upstream-index="1" variant="brand">New</Badge>
                    <Badge data-upstream-index="2" variant="success">Sale</Badge>
                    <Badge data-upstream-index="3" variant="warning">Low stock</Badge>
                    <Badge data-upstream-index="4" variant="neutral">Popular</Badge>
                    <Badge data-upstream-index="5" variant="danger">Last chance</Badge>
                </RandomContent>

                <Divider data-upstream-index="6"></Divider>

                <div class="wa-cluster" style="align-items: flex-end">
                    <Select
                        data-upstream-index="7"
                        id="rc-items-count"
                        label="Items"
                        value="2"
                        style="width: 8rem"
                    >
                        <Option data-upstream-index="8" value="1">1</Option>
                        <Option data-upstream-index="9" value="2">2</Option>
                        <Option data-upstream-index="10" value="3">3</Option>
                        <Option data-upstream-index="11" value="4">4</Option>
                    </Select>
                    <Button
                        data-upstream-index="12"
                        appearance="filled"
                        onclick="document.getElementById('rc-items').randomize()"
                        >Shuffle</Button
                    >
                </div>
            </div>
        </template>
        <template v-if="scenario === 'random-content-4'">
            <div class="rc-modes-demo">
                <RandomContent data-upstream-index="0" id="rc-modes" mode="unique">
                    <Tag data-upstream-index="1" variant="brand">A</Tag>
                    <Tag data-upstream-index="2" variant="success">B</Tag>
                    <Tag data-upstream-index="3" variant="warning">C</Tag>
                    <Tag data-upstream-index="4" variant="danger">D</Tag>
                </RandomContent>

                <Divider data-upstream-index="5"></Divider>

                <div class="wa-cluster" style="align-items: flex-end">
                    <Select
                        data-upstream-index="6"
                        id="rc-modes-mode"
                        label="Mode"
                        value="unique"
                        style="width: 10rem"
                    >
                        <Option data-upstream-index="7" value="unique">unique</Option>
                        <Option data-upstream-index="8" value="random">random</Option>
                        <Option data-upstream-index="9" value="sequence">sequence</Option>
                    </Select>
                    <Button
                        data-upstream-index="10"
                        appearance="filled"
                        onclick="document.getElementById('rc-modes').randomize()"
                        >Shuffle</Button
                    >
                </div>

                <small style="display: block; margin-block-start: var(--wa-space-s)">
                    Recent picks: <span id="rc-modes-history"></span>
                </small>
            </div>
        </template>
        <template v-if="scenario === 'random-content-5'">
            <div class="rc-animation-demo">
                <RandomContent data-upstream-index="0" id="rc-animation" animation="fade-up">
                    <p>Good morning!</p>
                    <p>Welcome back.</p>
                    <p>What are you building today?</p>
                </RandomContent>

                <Divider data-upstream-index="1"></Divider>

                <div class="wa-cluster" style="align-items: flex-end">
                    <Select
                        data-upstream-index="2"
                        id="rc-animation-select"
                        label="Animation"
                        value="fade-up"
                        style="width: 10rem"
                    >
                        <Option data-upstream-index="3" value="none">none</Option>
                        <Option data-upstream-index="4" value="fade">fade</Option>
                        <Option data-upstream-index="5" value="fade-up">fade-up</Option>
                        <Option data-upstream-index="6" value="fade-down">fade-down</Option>
                        <Option data-upstream-index="7" value="fade-left">fade-left</Option>
                        <Option data-upstream-index="8" value="fade-right">fade-right</Option>
                    </Select>
                    <Button
                        data-upstream-index="9"
                        appearance="filled"
                        onclick="document.getElementById('rc-animation').randomize()"
                        >Next</Button
                    >
                </div>
            </div>
        </template>
        <template v-if="scenario === 'random-content-6'">
            <div class="rc-autoplay-demo">
                <dl>
                    <dt>Did you know?</dt>
                    <RandomContent
                        data-upstream-index="0"
                        id="rc-autoplay"
                        mode="unique"
                        animation="fade-up"
                        autoplay
                        :autoplay-interval="3000"
                    >
                        <dd>
                            <Icon data-upstream-index="1" name="octopus"></Icon> Octopuses have
                            three hearts.
                        </dd>
                        <dd>
                            <Icon data-upstream-index="2" name="bee"></Icon> Honey never spoils.
                        </dd>
                        <dd>
                            <Icon data-upstream-index="3" name="feather"></Icon> A group of
                            flamingos is called a flamboyance.
                        </dd>
                        <dd>
                            <Icon data-upstream-index="4" name="banana"></Icon> Bananas are
                            botanically berries.
                        </dd>
                        <dd>
                            <Icon data-upstream-index="5" name="cat"></Icon> Cheetahs meow rather
                            than roar.
                        </dd>
                    </RandomContent>
                </dl>

                <Divider data-upstream-index="6"></Divider>

                <Button data-upstream-index="7" id="rc-autoplay-toggle" appearance="filled"
                    >Pause</Button
                >
            </div>
        </template>
        <template v-if="scenario === 'random-content-7'">
            <div>
                <RandomContent
                    data-upstream-index="0"
                    id="rc-layout"
                    :items="3"
                    style="display: flex; gap: var(--wa-space-m); flex-wrap: wrap"
                >
                    <Avatar data-upstream-index="1" label="Jordan Hayes" initials="JH"></Avatar>
                    <Avatar data-upstream-index="2" label="Mara Goldberg" initials="MG"></Avatar>
                    <Avatar data-upstream-index="3" label="Beck Watts" initials="BW"></Avatar>
                    <Avatar data-upstream-index="4" label="Avi Lin" initials="AL"></Avatar>
                    <Avatar data-upstream-index="5" label="Rae Park" initials="RP"></Avatar>
                    <Avatar data-upstream-index="6" label="Sam Cho" initials="SC"></Avatar>
                </RandomContent>

                <Divider data-upstream-index="7"></Divider>

                <Button
                    data-upstream-index="8"
                    appearance="filled"
                    onclick="document.getElementById('rc-layout').randomize()"
                    >Shuffle</Button
                >
            </div>
        </template>
        <template v-if="scenario === 'random-content-8'">
            <div>
                <p>
                    Have a
                    <RandomContent data-upstream-index="0" id="rc-inline">
                        <span>wonderful</span>
                        <span>fantastic</span>
                        <span>marvelous</span>
                        <span>splendid</span>
                    </RandomContent>
                    day!
                </p>

                <Divider data-upstream-index="1"></Divider>

                <Button
                    data-upstream-index="2"
                    appearance="filled"
                    onclick="document.getElementById('rc-inline').randomize()"
                    >Shuffle</Button
                >
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Avatar,
    Badge,
    Button,
    Callout,
    Card,
    Divider,
    Icon,
    Option,
    RandomContent,
    Select,
    Tag,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
