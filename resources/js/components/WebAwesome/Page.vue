<template>
    <wa-page
        :mobile-breakpoint.attr="mobileBreakpoint"
        :navigation-placement.attr="navigationPlacement"
        :disable-sticky.attr="disableSticky"
        :nav-open.attr="navOpen ? '' : null"
        :disable-navigation-toggle.attr="disableNavigationToggle ? '' : null"
    >
        <slot />
    </wa-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { PageProps } from '../../WebAwesome/pageProps';

interface Props extends /* @vue-ignore */ PageProps {
    mobileBreakpoint?: PageProps['mobileBreakpoint'];
    navigationPlacement?: PageProps['navigationPlacement'];
    disableSticky?: string;
    navOpen?: boolean;
    disableNavigationToggle?: boolean;
}

defineProps<Props>();

onMounted(async () => {
    await import('#front-awesome-webawesome/components/page/page.js');
});
</script>
