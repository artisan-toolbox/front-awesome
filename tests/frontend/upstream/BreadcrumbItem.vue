<template>
    <div>
        <template v-if="scenario === 'breadcrumb-item-1'">
            <Breadcrumb data-upstream-index="0">
                <BreadcrumbItem data-upstream-index="1"
                    ><Icon data-upstream-index="2" slot="start" name="house"></Icon
                    >Home</BreadcrumbItem
                >
                <BreadcrumbItem data-upstream-index="3" data-anatomy-subject="true"
                    ><Icon data-upstream-index="4" slot="start" name="folder"></Icon
                    >Projects</BreadcrumbItem
                >
                <BreadcrumbItem data-upstream-index="5">Overview</BreadcrumbItem>
            </Breadcrumb>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Breadcrumb,
    BreadcrumbItem,
    Icon,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
