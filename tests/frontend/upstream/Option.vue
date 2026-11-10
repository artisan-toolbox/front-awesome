<template>
    <div>
        <template v-if="scenario === 'option-1'">
            <!-- select is an overlay that won't render on a static stage, so the options show among dimmed siblings. -->
            <div style="display: flex; flex-direction: column">
                <Option data-upstream-index="0"
                    ><Icon data-upstream-index="1" slot="start" name="mug-hot"></Icon
                    >Espresso</Option
                >
                <Option data-upstream-index="2" data-anatomy-subject="true"
                    ><Icon data-upstream-index="3" slot="start" name="star"></Icon>Cortado</Option
                >
                <Option data-upstream-index="4"
                    ><Icon data-upstream-index="5" slot="start" name="mug-saucer"></Icon
                    >Cappuccino</Option
                >
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Icon, Option } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
