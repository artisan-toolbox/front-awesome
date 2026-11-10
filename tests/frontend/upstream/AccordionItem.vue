<template>
    <div>
        <template v-if="scenario === 'accordion-item-1'">
            <Accordion data-upstream-index="0">
                <AccordionItem data-upstream-index="1" label="Overview"
                    >The first section.</AccordionItem
                >
                <AccordionItem data-upstream-index="2" expanded data-anatomy-subject="true">
                    <span slot="label">Shipping &amp; returns</span>
                    Orders ship within two business days. Returns are free within 30 days.
                </AccordionItem>
                <AccordionItem data-upstream-index="3" label="Warranty"
                    >The third section.</AccordionItem
                >
            </Accordion>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Accordion, AccordionItem } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
