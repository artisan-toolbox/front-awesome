<template>
    <div>
        <template v-if="scenario === 'drawer-1'">
            <Drawer data-upstream-index="0" label="Drawer" id="drawer-overview">
                Drawers are great for showing additional content without leaving the current page.
                <Button data-upstream-index="1" slot="footer" variant="brand" data-drawer="close"
                    >Close</Button
                >
            </Drawer>

            <Button data-upstream-index="2" appearance="filled">Open Drawer</Button>
        </template>
        <template v-if="scenario === 'drawer-2'">
            <Drawer
                data-upstream-index="0"
                label="Drawer"
                without-header
                class="drawer-without-header"
            >
                Look ma, no header!
                <Button data-upstream-index="1" slot="footer" variant="brand" data-drawer="close"
                    >Close</Button
                >
            </Drawer>

            <Button data-upstream-index="2" appearance="filled">Open Drawer</Button>
        </template>
        <template v-if="scenario === 'drawer-3'">
            <Drawer data-upstream-index="0" label="Drawer" class="drawer-footer">
                This drawer has a footer where you can put actions and other controls.
                <Button data-upstream-index="1" slot="footer" variant="brand" data-drawer="close"
                    >Close</Button
                >
            </Drawer>

            <Button data-upstream-index="2" appearance="filled">Open Drawer</Button>
        </template>
        <template v-if="scenario === 'drawer-4'">
            <Drawer data-upstream-index="0" label="Drawer" id="drawer-opening">
                This drawer was opened declaratively using a data attribute on the button.
                <Button data-upstream-index="1" slot="footer" variant="brand" data-drawer="close"
                    >Close</Button
                >
            </Drawer>

            <Button data-upstream-index="2" appearance="filled" data-drawer="open drawer-opening"
                >Open Drawer</Button
            >
        </template>
        <template v-if="scenario === 'drawer-5'">
            <Drawer data-upstream-index="0" label="Drawer" id="drawer-dismiss">
                Click the button below to close this drawer — no JavaScript required!
                <Button data-upstream-index="1" slot="footer" variant="brand" data-drawer="close"
                    >Close</Button
                >
            </Drawer>

            <Button data-upstream-index="2" appearance="filled" data-drawer="open drawer-dismiss"
                >Open Drawer</Button
            >
        </template>
        <template v-if="scenario === 'drawer-6'">
            <Drawer
                data-upstream-index="0"
                label="Drawer"
                placement="start"
                class="drawer-placement-start"
            >
                This drawer slides in from the start.
                <Button data-upstream-index="1" slot="footer" variant="brand" data-drawer="close"
                    >Close</Button
                >
            </Drawer>

            <Button data-upstream-index="2" appearance="filled">Open from Start</Button>
        </template>
        <template v-if="scenario === 'drawer-7'">
            <Drawer
                data-upstream-index="0"
                label="Drawer"
                placement="bottom"
                class="drawer-placement-bottom"
            >
                This drawer slides in from the bottom.
                <Button data-upstream-index="1" slot="footer" variant="brand" data-drawer="close"
                    >Close</Button
                >
            </Drawer>

            <Button data-upstream-index="2" appearance="filled">Open from Bottom</Button>
        </template>
        <template v-if="scenario === 'drawer-8'">
            <Drawer
                data-upstream-index="0"
                label="Drawer"
                class="drawer-custom-size"
                style="--size: 50vw"
            >
                This drawer is always 50% of the viewport.
                <Button data-upstream-index="1" slot="footer" variant="brand" data-drawer="close"
                    >Close</Button
                >
            </Drawer>

            <Button data-upstream-index="2" appearance="filled">Open Drawer</Button>
        </template>
        <template v-if="scenario === 'drawer-9'">
            <Drawer data-upstream-index="0" label="Drawer" class="drawer-scrolling">
                <div
                    style="
                        height: 150vh;
                        border: dashed 2px var(--wa-color-surface-border);
                        padding: 0 1rem;
                    "
                >
                    <p>Scroll down and give it a try! 👇</p>
                </div>
                <Button data-upstream-index="1" slot="footer" variant="brand" data-drawer="close"
                    >Close</Button
                >
            </Drawer>

            <Button data-upstream-index="2" appearance="filled">Open Drawer</Button>
        </template>
        <template v-if="scenario === 'drawer-10'">
            <Drawer data-upstream-index="0" label="Drawer" class="drawer-header-actions">
                <Button
                    data-upstream-index="1"
                    class="new-window"
                    slot="header-actions"
                    appearance="plain"
                >
                    <Icon
                        data-upstream-index="2"
                        name="arrow-up-right-from-square"
                        variant="solid"
                        label="Open in new window"
                    ></Icon>
                </Button>
                You can add custom actions to the header, like the button up there to open in a new
                window.
                <Button data-upstream-index="3" slot="footer" variant="brand" data-drawer="close"
                    >Close</Button
                >
            </Drawer>

            <Button data-upstream-index="4" appearance="filled">Open Drawer</Button>
        </template>
        <template v-if="scenario === 'drawer-11'">
            <Drawer
                data-upstream-index="0"
                label="Drawer"
                light-dismiss
                class="drawer-light-dismiss"
            >
                This drawer will close when you click on the overlay.
                <Button data-upstream-index="1" slot="footer" variant="brand" data-drawer="close"
                    >Close</Button
                >
            </Drawer>

            <Button data-upstream-index="2" appearance="filled">Open Drawer</Button>
        </template>
        <template v-if="scenario === 'drawer-12'">
            <Drawer data-upstream-index="0" label="Drawer" class="drawer-deny-close">
                This drawer will only close when you click the button below.
                <Button data-upstream-index="1" slot="footer" variant="brand" data-drawer="close"
                    >Close</Button
                >
            </Drawer>

            <Button data-upstream-index="2" appearance="filled">Open Drawer</Button>
        </template>
        <template v-if="scenario === 'drawer-13'">
            <Drawer data-upstream-index="0" label="Drawer" class="drawer-focus">
                <Input
                    data-upstream-index="1"
                    autofocus
                    placeholder="I will have focus when the drawer is opened"
                    v-model="input0"
                ></Input>
                <Button data-upstream-index="2" slot="footer" variant="brand" data-drawer="close"
                    >Close</Button
                >
            </Drawer>

            <Button data-upstream-index="3" appearance="filled">Open Drawer</Button>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Drawer, Icon, Input } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
const input0 = ref('');
</script>
