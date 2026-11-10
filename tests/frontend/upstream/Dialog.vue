<template>
    <div>
        <template v-if="scenario === 'dialog-1'">
            <Dialog data-upstream-index="0" label="Dialog" id="dialog-overview">
                This is a standard dialog. You can put any content you want in here!
                <Button data-upstream-index="1" slot="footer" variant="brand" data-dialog="close"
                    >Close</Button
                >
            </Dialog>

            <Button data-upstream-index="2" appearance="filled">Open Dialog</Button>
        </template>
        <template v-if="scenario === 'dialog-2'">
            <Dialog
                data-upstream-index="0"
                label="Dialog"
                without-header
                class="dialog-without-header"
            >
                Look ma, no header! Sometimes you just need a clean, simple dialog.
                <Button data-upstream-index="1" slot="footer" variant="brand" data-dialog="close"
                    >Close</Button
                >
            </Dialog>

            <Button data-upstream-index="2" appearance="filled">Open Dialog</Button>
        </template>
        <template v-if="scenario === 'dialog-3'">
            <Dialog data-upstream-index="0" label="Dialog" class="dialog-footer">
                Check out the footer below — it's a great place for actions and buttons.
                <Button data-upstream-index="1" slot="footer" variant="brand" data-dialog="close"
                    >Close</Button
                >
            </Dialog>

            <Button data-upstream-index="2" appearance="filled">Open Dialog</Button>
        </template>
        <template v-if="scenario === 'dialog-4'">
            <Dialog data-upstream-index="0" label="Dialog" id="dialog-opening">
                This dialog was opened declaratively — no JavaScript required!
                <Button data-upstream-index="1" slot="footer" variant="brand" data-dialog="close"
                    >Close</Button
                >
            </Dialog>

            <Button data-upstream-index="2" appearance="filled" data-dialog="open dialog-opening"
                >Open Dialog</Button
            >
        </template>
        <template v-if="scenario === 'dialog-5'">
            <Dialog data-upstream-index="0" label="Dialog" id="dialog-dismiss">
                Click the button in the footer to close this dialog declaratively.
                <Button data-upstream-index="1" slot="footer" variant="brand" data-dialog="close"
                    >Close</Button
                >
            </Dialog>

            <Button data-upstream-index="2" appearance="filled" data-dialog="open dialog-dismiss"
                >Open Dialog</Button
            >
        </template>
        <template v-if="scenario === 'dialog-6'">
            <Dialog
                data-upstream-index="0"
                label="Dialog"
                class="dialog-width"
                style="--width: 50vw"
            >
                This dialog is wider than the default — handy when you need more room for content.
                <Button data-upstream-index="1" slot="footer" variant="brand" data-dialog="close"
                    >Close</Button
                >
            </Dialog>

            <Button data-upstream-index="2" appearance="filled">Open Dialog</Button>
        </template>
        <template v-if="scenario === 'dialog-7'">
            <Dialog data-upstream-index="0" label="Dialog" class="dialog-scrolling">
                <div
                    style="
                        height: 150vh;
                        border: dashed 2px var(--wa-color-surface-border);
                        padding: 0 1rem;
                    "
                >
                    <p>Scroll down and give it a try! 👇</p>
                </div>
                <Button data-upstream-index="1" slot="footer" variant="brand" data-dialog="close"
                    >Close</Button
                >
            </Dialog>

            <Button data-upstream-index="2" appearance="filled">Open Dialog</Button>
        </template>
        <template v-if="scenario === 'dialog-8'">
            <Dialog data-upstream-index="0" label="Dialog" class="dialog-header-actions">
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
                You can add custom actions to the header, like the icon button up there!
                <Button data-upstream-index="3" slot="footer" variant="brand" data-dialog="close"
                    >Close</Button
                >
            </Dialog>

            <Button data-upstream-index="4" appearance="filled">Open Dialog</Button>
        </template>
        <template v-if="scenario === 'dialog-9'">
            <Dialog
                data-upstream-index="0"
                label="Dialog"
                light-dismiss
                class="dialog-light-dismiss"
            >
                This dialog will close when you click on the overlay.
                <Button data-upstream-index="1" slot="footer" variant="brand" data-dialog="close"
                    >Close</Button
                >
            </Dialog>

            <Button data-upstream-index="2" appearance="filled">Open Dialog</Button>
        </template>
        <template v-if="scenario === 'dialog-10'">
            <Dialog data-upstream-index="0" label="Dialog" class="dialog-deny-close">
                This dialog will only close when you click the button below.
                <Button data-upstream-index="1" slot="footer" variant="brand" data-dialog="close"
                    >Only this button will close it</Button
                >
            </Dialog>

            <Button data-upstream-index="2" appearance="filled">Open Dialog</Button>
        </template>
        <template v-if="scenario === 'dialog-11'">
            <Dialog data-upstream-index="0" label="Dialog" class="dialog-focus">
                <Input
                    data-upstream-index="1"
                    autofocus
                    placeholder="I will have focus when the dialog is opened"
                    v-model="input0"
                ></Input>
                <Button data-upstream-index="2" slot="footer" variant="brand" data-dialog="close"
                    >Close</Button
                >
            </Dialog>

            <Button data-upstream-index="3" appearance="filled">Open Dialog</Button>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Dialog, Icon, Input } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
const input0 = ref('');
</script>
