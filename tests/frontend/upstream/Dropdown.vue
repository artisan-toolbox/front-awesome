<template>
    <div>
        <template v-if="scenario === 'dropdown-1'">
            <Dropdown data-upstream-index="0">
                <Button data-upstream-index="1" appearance="filled" slot="trigger" with-caret
                    >Options</Button
                >

                <DropdownItem data-upstream-index="2" value="edit">Edit</DropdownItem>
                <DropdownItem data-upstream-index="3" value="duplicate">Duplicate</DropdownItem>
                <DropdownItem data-upstream-index="4" value="delete">Delete</DropdownItem>
            </Dropdown>
        </template>
        <template v-if="scenario === 'dropdown-2'">
            <Dropdown data-upstream-index="0">
                <Button data-upstream-index="1" appearance="filled" slot="trigger" with-caret
                    >Edit</Button
                >

                <DropdownItem data-upstream-index="2" value="cut">
                    <Icon data-upstream-index="3" slot="icon" name="scissors"></Icon>
                    Cut
                </DropdownItem>

                <DropdownItem data-upstream-index="4" value="copy">
                    <Icon data-upstream-index="5" slot="icon" name="copy"></Icon>
                    Copy
                </DropdownItem>

                <DropdownItem data-upstream-index="6" value="paste">
                    <Icon data-upstream-index="7" slot="icon" name="paste"></Icon>
                    Paste
                </DropdownItem>

                <DropdownItem data-upstream-index="8" value="delete" variant="danger">
                    <Icon data-upstream-index="9" slot="icon" name="trash"></Icon>
                    Delete
                </DropdownItem>
            </Dropdown>
        </template>
        <template v-if="scenario === 'dropdown-3'">
            <Dropdown data-upstream-index="0">
                <Button data-upstream-index="1" appearance="filled" slot="trigger" with-caret
                    >Device</Button
                >

                <h3>Type</h3>
                <DropdownItem data-upstream-index="2" value="phone">Phone</DropdownItem>
                <DropdownItem data-upstream-index="3" value="tablet">Tablet</DropdownItem>
                <DropdownItem data-upstream-index="4" value="desktop">Desktop</DropdownItem>

                <Divider data-upstream-index="5"></Divider>

                <DropdownItem data-upstream-index="6" value="more">More options…</DropdownItem>
            </Dropdown>
        </template>
        <template v-if="scenario === 'dropdown-4'">
            <Dropdown data-upstream-index="0">
                <Button data-upstream-index="1" appearance="filled" slot="trigger" with-caret
                    >Message</Button
                >

                <DropdownItem data-upstream-index="2" value="reply">
                    Reply
                    <span slot="details">⌘R</span>
                </DropdownItem>

                <DropdownItem data-upstream-index="3" value="forward">
                    Forward
                    <span slot="details">⌘F</span>
                </DropdownItem>

                <DropdownItem data-upstream-index="4" value="move">
                    Move
                    <span slot="details">⌘M</span>
                </DropdownItem>

                <Divider data-upstream-index="5"></Divider>

                <DropdownItem data-upstream-index="6" value="archive">
                    Archive
                    <span slot="details">⌘A</span>
                </DropdownItem>

                <DropdownItem data-upstream-index="7" value="delete" variant="danger">
                    Delete
                    <span slot="details">Del</span>
                </DropdownItem>
            </Dropdown>
        </template>
        <template v-if="scenario === 'dropdown-5'">
            <div class="dropdown-checkboxes">
                <Dropdown data-upstream-index="0">
                    <Button data-upstream-index="1" appearance="filled" slot="trigger" with-caret
                        >View</Button
                    >

                    <DropdownItem data-upstream-index="2" type="checkbox" value="canvas" checked
                        >Show canvas</DropdownItem
                    >
                    <DropdownItem data-upstream-index="3" type="checkbox" value="grid" checked
                        >Show grid</DropdownItem
                    >
                    <DropdownItem data-upstream-index="4" type="checkbox" value="source"
                        >Show source</DropdownItem
                    >

                    <Divider data-upstream-index="5"></Divider>

                    <DropdownItem data-upstream-index="6" value="preferences"
                        >Preferences…</DropdownItem
                    >
                </Dropdown>
            </div>
        </template>
        <template v-if="scenario === 'dropdown-6'">
            <Dropdown data-upstream-index="0">
                <Button data-upstream-index="1" appearance="filled" slot="trigger" with-caret
                    >Resources</Button
                >

                <DropdownItem data-upstream-index="2" href="/docs/">
                    <Icon data-upstream-index="3" slot="icon" name="book"></Icon>
                    Documentation
                </DropdownItem>

                <DropdownItem
                    data-upstream-index="4"
                    href="https://github.com/shoelace-style/webawesome"
                    target="_blank"
                    rel="noreferrer"
                >
                    <Icon data-upstream-index="5" slot="icon" name="github" family="brands"></Icon>
                    GitHub
                    <Icon
                        data-upstream-index="6"
                        slot="details"
                        name="arrow-up-right-from-square"
                    ></Icon>
                </DropdownItem>

                <Divider data-upstream-index="7"></Divider>

                <DropdownItem
                    data-upstream-index="8"
                    href="/assets/images/awesome.svg"
                    download="awesome.svg"
                >
                    <Icon data-upstream-index="9" slot="icon" name="download"></Icon>
                    Download logo
                </DropdownItem>
            </Dropdown>
        </template>
        <template v-if="scenario === 'dropdown-7'">
            <Dropdown data-upstream-index="0">
                <Button data-upstream-index="1" appearance="filled" slot="trigger" with-caret
                    >Project</Button
                >

                <DropdownItem data-upstream-index="2" value="share">
                    <Icon data-upstream-index="3" slot="icon" name="share"></Icon>
                    Share
                </DropdownItem>

                <DropdownItem data-upstream-index="4" value="preferences">
                    <Icon data-upstream-index="5" slot="icon" name="gear"></Icon>
                    Preferences
                </DropdownItem>

                <Divider data-upstream-index="6"></Divider>

                <h3>Danger zone</h3>

                <DropdownItem data-upstream-index="7" value="archive">
                    <Icon data-upstream-index="8" slot="icon" name="archive"></Icon>
                    Archive
                </DropdownItem>

                <DropdownItem data-upstream-index="9" value="delete" variant="danger">
                    <Icon data-upstream-index="10" slot="icon" name="trash"></Icon>
                    Delete
                </DropdownItem>
            </Dropdown>
        </template>
        <template v-if="scenario === 'dropdown-8'">
            <div class="dropdown-submenus">
                <Dropdown data-upstream-index="0">
                    <Button data-upstream-index="1" appearance="filled" slot="trigger" with-caret
                        >File</Button
                    >

                    <DropdownItem data-upstream-index="2" value="new">New</DropdownItem>
                    <DropdownItem data-upstream-index="3" value="open">Open</DropdownItem>

                    <Divider data-upstream-index="4"></Divider>

                    <DropdownItem data-upstream-index="5">
                        Export
                        <DropdownItem data-upstream-index="6" slot="submenu" value="pdf"
                            >PDF</DropdownItem
                        >
                        <DropdownItem data-upstream-index="7" slot="submenu" value="docx"
                            >Word document</DropdownItem
                        >
                        <DropdownItem data-upstream-index="8" slot="submenu" value="xlsx"
                            >Excel spreadsheet</DropdownItem
                        >
                        <DropdownItem data-upstream-index="9" slot="submenu" value="csv"
                            >CSV</DropdownItem
                        >
                    </DropdownItem>

                    <DropdownItem data-upstream-index="10">
                        Options
                        <DropdownItem
                            data-upstream-index="11"
                            slot="submenu"
                            type="checkbox"
                            value="compress"
                            >Compress files</DropdownItem
                        >
                        <DropdownItem
                            data-upstream-index="12"
                            slot="submenu"
                            type="checkbox"
                            checked
                            value="metadata"
                            >Include metadata</DropdownItem
                        >
                        <DropdownItem
                            data-upstream-index="13"
                            slot="submenu"
                            type="checkbox"
                            value="password"
                            >Password protect</DropdownItem
                        >
                    </DropdownItem>
                </Dropdown>
            </div>
        </template>
        <template v-if="scenario === 'dropdown-9'">
            <Dropdown data-upstream-index="0">
                <Button data-upstream-index="1" appearance="filled" slot="trigger" with-caret
                    >Payment method</Button
                >

                <DropdownItem data-upstream-index="2" value="cash">Cash</DropdownItem>
                <DropdownItem data-upstream-index="3" value="check" disabled
                    >Personal check</DropdownItem
                >
                <DropdownItem data-upstream-index="4" value="credit">Credit card</DropdownItem>
                <DropdownItem data-upstream-index="5" value="gift-card">Gift card</DropdownItem>
            </Dropdown>
        </template>
        <template v-if="scenario === 'dropdown-10'">
            <Dropdown data-upstream-index="0" placement="right-start">
                <Button data-upstream-index="1" appearance="filled" slot="trigger">
                    File formats
                    <Icon data-upstream-index="2" slot="end" name="chevron-right"></Icon>
                </Button>

                <DropdownItem data-upstream-index="3" value="pdf">PDF document</DropdownItem>
                <DropdownItem data-upstream-index="4" value="docx">Word document</DropdownItem>
                <DropdownItem data-upstream-index="5" value="xlsx">Excel spreadsheet</DropdownItem>
                <DropdownItem data-upstream-index="6" value="pptx"
                    >PowerPoint presentation</DropdownItem
                >
                <DropdownItem data-upstream-index="7" value="txt">Plain text</DropdownItem>
                <DropdownItem data-upstream-index="8" value="json">JSON file</DropdownItem>
            </Dropdown>
        </template>
        <template v-if="scenario === 'dropdown-11'">
            <Dropdown data-upstream-index="0" :distance="30">
                <Button data-upstream-index="1" appearance="filled" slot="trigger" with-caret
                    >Edit</Button
                >

                <DropdownItem data-upstream-index="2">Cut</DropdownItem>
                <DropdownItem data-upstream-index="3">Copy</DropdownItem>
                <DropdownItem data-upstream-index="4">Paste</DropdownItem>

                <Divider data-upstream-index="5"></Divider>

                <DropdownItem data-upstream-index="6">Find</DropdownItem>
                <DropdownItem data-upstream-index="7">Replace</DropdownItem>
            </Dropdown>
        </template>
        <template v-if="scenario === 'dropdown-12'">
            <Dropdown data-upstream-index="0" :skidding="30">
                <Button data-upstream-index="1" appearance="filled" slot="trigger" with-caret
                    >Edit</Button
                >

                <DropdownItem data-upstream-index="2">Cut</DropdownItem>
                <DropdownItem data-upstream-index="3">Copy</DropdownItem>
                <DropdownItem data-upstream-index="4">Paste</DropdownItem>

                <Divider data-upstream-index="5"></Divider>

                <DropdownItem data-upstream-index="6">Find</DropdownItem>
                <DropdownItem data-upstream-index="7">Replace</DropdownItem>
            </Dropdown>
        </template>
        <template v-if="scenario === 'dropdown-13'">
            <div class="dropdown-zoom-demo">
                <div class="dropdown-zoom-stage">
                    <div class="dropdown-zoom-content">
                        <Icon data-upstream-index="0" name="image"></Icon>
                        <span class="dropdown-zoom-level">100%</span>
                    </div>
                </div>

                <Dropdown data-upstream-index="1">
                    <Button data-upstream-index="2" appearance="filled" slot="trigger" with-caret
                        >View</Button
                    >
                    <DropdownItem data-upstream-index="3" value="zoom-in">Zoom in</DropdownItem>
                    <DropdownItem data-upstream-index="4" value="zoom-out">Zoom out</DropdownItem>
                    <Divider data-upstream-index="5"></Divider>
                    <DropdownItem data-upstream-index="6" value="actual">Actual size</DropdownItem>
                </Dropdown>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Divider,
    Dropdown,
    DropdownItem,
    Icon,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
