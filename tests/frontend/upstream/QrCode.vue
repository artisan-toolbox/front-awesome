<template>
    <div>
        <template v-if="scenario === 'qr-code-1'">
            <QrCode
                data-upstream-index="0"
                value="https://webawesome.com/"
                label="Scan to visit Web Awesome"
            ></QrCode>
        </template>
        <template v-if="scenario === 'qr-code-2'">
            <QrCode data-upstream-index="0" value="https://webawesome.com/" :size="64"></QrCode>
        </template>
        <template v-if="scenario === 'qr-code-3'">
            <QrCode
                data-upstream-index="0"
                value="https://webawesome.com/"
                style="
                    color: var(--wa-color-indigo-20);
                    background-color: var(--wa-color-indigo-90);
                    border-radius: var(--wa-border-radius-m);
                    padding: 1rem;
                "
            ></QrCode>
        </template>
        <template v-if="scenario === 'qr-code-4'">
            <QrCode
                data-upstream-index="0"
                value="https://webawesome.com/"
                style="--corner-color: var(--wa-color-brand)"
            ></QrCode>
        </template>
        <template v-if="scenario === 'qr-code-5'">
            <QrCode data-upstream-index="0" value="https://webawesome.com/" :radius="0.5"></QrCode>
        </template>
        <template v-if="scenario === 'qr-code-6'">
            <div class="qr-error-correction">
                <QrCode
                    data-upstream-index="0"
                    value="https://webawesome.com/"
                    error-correction="L"
                ></QrCode>
                <QrCode
                    data-upstream-index="1"
                    value="https://webawesome.com/"
                    error-correction="M"
                ></QrCode>
                <QrCode
                    data-upstream-index="2"
                    value="https://webawesome.com/"
                    error-correction="Q"
                ></QrCode>
                <QrCode
                    data-upstream-index="3"
                    value="https://webawesome.com/"
                    error-correction="H"
                ></QrCode>
            </div>
        </template>
        <template v-if="scenario === 'qr-code-7'">
            <QrCode
                data-upstream-index="0"
                value="https://webawesome.com/"
                image="/assets/images/logos/wa-avatar4x.png"
            ></QrCode>
        </template>
        <template v-if="scenario === 'qr-code-8'">
            <div class="qr-ec-cover">
                <QrCode
                    data-upstream-index="0"
                    value="https://fontawesome.com/"
                    image="/assets/images/logos/fa-avatar4x.png"
                    :image-coverage="0.3"
                ></QrCode>
                <QrCode
                    data-upstream-index="1"
                    value="https://webawesome.com/"
                    image="/assets/images/logos/wa-avatar4x.png"
                    :image-coverage="0.6"
                ></QrCode>
                <QrCode
                    data-upstream-index="2"
                    value="https://build.awesome.me/"
                    image="/assets/images/logos/ba-avatar4x.png"
                    :image-coverage="0.9"
                ></QrCode>
            </div>
        </template>
        <template v-if="scenario === 'qr-code-9'">
            <div class="qr-generator">
                <QrCode
                    data-upstream-index="0"
                    value="https://webawesome.com/"
                    label="Scan this code to visit Web Awesome on the web!"
                ></QrCode>

                <Divider data-upstream-index="1"></Divider>

                <Input
                    data-upstream-index="2"
                    :maxlength="255"
                    with-clear
                    label="Value"
                    v-model="input0"
                >
                    <Icon data-upstream-index="3" slot="start" name="link"></Icon>
                </Input>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Divider, Icon, Input, QrCode } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
const input0 = ref('');
</script>
