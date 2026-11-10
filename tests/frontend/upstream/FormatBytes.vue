<template>
    <div>
        <template v-if="scenario === 'format-bytes-1'">
            <div class="format-bytes-overview">
                The file is <FormatBytes data-upstream-index="0" :value="1000"></FormatBytes> in
                size.

                <Divider data-upstream-index="1"></Divider>

                <Input
                    data-upstream-index="2"
                    type="number"
                    label="Number to Format"
                    style="max-width: 180px"
                    v-model="input0"
                ></Input>
            </div>
        </template>
        <template v-if="scenario === 'format-bytes-2'">
            <FormatBytes data-upstream-index="0" :value="12"></FormatBytes><br />
            <FormatBytes data-upstream-index="1" :value="1200"></FormatBytes><br />
            <FormatBytes data-upstream-index="2" :value="1200000"></FormatBytes><br />
            <FormatBytes data-upstream-index="3" :value="1200000000"></FormatBytes>
        </template>
        <template v-if="scenario === 'format-bytes-3'">
            <FormatBytes data-upstream-index="0" :value="12" unit="bit"></FormatBytes><br />
            <FormatBytes data-upstream-index="1" :value="1200" unit="bit"></FormatBytes><br />
            <FormatBytes data-upstream-index="2" :value="1200000" unit="bit"></FormatBytes><br />
            <FormatBytes data-upstream-index="3" :value="1200000000" unit="bit"></FormatBytes>
        </template>
        <template v-if="scenario === 'format-bytes-4'">
            <FormatBytes data-upstream-index="0" :value="12" lang="de"></FormatBytes><br />
            <FormatBytes data-upstream-index="1" :value="1200" lang="de"></FormatBytes><br />
            <FormatBytes data-upstream-index="2" :value="1200000" lang="de"></FormatBytes><br />
            <FormatBytes data-upstream-index="3" :value="1200000000" lang="de"></FormatBytes>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Divider, FormatBytes, Input } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
const input0 = ref('1000');
</script>
