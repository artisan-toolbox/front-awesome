<template>
    <div>
        <template v-if="scenario === 'carousel-1'">
            <Carousel data-upstream-index="0" pagination navigation mouse-dragging loop>
                <CarouselItem data-upstream-index="1">
                    <img
                        alt="The sun shines on the mountains and trees (by Adam Kool on Unsplash)"
                        src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="2">
                    <img
                        alt="A river winding through an evergreen forest (by Luca Bravo on Unsplash)"
                        src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="3">
                    <img
                        alt="The sun is setting over a lavender field (by Leonard Cotte on Unsplash)"
                        src="https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="4">
                    <img
                        alt="A field of grass with the sun setting in the background (by Sapan Patel on Unsplash)"
                        src="https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="5">
                    <img
                        alt="A scenic view of a mountain with clouds rolling in (by V2osk on Unsplash)"
                        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=10"
                    />
                </CarouselItem>
            </Carousel>
        </template>
        <template v-if="scenario === 'carousel-2'">
            <Carousel data-upstream-index="0" pagination>
                <CarouselItem data-upstream-index="1">
                    <img
                        alt="The sun shines on the mountains and trees (by Adam Kool on Unsplash)"
                        src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="2">
                    <img
                        alt="A river winding through an evergreen forest (by Luca Bravo on Unsplash)"
                        src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="3">
                    <img
                        alt="The sun is setting over a lavender field (by Leonard Cotte on Unsplash)"
                        src="https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="4">
                    <img
                        alt="A field of grass with the sun setting in the background (by Sapan Patel on Unsplash)"
                        src="https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="5">
                    <img
                        alt="A scenic view of a mountain with clouds rolling in (by V2osk on Unsplash)"
                        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=10"
                    />
                </CarouselItem>
            </Carousel>
        </template>
        <template v-if="scenario === 'carousel-3'">
            <Carousel data-upstream-index="0" navigation>
                <CarouselItem data-upstream-index="1">
                    <img
                        alt="The sun shines on the mountains and trees (by Adam Kool on Unsplash)"
                        src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="2">
                    <img
                        alt="A river winding through an evergreen forest (by Luca Bravo on Unsplash)"
                        src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="3">
                    <img
                        alt="The sun is setting over a lavender field (by Leonard Cotte on Unsplash)"
                        src="https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="4">
                    <img
                        alt="A field of grass with the sun setting in the background (by Sapan Patel on Unsplash)"
                        src="https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="5">
                    <img
                        alt="A scenic view of a mountain with clouds rolling in (by V2osk on Unsplash)"
                        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=10"
                    />
                </CarouselItem>
            </Carousel>
        </template>
        <template v-if="scenario === 'carousel-4'">
            <Carousel data-upstream-index="0" loop navigation pagination>
                <CarouselItem data-upstream-index="1">
                    <img
                        alt="The sun shines on the mountains and trees (by Adam Kool on Unsplash)"
                        src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="2">
                    <img
                        alt="A river winding through an evergreen forest (by Luca Bravo on Unsplash)"
                        src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="3">
                    <img
                        alt="The sun is setting over a lavender field (by Leonard Cotte on Unsplash)"
                        src="https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="4">
                    <img
                        alt="A field of grass with the sun setting in the background (by Sapan Patel on Unsplash)"
                        src="https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="5">
                    <img
                        alt="A scenic view of a mountain with clouds rolling in (by V2osk on Unsplash)"
                        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=10"
                    />
                </CarouselItem>
            </Carousel>
        </template>
        <template v-if="scenario === 'carousel-5'">
            <Carousel data-upstream-index="0" autoplay loop pagination>
                <CarouselItem data-upstream-index="1">
                    <img
                        alt="The sun shines on the mountains and trees (by Adam Kool on Unsplash)"
                        src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="2">
                    <img
                        alt="A river winding through an evergreen forest (by Luca Bravo on Unsplash)"
                        src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="3">
                    <img
                        alt="The sun is setting over a lavender field (by Leonard Cotte on Unsplash)"
                        src="https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="4">
                    <img
                        alt="A field of grass with the sun setting in the background (by Sapan Patel on Unsplash)"
                        src="https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="5">
                    <img
                        alt="A scenic view of a mountain with clouds rolling in (by V2osk on Unsplash)"
                        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=10"
                    />
                </CarouselItem>
            </Carousel>
        </template>
        <template v-if="scenario === 'carousel-6'">
            <Carousel data-upstream-index="0" class="vertical" pagination orientation="vertical">
                <CarouselItem data-upstream-index="1">
                    <img
                        alt="The sun shines on the mountains and trees (by Adam Kool on Unsplash)"
                        src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="2">
                    <img
                        alt="A river winding through an evergreen forest (by Luca Bravo on Unsplash)"
                        src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="3">
                    <img
                        alt="The sun is setting over a lavender field (by Leonard Cotte on Unsplash)"
                        src="https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="4">
                    <img
                        alt="A field of grass with the sun setting in the background (by Sapan Patel on Unsplash)"
                        src="https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="5">
                    <img
                        alt="A scenic view of a mountain with clouds rolling in (by V2osk on Unsplash)"
                        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=10"
                    />
                </CarouselItem>
            </Carousel>
        </template>
        <template v-if="scenario === 'carousel-7'">
            <div>
                <Carousel
                    data-upstream-index="0"
                    class="aspect-ratio"
                    navigation
                    pagination
                    style="--aspect-ratio: 3/2"
                >
                    <CarouselItem data-upstream-index="1">
                        <img
                            alt="The sun shines on the mountains and trees (by Adam Kool on Unsplash)"
                            src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=10"
                        />
                    </CarouselItem>
                    <CarouselItem data-upstream-index="2">
                        <img
                            alt="A river winding through an evergreen forest (by Luca Bravo on Unsplash)"
                            src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=10"
                        />
                    </CarouselItem>
                    <CarouselItem data-upstream-index="3">
                        <img
                            alt="The sun is setting over a lavender field (by Leonard Cotte on Unsplash)"
                            src="https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=10"
                        />
                    </CarouselItem>
                    <CarouselItem data-upstream-index="4">
                        <img
                            alt="A field of grass with the sun setting in the background (by Sapan Patel on Unsplash)"
                            src="https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=10"
                        />
                    </CarouselItem>
                    <CarouselItem data-upstream-index="5">
                        <img
                            alt="A scenic view of a mountain with clouds rolling in (by V2osk on Unsplash)"
                            src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=10"
                        />
                    </CarouselItem>
                </Carousel>

                <Divider data-upstream-index="6"></Divider>

                <div class="wa-cluster">
                    <Select data-upstream-index="7" label="Aspect ratio" name="aspect" value="3/2">
                        <Option data-upstream-index="8" value="1/1">1/1</Option>
                        <Option data-upstream-index="9" value="3/2">3/2</Option>
                        <Option data-upstream-index="10" value="16/9">16/9</Option>
                    </Select>
                </div>
            </div>
        </template>
        <template v-if="scenario === 'carousel-8'">
            <Carousel
                data-upstream-index="0"
                navigation
                pagination
                :slides-per-page="2"
                :slides-per-move="2"
            >
                <CarouselItem data-upstream-index="1" style="background: red">Slide 1</CarouselItem>
                <CarouselItem data-upstream-index="2" style="background: orange"
                    >Slide 2</CarouselItem
                >
                <CarouselItem data-upstream-index="3" style="background: yellow"
                    >Slide 3</CarouselItem
                >
                <CarouselItem data-upstream-index="4" style="background: green"
                    >Slide 4</CarouselItem
                >
                <CarouselItem data-upstream-index="5" style="background: blue"
                    >Slide 5</CarouselItem
                >
                <CarouselItem data-upstream-index="6" style="background: purple"
                    >Slide 6</CarouselItem
                >
            </Carousel>
        </template>
        <template v-if="scenario === 'carousel-9'">
            <Carousel
                data-upstream-index="0"
                class="scroll-hint"
                pagination
                style="--scroll-hint: 10%"
            >
                <CarouselItem data-upstream-index="1">
                    <img
                        alt="The sun shines on the mountains and trees (by Adam Kool on Unsplash)"
                        src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="2">
                    <img
                        alt="A river winding through an evergreen forest (by Luca Bravo on Unsplash)"
                        src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="3">
                    <img
                        alt="The sun is setting over a lavender field (by Leonard Cotte on Unsplash)"
                        src="https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="4">
                    <img
                        alt="A field of grass with the sun setting in the background (by Sapan Patel on Unsplash)"
                        src="https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="5">
                    <img
                        alt="A scenic view of a mountain with clouds rolling in (by V2osk on Unsplash)"
                        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=10"
                    />
                </CarouselItem>
            </Carousel>
        </template>
        <template v-if="scenario === 'carousel-10'">
            <div class="mouse-dragging">
                <Carousel data-upstream-index="0" pagination>
                    <CarouselItem data-upstream-index="1">
                        <img
                            alt="The sun shines on the mountains and trees (by Adam Kool on Unsplash)"
                            src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=10"
                        />
                    </CarouselItem>
                    <CarouselItem data-upstream-index="2">
                        <img
                            alt="A river winding through an evergreen forest (by Luca Bravo on Unsplash)"
                            src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=10"
                        />
                    </CarouselItem>
                    <CarouselItem data-upstream-index="3">
                        <img
                            alt="The sun is setting over a lavender field (by Leonard Cotte on Unsplash)"
                            src="https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=10"
                        />
                    </CarouselItem>
                    <CarouselItem data-upstream-index="4">
                        <img
                            alt="A field of grass with the sun setting in the background (by Sapan Patel on Unsplash)"
                            src="https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=10"
                        />
                    </CarouselItem>
                    <CarouselItem data-upstream-index="5">
                        <img
                            alt="A scenic view of a mountain with clouds rolling in (by V2osk on Unsplash)"
                            src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=10"
                        />
                    </CarouselItem>
                </Carousel>

                <Divider data-upstream-index="6"></Divider>

                <Switch data-upstream-index="7">Enable mouse dragging</Switch>
            </div>
        </template>
        <template v-if="scenario === 'carousel-11'">
            <div>
                <Carousel
                    data-upstream-index="0"
                    class="dynamic-carousel"
                    pagination
                    navigation
                    loop
                >
                    <CarouselItem data-upstream-index="1" style="background: red"
                        >Slide 1</CarouselItem
                    >
                    <CarouselItem data-upstream-index="2" style="background: orange"
                        >Slide 2</CarouselItem
                    >
                    <CarouselItem data-upstream-index="3" style="background: yellow"
                        >Slide 3</CarouselItem
                    >
                </Carousel>

                <Divider data-upstream-index="4"></Divider>

                <div class="wa-cluster">
                    <Button data-upstream-index="5" appearance="filled" id="dynamic-add"
                        >Add slide</Button
                    >
                    <Button data-upstream-index="6" appearance="filled" id="dynamic-remove"
                        >Remove slide</Button
                    >
                </div>
            </div>
        </template>
        <template v-if="scenario === 'carousel-12'">
            <Carousel data-upstream-index="0" class="carousel-thumbnails" navigation loop>
                <CarouselItem data-upstream-index="1">
                    <img
                        alt="The sun shines on the mountains and trees (by Adam Kool on Unsplash)"
                        src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="2">
                    <img
                        alt="A river winding through an evergreen forest (by Luca Bravo on Unsplash)"
                        src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="3">
                    <img
                        alt="The sun is setting over a lavender field (by Leonard Cotte on Unsplash)"
                        src="https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="4">
                    <img
                        alt="A field of grass with the sun setting in the background (by Sapan Patel on Unsplash)"
                        src="https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=10"
                    />
                </CarouselItem>
                <CarouselItem data-upstream-index="5">
                    <img
                        alt="A scenic view of a mountain with clouds rolling in (by V2osk on Unsplash)"
                        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=10"
                    />
                </CarouselItem>
            </Carousel>

            <div class="thumbnails">
                <div class="scroller">
                    <img
                        alt="Thumbnail by 1"
                        class="image active"
                        src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=10"
                    />
                    <img
                        alt="Thumbnail by 2"
                        class="image"
                        src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=10"
                    />
                    <img
                        alt="Thumbnail by 3"
                        class="image"
                        src="https://images.unsplash.com/photo-1499002238440-d264edd596ec?q=10"
                    />
                    <img
                        alt="Thumbnail by 4"
                        class="image"
                        src="https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?q=10"
                    />
                    <img
                        alt="Thumbnail by 5"
                        class="image"
                        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=10"
                    />
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Carousel,
    CarouselItem,
    Divider,
    Option,
    Select,
    Switch,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
