<template>
    <div>
        <template v-if="scenario === 'otp-input-1'">
            <OtpInput data-upstream-index="0" label="Verification code"></OtpInput>
        </template>
        <template v-if="scenario === 'otp-input-2'">
            <OtpInput data-upstream-index="0" label="Security code"></OtpInput>
        </template>
        <template v-if="scenario === 'otp-input-3'">
            <OtpInput
                data-upstream-index="0"
                label="Sign-in code"
                hint="Check your email for a 6-digit code."
            ></OtpInput>
        </template>
        <template v-if="scenario === 'otp-input-4'">
            <div class="wa-stack">
                <OtpInput data-upstream-index="0" label="Card PIN" :length="4"></OtpInput>
                <OtpInput data-upstream-index="1" label="Backup code" :length="8"></OtpInput>
            </div>
        </template>
        <template v-if="scenario === 'otp-input-5'">
            <div class="wa-stack">
                <OtpInput data-upstream-index="0" label="Numeric" type="numeric"></OtpInput>
                <OtpInput data-upstream-index="1" label="Alpha" type="alpha"></OtpInput>
                <OtpInput
                    data-upstream-index="2"
                    label="Alphanumeric"
                    type="alphanumeric"
                ></OtpInput>
            </div>
        </template>
        <template v-if="scenario === 'otp-input-6'">
            <div class="wa-stack">
                <!-- Two groups of three with a space: e.g. "ABC DEF" -->
                <OtpInput
                    data-upstream-index="0"
                    label="Invite code"
                    type="alphanumeric"
                    format="### ###"
                ></OtpInput>
                <!-- Three groups of four joined by dashes: e.g. "1234-5678-9012" -->
                <OtpInput
                    data-upstream-index="1"
                    label="License key"
                    type="alphanumeric"
                    format="####-####-####"
                ></OtpInput>
            </div>
        </template>
        <template v-if="scenario === 'otp-input-7'">
            <div class="wa-stack">
                <OtpInput
                    data-upstream-index="0"
                    label="Upper"
                    type="alpha"
                    case="upper"
                ></OtpInput>
                <OtpInput
                    data-upstream-index="1"
                    label="Lower"
                    type="alpha"
                    case="lower"
                ></OtpInput>
            </div>
        </template>
        <template v-if="scenario === 'otp-input-8'">
            <OtpInput data-upstream-index="0" label="PIN" mask :length="4"></OtpInput>
        </template>
        <template v-if="scenario === 'otp-input-9'">
            <OtpInput data-upstream-index="0" label="PIN" mask with-mask :length="4"></OtpInput>
        </template>
        <template v-if="scenario === 'otp-input-10'">
            <OtpInput
                data-upstream-index="0"
                id="custom-mask-char"
                label="PIN"
                mask
                with-mask
                :length="4"
            ></OtpInput>
        </template>
        <template v-if="scenario === 'otp-input-11'">
            <div class="wa-stack">
                <OtpInput data-upstream-index="0" label="Outlined" appearance="outlined"></OtpInput>
                <OtpInput data-upstream-index="1" label="Filled" appearance="filled"></OtpInput>
                <OtpInput
                    data-upstream-index="2"
                    label="Filled outlined"
                    appearance="filled-outlined"
                ></OtpInput>
                <OtpInput
                    data-upstream-index="3"
                    label="Contained"
                    appearance="contained"
                ></OtpInput>
            </div>
        </template>
        <template v-if="scenario === 'otp-input-12'">
            <div class="wa-stack">
                <OtpInput data-upstream-index="0" label="Extra small" size="xs"></OtpInput>
                <OtpInput data-upstream-index="1" label="Small" size="s"></OtpInput>
                <OtpInput data-upstream-index="2" label="Medium" size="m"></OtpInput>
                <OtpInput data-upstream-index="3" label="Large" size="l"></OtpInput>
                <OtpInput data-upstream-index="4" label="Extra large" size="xl"></OtpInput>
            </div>
        </template>
        <template v-if="scenario === 'otp-input-13'">
            <OtpInput
                data-upstream-index="0"
                label="Verification code"
                disabled
                value="391824"
            ></OtpInput>
        </template>
        <template v-if="scenario === 'otp-input-14'">
            <OtpInput
                data-upstream-index="0"
                label="Confirmation code"
                readonly
                value="483920"
            ></OtpInput>
        </template>
        <template v-if="scenario === 'otp-input-15'">
            <OtpInput data-upstream-index="0" label="Magic link code" value="271828"></OtpInput>
        </template>
        <template v-if="scenario === 'otp-input-16'">
            <CopyButton data-upstream-index="0" value="314159">
                <Button data-upstream-index="1" appearance="filled">
                    <Icon data-upstream-index="2" slot="start" name="clipboard"></Icon>
                    Copy code: 314159
                </Button>
            </CopyButton>

            <Divider data-upstream-index="3"></Divider>

            <OtpInput data-upstream-index="4" label="Paste your code below"></OtpInput>
        </template>
        <template v-if="scenario === 'otp-input-17'">
            <OtpInput data-upstream-index="0" id="sms-code" label="Verification code"></OtpInput>
        </template>
        <template v-if="scenario === 'otp-input-18'">
            <form class="autosubmit">
                <OtpInput
                    data-upstream-index="0"
                    name="code"
                    label="SMS verification code"
                    autosubmit
                ></OtpInput>
            </form>
        </template>
        <template v-if="scenario === 'otp-input-19'">
            <form class="validation">
                <OtpInput
                    data-upstream-index="0"
                    name="code"
                    label="Two-factor code"
                    required
                ></OtpInput>
                <br />
                <Button data-upstream-index="1" appearance="filled" type="submit">Continue</Button>
            </form>
        </template>
        <template v-if="scenario === 'otp-input-20'">
            <form class="custom-validity">
                <OtpInput
                    data-upstream-index="0"
                    name="code"
                    label="Verification code"
                    hint="The correct code is 314159."
                    required
                ></OtpInput>
                <br />
                <Button data-upstream-index="1" appearance="filled" type="submit">Verify</Button>
            </form>
        </template>
        <template v-if="scenario === 'otp-input-21'">
            <OtpInput
                data-upstream-index="0"
                id="styled-otp"
                label="Card PIN"
                :length="4"
            ></OtpInput>
        </template>
        <template v-if="scenario === 'otp-input-22'">
            <OtpInput
                data-upstream-index="0"
                class="stateful-otp"
                label="Two-factor code"
                required
            ></OtpInput>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    CopyButton,
    Divider,
    Icon,
    OtpInput,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
