<template>
    <div>
        <template v-if="scenario === 'include-1'">
            <Include data-upstream-index="0" src="/assets/examples/include.html"></Include>
        </template>
        <template v-if="scenario === 'include-2'">
            <Include
                data-upstream-index="0"
                src="/assets/examples/include.html#callout-fragment"
            ></Include>
        </template>
        <template v-if="scenario === 'include-3'">
            <component :is="'template'" id="greeting" :innerHTML="templateContents[0]"></component>

            <Include data-upstream-index="0" src="#greeting"></Include>
        </template>
        <template v-if="scenario === 'include-4'">
            <Include data-upstream-index="0" src="/assets/examples/include.html"></Include>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Include } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
const templateContents = [
    '\n  <wa-callout variant="brand">\n    <wa-icon slot="icon" name="hand-wave"></wa-icon>\n    Hello from a template!\n  </wa-callout>\n',
];
</script>
