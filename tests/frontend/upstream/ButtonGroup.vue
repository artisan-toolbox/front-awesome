<template>
    <div>
        <template v-if="scenario === 'button-group-1'">
            <ButtonGroup data-upstream-index="0" label="Alignment">
                <Button data-upstream-index="1" appearance="filled">Left</Button>
                <Button data-upstream-index="2" appearance="filled">Center</Button>
                <Button data-upstream-index="3" appearance="filled">Right</Button>
            </ButtonGroup>
        </template>
        <template v-if="scenario === 'button-group-2'">
            <ButtonGroup data-upstream-index="0" orientation="vertical" label="Options">
                <Button data-upstream-index="1" appearance="filled">Top</Button>
                <Button data-upstream-index="2" appearance="filled">Middle</Button>
                <Button data-upstream-index="3" appearance="filled">Bottom</Button>
            </ButtonGroup>
        </template>
        <template v-if="scenario === 'button-group-3'">
            <ButtonGroup data-upstream-index="0" label="Alignment">
                <Button data-upstream-index="1" appearance="filled" size="m" pill>Left</Button>
                <Button data-upstream-index="2" appearance="filled" size="m" pill>Center</Button>
                <Button data-upstream-index="3" appearance="filled" size="m" pill>Right</Button>
            </ButtonGroup>
        </template>
        <template v-if="scenario === 'button-group-4'">
            <ButtonGroup data-upstream-index="0" label="Options">
                <Button data-upstream-index="1" appearance="filled">Edit</Button>
                <Dropdown data-upstream-index="2">
                    <Button data-upstream-index="3" appearance="filled" slot="trigger" with-caret
                        >More</Button
                    >
                    <DropdownItem data-upstream-index="4">Cut</DropdownItem>
                    <DropdownItem data-upstream-index="5">Copy</DropdownItem>
                    <DropdownItem data-upstream-index="6">Paste</DropdownItem>
                </Dropdown>
                <Button data-upstream-index="7" appearance="filled">Delete</Button>
            </ButtonGroup>
        </template>
        <template v-if="scenario === 'button-group-5'">
            <ButtonGroup data-upstream-index="0" label="Save">
                <Button data-upstream-index="1" appearance="filled" variant="brand">Save</Button>
                <Dropdown data-upstream-index="2" placement="bottom-end">
                    <Button
                        data-upstream-index="3"
                        appearance="filled"
                        slot="trigger"
                        variant="brand"
                    >
                        <Icon
                            data-upstream-index="4"
                            name="chevron-down"
                            label="More options"
                        ></Icon>
                    </Button>
                    <DropdownItem data-upstream-index="5">Save</DropdownItem>
                    <DropdownItem data-upstream-index="6">Save as&hellip;</DropdownItem>
                    <DropdownItem data-upstream-index="7">Save all</DropdownItem>
                </Dropdown>
            </ButtonGroup>
        </template>
        <template v-if="scenario === 'button-group-6'">
            <ButtonGroup data-upstream-index="0" label="Alignment">
                <Button data-upstream-index="1" appearance="filled" id="button-left">Left</Button>
                <Button data-upstream-index="2" appearance="filled" id="button-center"
                    >Center</Button
                >
                <Button data-upstream-index="3" appearance="filled" id="button-right">Right</Button>
            </ButtonGroup>

            <Tooltip data-upstream-index="4" for="button-left">Align left</Tooltip>
            <Tooltip data-upstream-index="5" for="button-center">Align center</Tooltip>
            <Tooltip data-upstream-index="6" for="button-right">Align right</Tooltip>
        </template>
        <template v-if="scenario === 'button-group-7'">
            <div class="button-group-toolbar wa-cluster">
                <ButtonGroup data-upstream-index="0" label="History">
                    <Button data-upstream-index="1" appearance="filled" id="undo-button"
                        ><Icon
                            data-upstream-index="2"
                            name="undo"
                            variant="solid"
                            label="Undo"
                        ></Icon
                    ></Button>
                    <Button data-upstream-index="3" appearance="filled" id="redo-button"
                        ><Icon
                            data-upstream-index="4"
                            name="redo"
                            variant="solid"
                            label="Redo"
                        ></Icon
                    ></Button>
                </ButtonGroup>

                <ButtonGroup data-upstream-index="5" label="Formatting">
                    <Button data-upstream-index="6" appearance="filled" id="button-bold"
                        ><Icon
                            data-upstream-index="7"
                            name="bold"
                            variant="solid"
                            label="Bold"
                        ></Icon
                    ></Button>
                    <Button data-upstream-index="8" appearance="filled" id="button-italic"
                        ><Icon
                            data-upstream-index="9"
                            name="italic"
                            variant="solid"
                            label="Italic"
                        ></Icon
                    ></Button>
                    <Button data-upstream-index="10" appearance="filled" id="button-underline"
                        ><Icon
                            data-upstream-index="11"
                            name="underline"
                            variant="solid"
                            label="Underline"
                        ></Icon
                    ></Button>
                </ButtonGroup>

                <ButtonGroup data-upstream-index="12" label="Alignment">
                    <Button data-upstream-index="13" appearance="filled" id="button-align-left"
                        ><Icon
                            data-upstream-index="14"
                            name="align-left"
                            variant="solid"
                            label="Align left"
                        ></Icon
                    ></Button>
                    <Button data-upstream-index="15" appearance="filled" id="button-align-center"
                        ><Icon
                            data-upstream-index="16"
                            name="align-center"
                            variant="solid"
                            label="Align center"
                        ></Icon
                    ></Button>
                    <Button data-upstream-index="17" appearance="filled" id="button-align-right"
                        ><Icon
                            data-upstream-index="18"
                            name="align-right"
                            variant="solid"
                            label="Align right"
                        ></Icon
                    ></Button>
                </ButtonGroup>
            </div>

            <Tooltip data-upstream-index="19" for="undo-button">Undo</Tooltip>
            <Tooltip data-upstream-index="20" for="redo-button">Redo</Tooltip>
            <Tooltip data-upstream-index="21" for="button-bold">Bold</Tooltip>
            <Tooltip data-upstream-index="22" for="button-italic">Italic</Tooltip>
            <Tooltip data-upstream-index="23" for="button-underline">Underline</Tooltip>
            <Tooltip data-upstream-index="24" for="button-align-left">Align left</Tooltip>
            <Tooltip data-upstream-index="25" for="button-align-center">Align center</Tooltip>
            <Tooltip data-upstream-index="26" for="button-align-right">Align right</Tooltip>
        </template>
        <template v-if="scenario === 'button-group-8'">
            <ButtonGroup data-upstream-index="0" label="Alignment">
                <button class="wa-filled">Left</button>
                <button class="wa-filled">Center</button>
                <button class="wa-filled">Right</button>
            </ButtonGroup>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    ButtonGroup,
    Dropdown,
    DropdownItem,
    Icon,
    Tooltip,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
