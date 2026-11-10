<template>
    <div>
        <template v-if="scenario === 'page-1'">
            <Page data-upstream-index="0" disable-sticky="header aside"> ... </Page>
        </template>
        <template v-if="scenario === 'page-2'">
            <Page data-upstream-index="0">
                ...
                <span slot="skip-to-content">Zum Inhalt springen</span>
                ...
            </Page>
        </template>
        <template v-if="scenario === 'page-3'">
            <Page data-upstream-index="0" mobile-breakpoint="600"> ... </Page>
        </template>
        <template v-if="scenario === 'page-4'">
            <Page data-upstream-index="0" mobile-breakpoint="600">
                ...
                <Button data-upstream-index="1" data-toggle-nav>Menu</Button>
                ...
            </Page>
        </template>
        <template v-if="scenario === 'page-5'">
            <Page data-upstream-index="0" nav-open> ... </Page>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Button, Page } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
