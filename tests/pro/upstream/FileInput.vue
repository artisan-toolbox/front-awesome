<template>
    <div>
        <template v-if="scenario === 'file-input-1'">
            <FileInput data-upstream-index="0" label="Select a file"></FileInput>
        </template>
        <template v-if="scenario === 'file-input-2'">
            <FileInput
                data-upstream-index="0"
                label="Profile photo"
                hint="PNG or JPG, up to 5 MB."
            ></FileInput>
        </template>
        <template v-if="scenario === 'file-input-3'">
            <FileInput data-upstream-index="0" label="Upload your resume"></FileInput>
        </template>
        <template v-if="scenario === 'file-input-4'">
            <FileInput
                data-upstream-index="0"
                label="Profile photo"
                hint="Upload a photo to personalize your account."
            ></FileInput>
        </template>
        <template v-if="scenario === 'file-input-5'">
            <FileInput
                data-upstream-index="0"
                label="Upload documents"
                hint="You can select multiple files at once."
                multiple
            ></FileInput>
        </template>
        <template v-if="scenario === 'file-input-6'">
            <FileInput
                data-upstream-index="0"
                label="Upload an image"
                hint="Only JPEG, PNG, GIF, and WebP images are allowed."
                accept="image/jpeg, image/png, image/gif, image/webp"
            ></FileInput>
        </template>
        <template v-if="scenario === 'file-input-7'">
            <FileInput
                data-upstream-index="0"
                label="Upload a document"
                hint="PDF and Word documents only."
                accept=".pdf, .doc, .docx"
            ></FileInput>
        </template>
        <template v-if="scenario === 'file-input-8'">
            <FileInput
                data-upstream-index="0"
                label="Take a photo"
                hint="Opens the rear-facing camera on supported mobile devices."
                accept="image/*"
                capture="environment"
            ></FileInput>
        </template>
        <template v-if="scenario === 'file-input-9'">
            <FileInput data-upstream-index="0" label="Upload disabled" disabled></FileInput>
        </template>
        <template v-if="scenario === 'file-input-10'">
            <FileInput data-upstream-index="0" label="Extra Small" size="xs"></FileInput>
            <br />
            <FileInput data-upstream-index="1" label="Small" size="s"></FileInput>
            <br />
            <FileInput data-upstream-index="2" label="Medium" size="m"></FileInput>
            <br />
            <FileInput data-upstream-index="3" label="Large" size="l"></FileInput>
            <br />
            <FileInput data-upstream-index="4" label="Extra Large" size="xl"></FileInput>
        </template>
        <template v-if="scenario === 'file-input-11'">
            <FileInput data-upstream-index="0" label="Upload files" multiple>
                <div
                    slot="dropzone"
                    style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem"
                >
                    <Icon
                        data-upstream-index="1"
                        name="cloud-arrow-up"
                        style="font-size: 2.5rem"
                    ></Icon>
                    <strong>Drag and drop your files here</strong>
                    <span style="color: var(--wa-color-neutral-on-quiet)">or click to browse</span>
                </div>
            </FileInput>
        </template>
        <template v-if="scenario === 'file-input-12'">
            <div>
                <FileInput
                    data-upstream-index="0"
                    id="file-input-demo"
                    label="Select some files"
                    hint="Try the buttons below after selecting files."
                    multiple
                ></FileInput>

                <Divider data-upstream-index="1"></Divider>

                <div class="wa-cluster">
                    <Button data-upstream-index="2" id="reverse-btn" appearance="filled"
                        >Reverse Order</Button
                    >
                    <Button data-upstream-index="3" id="clear-btn" appearance="filled"
                        >Clear All</Button
                    >
                    <Button data-upstream-index="4" id="log-btn" appearance="filled"
                        >Log Files</Button
                    >
                </div>
            </div>
        </template>
        <template v-if="scenario === 'file-input-13'">
            <form id="upload-form" method="post" enctype="multipart/form-data" action="about:blank">
                <FileInput
                    data-upstream-index="0"
                    name="documents"
                    label="Select files to upload"
                    multiple
                ></FileInput>
                <br />
                <Button data-upstream-index="1" appearance="filled" type="submit" variant="brand"
                    >Upload</Button
                >
            </form>
        </template>
        <template v-if="scenario === 'file-input-14'">
            <form id="required-form" action="about:blank" method="get">
                <FileInput
                    data-upstream-index="0"
                    name="file"
                    label="Required file"
                    hint="You must select a file to submit."
                    required
                ></FileInput>
                <br />
                <Button data-upstream-index="1" appearance="filled" type="submit" variant="brand"
                    >Submit</Button
                >
                <Button data-upstream-index="2" type="reset" appearance="filled">Reset</Button>
            </form>
        </template>
        <template v-if="scenario === 'file-input-15'">
            <form id="custom-validation-form" action="about:blank" method="get">
                <FileInput
                    data-upstream-index="0"
                    id="custom-file-input"
                    name="file"
                    label="Upload a small file"
                    hint="Files must be smaller than 500 KB."
                ></FileInput>
                <br />
                <Button data-upstream-index="1" appearance="filled" type="submit" variant="brand"
                    >Submit</Button
                >
                <Button data-upstream-index="2" type="reset" appearance="filled">Reset</Button>
            </form>
        </template>
        <template v-if="scenario === 'file-input-16'">
            <form id="styling-form" action="about:blank" method="get" class="validation-styles">
                <FileInput
                    data-upstream-index="0"
                    name="file"
                    label="Select a file"
                    required
                ></FileInput>
                <br />
                <Button data-upstream-index="1" appearance="filled" type="submit" variant="brand"
                    >Submit</Button
                >
                <Button data-upstream-index="2" type="reset" appearance="filled">Reset</Button>
            </form>
        </template>
        <template v-if="scenario === 'file-input-17'">
            <FileInput
                data-upstream-index="0"
                class="drag-styles"
                label="Watch the border change while dragging"
                multiple
            ></FileInput>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, Divider, Icon } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import { FileInput } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
</script>
