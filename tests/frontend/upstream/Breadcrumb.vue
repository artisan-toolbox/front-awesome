<template>
    <div>
        <template v-if="scenario === 'breadcrumb-1'">
            <Breadcrumb data-upstream-index="0">
                <BreadcrumbItem data-upstream-index="1">Catalog</BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="2">Clothing</BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="3">Women's</BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="4">Shirts &amp; Tops</BreadcrumbItem>
            </Breadcrumb>
        </template>
        <template v-if="scenario === 'breadcrumb-2'">
            <Breadcrumb data-upstream-index="0">
                <BreadcrumbItem data-upstream-index="1" href="https://example.com/home"
                    >Homepage</BreadcrumbItem
                >

                <BreadcrumbItem data-upstream-index="2" href="https://example.com/home/services"
                    >Our Services</BreadcrumbItem
                >

                <BreadcrumbItem
                    data-upstream-index="3"
                    href="https://example.com/home/services/digital"
                    >Digital Media</BreadcrumbItem
                >

                <BreadcrumbItem data-upstream-index="4" href="">Web Design</BreadcrumbItem>
            </Breadcrumb>
        </template>
        <template v-if="scenario === 'breadcrumb-3'">
            <Breadcrumb data-upstream-index="0">
                <BreadcrumbItem data-upstream-index="1">
                    <Icon data-upstream-index="2" slot="start" name="house"></Icon>
                    Home
                </BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="3">Articles</BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="4">
                    <Icon data-upstream-index="5" slot="end" name="umbrella-beach"></Icon>
                    Traveling
                </BreadcrumbItem>
            </Breadcrumb>
        </template>
        <template v-if="scenario === 'breadcrumb-4'">
            <Breadcrumb data-upstream-index="0">
                <Icon
                    data-upstream-index="1"
                    slot="separator"
                    name="angles-right"
                    variant="solid"
                ></Icon>
                <BreadcrumbItem data-upstream-index="2">First</BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="3">Second</BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="4">Third</BreadcrumbItem>
            </Breadcrumb>

            <br />

            <Breadcrumb data-upstream-index="5">
                <Icon
                    data-upstream-index="6"
                    slot="separator"
                    name="arrow-right"
                    variant="solid"
                ></Icon>
                <BreadcrumbItem data-upstream-index="7">First</BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="8">Second</BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="9">Third</BreadcrumbItem>
            </Breadcrumb>

            <br />

            <Breadcrumb data-upstream-index="10">
                <span slot="separator">/</span>
                <BreadcrumbItem data-upstream-index="11">First</BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="12">Second</BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="13">Third</BreadcrumbItem>
            </Breadcrumb>
        </template>
        <template v-if="scenario === 'breadcrumb-5'">
            <Breadcrumb data-upstream-index="0" class="redcrumbs">
                <BreadcrumbItem data-upstream-index="1">
                    <Icon data-upstream-index="2" slot="start" name="house" variant="solid"></Icon>
                    Home
                </BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="3">Articles</BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="4">Traveling</BreadcrumbItem>
            </Breadcrumb>
        </template>
        <template v-if="scenario === 'breadcrumb-6'">
            <Breadcrumb data-upstream-index="0">
                <BreadcrumbItem data-upstream-index="1">Homepage</BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="2">
                    <Dropdown data-upstream-index="3">
                        <Button
                            data-upstream-index="4"
                            slot="trigger"
                            size="s"
                            appearance="filled"
                            pill
                        >
                            <Icon
                                data-upstream-index="5"
                                label="More options"
                                name="ellipsis"
                                variant="solid"
                            ></Icon>
                        </Button>
                        <DropdownItem data-upstream-index="6" type="checkbox" checked
                            >Web Design</DropdownItem
                        >
                        <DropdownItem data-upstream-index="7" type="checkbox"
                            >Web Development</DropdownItem
                        >
                        <DropdownItem data-upstream-index="8" type="checkbox"
                            >Marketing</DropdownItem
                        >
                    </Dropdown>
                </BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="9">Our Services</BreadcrumbItem>
                <BreadcrumbItem data-upstream-index="10">Digital Media</BreadcrumbItem>
            </Breadcrumb>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Dropdown,
    DropdownItem,
    Icon,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
