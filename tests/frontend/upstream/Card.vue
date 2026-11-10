<template>
    <div>
        <template v-if="scenario === 'card-1'">
            <Card data-upstream-index="0" class="card-overview">
                <img
                    slot="media"
                    src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
                    alt="A kitten sits patiently between a terracotta pot and decorative grasses."
                />

                <strong>Mittens</strong><br />
                This kitten is as cute as he is playful. Bring him home today!<br />
                <small class="wa-caption-s">6 weeks old</small>

                <Button data-upstream-index="1" slot="footer" variant="brand" pill
                    >More Info</Button
                >
                <Rating data-upstream-index="2" slot="footer-actions" label="Rating"></Rating>
            </Card>
        </template>
        <template v-if="scenario === 'card-2'">
            <Card data-upstream-index="0">
                <img
                    slot="media"
                    src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
                    alt="A kitten between a terracotta pot and decorative grasses."
                />
                <strong slot="header">Mittens</strong>
                This kitten is as cute as he is playful. Bring him home today!
                <Button data-upstream-index="1" slot="footer" variant="brand" pill
                    >More Info</Button
                >
                <Button data-upstream-index="2" slot="actions" variant="neutral" appearance="plain">
                    <Icon data-upstream-index="3" name="ellipsis" label="Actions"></Icon>
                </Button>
            </Card>
        </template>
        <template v-if="scenario === 'card-3'">
            <Card data-upstream-index="0" class="card-basic">
                This is just a basic card. No media, no header, and no footer. Just your content.
            </Card>
        </template>
        <template v-if="scenario === 'card-4'">
            <Card data-upstream-index="0" class="card-header">
                <h3 slot="header">Header Title</h3>
                This card has a header. You can put all sorts of things in it!
                <Button data-upstream-index="1" appearance="plain" slot="header-actions">
                    <Icon
                        data-upstream-index="2"
                        name="gear"
                        variant="solid"
                        label="Settings"
                    ></Icon>
                </Button>
            </Card>
        </template>
        <template v-if="scenario === 'card-5'">
            <Card data-upstream-index="0" class="card-footer">
                This card has a footer. You can put all sorts of things in it!

                <Rating data-upstream-index="1" slot="footer"></Rating>

                <Button data-upstream-index="2" slot="footer-actions" variant="brand"
                    >Preview</Button
                >
            </Card>
        </template>
        <template v-if="scenario === 'card-6'">
            <div class="wa-grid">
                <Card data-upstream-index="0" class="card-media">
                    <div slot="media" class="wa-frame:landscape">
                        <img
                            src="https://images.unsplash.com/photo-1547191783-94d5f8f6d8b1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=80"
                            alt="A kitten walks towards camera on top of pallet."
                        />
                    </div>
                    This card has an image of a kitten walking along a pallet.
                </Card>
                <Card data-upstream-index="1" class="card-media">
                    <video slot="media" controls>
                        <source src="https://uploads.webawesome.com/dog-with-glasses.mp4" />
                        <p>Your browser doesn't support HTML video</p>
                    </video>
                    This card has a video of a dog wearing shades.
                </Card>
            </div>
        </template>
        <template v-if="scenario === 'card-7'">
            <div class="wa-grid">
                <Card data-upstream-index="0">
                    <img
                        slot="media"
                        src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
                        alt="A kitten sits patiently between a terracotta pot and decorative grasses."
                    />
                    Outlined (default)
                </Card>
                <Card data-upstream-index="1" appearance="filled-outlined">
                    <img
                        slot="media"
                        src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
                        alt="A kitten sits patiently between a terracotta pot and decorative grasses."
                    />
                    Filled-outlined </Card
                ><Card data-upstream-index="2" appearance="plain">
                    <img
                        slot="media"
                        src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
                        alt="A kitten sits patiently between a terracotta pot and decorative grasses."
                    />
                    Plain </Card
                ><Card data-upstream-index="3" appearance="filled">
                    <img
                        slot="media"
                        src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
                        alt="A kitten sits patiently between a terracotta pot and decorative grasses."
                    />
                    Filled </Card
                ><Card data-upstream-index="4" appearance="accent">
                    <img
                        slot="media"
                        src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
                        alt="A kitten sits patiently between a terracotta pot and decorative grasses."
                    />
                    Accent
                </Card>
            </div>
        </template>
        <template v-if="scenario === 'card-8'">
            <div class="wa-grid">
                <Card data-upstream-index="0" orientation="horizontal" class="horizontal-card">
                    <img
                        slot="media"
                        src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
                        alt="A kitten sits patiently between a terracotta pot and decorative grasses."
                    />
                    This card has a horizontal orientation with media, body, and actions arranged
                    side-by-side.
                    <Button
                        data-upstream-index="1"
                        slot="actions"
                        variant="neutral"
                        appearance="plain"
                        ><Icon data-upstream-index="2" name="ellipsis" label="actions"></Icon
                    ></Button>
                </Card>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, Card, Icon, Rating } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
