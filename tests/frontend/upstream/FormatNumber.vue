<template>
    <div>
        <template v-if="scenario === 'format-number-1'">
            <div class="format-number-overview">
                <FormatNumber data-upstream-index="0" :value="1000"></FormatNumber>

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
        <template v-if="scenario === 'format-number-2'">
            <FormatNumber data-upstream-index="0" type="percent" :value="0"></FormatNumber><br />
            <FormatNumber data-upstream-index="1" type="percent" :value="0.25"></FormatNumber><br />
            <FormatNumber data-upstream-index="2" type="percent" :value="0.5"></FormatNumber><br />
            <FormatNumber data-upstream-index="3" type="percent" :value="0.75"></FormatNumber><br />
            <FormatNumber data-upstream-index="4" type="percent" :value="1"></FormatNumber>
        </template>
        <template v-if="scenario === 'format-number-3'">
            English:
            <FormatNumber
                data-upstream-index="0"
                :value="2000"
                lang="en"
                :minimum-fraction-digits="2"
            ></FormatNumber
            ><br />
            German:
            <FormatNumber
                data-upstream-index="1"
                :value="2000"
                lang="de"
                :minimum-fraction-digits="2"
            ></FormatNumber
            ><br />
            Russian:
            <FormatNumber
                data-upstream-index="2"
                :value="2000"
                lang="ru"
                :minimum-fraction-digits="2"
            ></FormatNumber>
        </template>
        <template v-if="scenario === 'format-number-4'">
            <FormatNumber
                data-upstream-index="0"
                type="currency"
                currency="USD"
                :value="2000"
                lang="en-US"
            ></FormatNumber
            ><br />
            <FormatNumber
                data-upstream-index="1"
                type="currency"
                currency="GBP"
                :value="2000"
                lang="en-GB"
            ></FormatNumber
            ><br />
            <FormatNumber
                data-upstream-index="2"
                type="currency"
                currency="EUR"
                :value="2000"
                lang="de"
            ></FormatNumber
            ><br />
            <FormatNumber
                data-upstream-index="3"
                type="currency"
                currency="RUB"
                :value="2000"
                lang="ru"
            ></FormatNumber
            ><br />
            <FormatNumber
                data-upstream-index="4"
                type="currency"
                currency="CNY"
                :value="2000"
                lang="zh-cn"
            ></FormatNumber>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Divider, FormatNumber, Input } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
const input0 = ref('1000');
</script>
