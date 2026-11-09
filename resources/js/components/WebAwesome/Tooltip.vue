<template>
    <wa-tooltip
        :disabled.attr="disabled ? '' : null"
        :open.attr="open ? '' : null"
        :without-arrow.attr="withoutArrow ? '' : null"
        :show-delay.attr="showDelay"
        :hide-delay.attr="hideDelay"
    >
        <slot />
    </wa-tooltip>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { TooltipProps } from '../../WebAwesome/tooltipProps';

interface Props extends /* @vue-ignore */ TooltipProps {
    disabled?: boolean;
    open?: boolean;
    withoutArrow?: boolean;
    showDelay?: TooltipProps['showDelay'];
    hideDelay?: TooltipProps['hideDelay'];
}

defineProps<Props>();

onMounted(async () => {
    await import('#front-awesome-webawesome/components/tooltip/tooltip.js');
});
</script>
