<template>
    <div>
        <template v-if="scenario === 'radio-1'">
            <RadioGroup data-upstream-index="0" label="Network">
                <Radio data-upstream-index="1" value="off">Off</Radio>
                <Radio data-upstream-index="2" value="wifi" data-anatomy-subject="true"
                    >Wi-Fi</Radio
                >
                <Radio data-upstream-index="3" value="all">Everything</Radio>
            </RadioGroup>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Radio, RadioGroup } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
