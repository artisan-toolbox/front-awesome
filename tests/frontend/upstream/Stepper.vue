<template>
    <div>
        <template v-if="scenario === 'stepper-1'">
            <Stepper data-upstream-index="0" active="shipping">
                <Step data-upstream-index="1" name="cart" completed>Cart</Step>
                <Step data-upstream-index="2" name="shipping">Shipping</Step>
                <Step data-upstream-index="3" name="payment">Payment</Step>
            </Stepper>
        </template>
        <template v-if="scenario === 'stepper-2'">
            <Stepper data-upstream-index="0" active="shipping" clickable>
                <Step data-upstream-index="1" name="cart" completed>Cart</Step>
                <Step data-upstream-index="2" name="shipping">Shipping</Step>
                <Step data-upstream-index="3" name="payment">Payment</Step>
            </Stepper>
        </template>
        <template v-if="scenario === 'stepper-3'">
            <Stepper data-upstream-index="0" active="shipping" linear clickable>
                <Step data-upstream-index="1" name="cart" completed>Cart</Step>
                <Step data-upstream-index="2" name="shipping">Shipping</Step>
                <Step data-upstream-index="3" name="payment">Payment</Step>
            </Stepper>
        </template>
        <template v-if="scenario === 'stepper-4'">
            <Stepper data-upstream-index="0" orientation="vertical" active="proof">
                <Step data-upstream-index="1" name="mix" completed>Mix</Step>
                <Step data-upstream-index="2" name="knead" completed>Knead</Step>
                <Step data-upstream-index="3" name="proof">
                    Proof
                    <span slot="description">Let it rise. Resist poking it.</span>
                </Step>
                <Step data-upstream-index="4" name="bake">Bake</Step>
            </Stepper>
        </template>
        <template v-if="scenario === 'stepper-5'">
            <Stepper
                data-upstream-index="0"
                orientation="vertical"
                active="proof"
                style="--gap: var(--wa-space-3xl)"
            >
                <Step data-upstream-index="1" name="mix" completed>Mix</Step>
                <Step data-upstream-index="2" name="knead" completed>Knead</Step>
                <Step data-upstream-index="3" name="proof">
                    Proof
                    <span slot="description">Let it rise. Resist poking it.</span>
                </Step>
                <Step data-upstream-index="4" name="bake">Bake</Step>
            </Stepper>
        </template>
        <template v-if="scenario === 'stepper-6'">
            <Stepper data-upstream-index="0" orientation="auto" active="team">
                <Step data-upstream-index="1" name="account" completed>Account</Step>
                <Step data-upstream-index="2" name="profile" completed>Profile</Step>
                <Step data-upstream-index="3" name="team">Team</Step>
                <Step data-upstream-index="4" name="notifications">Notifications</Step>
            </Stepper>
        </template>
        <template v-if="scenario === 'stepper-7'">
            <Stepper data-upstream-index="0" active="current">
                <Step data-upstream-index="1" name="current">Current</Step>
                <Step data-upstream-index="2" name="success" variant="success">Success</Step>
                <Step data-upstream-index="3" name="warning" variant="warning">Warning</Step>
                <Step data-upstream-index="4" name="danger" variant="danger">Danger</Step>
            </Stepper>
        </template>
        <template v-if="scenario === 'stepper-8'">
            <Stepper data-upstream-index="0" active="payment">
                <Step data-upstream-index="1" name="cart" completed variant="success">Cart</Step>
                <Step data-upstream-index="2" name="shipping" completed variant="success"
                    >Shipping</Step
                >
                <Step data-upstream-index="3" name="payment" variant="danger">
                    <Icon
                        data-upstream-index="4"
                        slot="icon"
                        name="xmark"
                        library="system"
                        variant="solid"
                    ></Icon>
                    Payment
                    <span slot="description">Card declined</span>
                </Step>
            </Stepper>
        </template>
        <template v-if="scenario === 'stepper-9'">
            <div class="wa-stack wa-gap-l">
                <Stepper
                    data-upstream-index="0"
                    class="size-stepper"
                    active="shipping"
                    style="font-size: var(--wa-font-size-xs)"
                >
                    <Step data-upstream-index="1" name="cart" completed>Cart</Step>
                    <Step data-upstream-index="2" name="shipping">Shipping</Step>
                    <Step data-upstream-index="3" name="payment">Payment</Step>
                </Stepper>
                <Stepper
                    data-upstream-index="4"
                    class="size-stepper"
                    active="shipping"
                    style="font-size: var(--wa-font-size-s)"
                >
                    <Step data-upstream-index="5" name="cart" completed>Cart</Step>
                    <Step data-upstream-index="6" name="shipping">Shipping</Step>
                    <Step data-upstream-index="7" name="payment">Payment</Step>
                </Stepper>
                <Stepper
                    data-upstream-index="8"
                    class="size-stepper"
                    active="shipping"
                    style="font-size: var(--wa-font-size-m)"
                >
                    <Step data-upstream-index="9" name="cart" completed>Cart</Step>
                    <Step data-upstream-index="10" name="shipping">Shipping</Step>
                    <Step data-upstream-index="11" name="payment">Payment</Step>
                </Stepper>
                <Stepper
                    data-upstream-index="12"
                    class="size-stepper"
                    active="shipping"
                    style="font-size: var(--wa-font-size-l)"
                >
                    <Step data-upstream-index="13" name="cart" completed>Cart</Step>
                    <Step data-upstream-index="14" name="shipping">Shipping</Step>
                    <Step data-upstream-index="15" name="payment">Payment</Step>
                </Stepper>
                <Stepper
                    data-upstream-index="16"
                    class="size-stepper"
                    active="shipping"
                    style="font-size: var(--wa-font-size-xl)"
                >
                    <Step data-upstream-index="17" name="cart" completed>Cart</Step>
                    <Step data-upstream-index="18" name="shipping">Shipping</Step>
                    <Step data-upstream-index="19" name="payment">Payment</Step>
                </Stepper>
            </div>
        </template>
        <template v-if="scenario === 'stepper-10'">
            <div class="wa-stack">
                <Stepper data-upstream-index="0" active="verify">
                    <Step data-upstream-index="1" name="account" completed>Create account</Step>
                    <Step data-upstream-index="2" name="verify" attention="pulse"
                        >Verify email</Step
                    >
                    <Step data-upstream-index="3" name="profile">Set up profile</Step>
                </Stepper>

                <Stepper data-upstream-index="4" active="verify">
                    <Step data-upstream-index="5" name="account" completed>Create account</Step>
                    <Step data-upstream-index="6" name="verify" attention="bounce"
                        >Verify email</Step
                    >
                    <Step data-upstream-index="7" name="profile">Set up profile</Step>
                </Stepper>
            </div>
        </template>
        <template v-if="scenario === 'stepper-11'">
            <Stepper data-upstream-index="0" active="shipping">
                <Step data-upstream-index="1" name="cart" completed>
                    Cart
                    <span slot="description">3 items</span>
                </Step>
                <Step data-upstream-index="2" name="shipping">
                    Shipping
                    <span slot="description">Enter your address</span>
                </Step>
                <Step data-upstream-index="3" name="payment">
                    Payment
                    <span slot="description">Add a card</span>
                </Step>
            </Stepper>
        </template>
        <template v-if="scenario === 'stepper-12'">
            <Stepper data-upstream-index="0" active="shipped">
                <Step data-upstream-index="1" name="ordered" completed>
                    <Icon data-upstream-index="2" slot="icon" name="bag-shopping"></Icon>
                    Ordered
                    <span slot="description">Monday</span>
                </Step>
                <Step data-upstream-index="3" name="shipped">
                    <Icon data-upstream-index="4" slot="icon" name="truck"></Icon>
                    Shipped
                    <span slot="description">Left the warehouse</span>
                </Step>
                <Step data-upstream-index="5" name="delivered">
                    <Icon data-upstream-index="6" slot="icon" name="house"></Icon>
                    Delivered
                    <span slot="description">Thursday, probably</span>
                </Step>
            </Stepper>
        </template>
        <template v-if="scenario === 'stepper-13'">
            <Stepper data-upstream-index="0" active="steep">
                <Step data-upstream-index="1" name="boil" completed>Boil the kettle</Step>
                <Step data-upstream-index="2" name="warm" completed>Warm the pot</Step>
                <Step data-upstream-index="3" name="steep" loading>
                    Steep
                    <span slot="description">Four minutes for a proper cuppa</span>
                </Step>
                <Step data-upstream-index="4" name="pour">Pour</Step>
            </Stepper>
        </template>
        <template v-if="scenario === 'stepper-14'">
            <Stepper data-upstream-index="0" active="cart">
                <Step data-upstream-index="1" name="cart">Cart</Step>
                <Step data-upstream-index="2" name="shipping">Shipping</Step>
                <Step data-upstream-index="3" name="gift-wrap" disabled>Gift Wrap</Step>
                <Step data-upstream-index="4" name="payment">Payment</Step>
            </Stepper>
        </template>
        <template v-if="scenario === 'stepper-15'">
            <div class="stepper-declarative-demo">
                <Stepper data-upstream-index="0" id="stepper-declarative" active="cart">
                    <Step data-upstream-index="1" name="cart" completed>Cart</Step>
                    <Step data-upstream-index="2" name="shipping">Shipping</Step>
                    <Step data-upstream-index="3" name="payment">Payment</Step>
                </Stepper>

                <Divider data-upstream-index="4"></Divider>

                <div class="wa-cluster">
                    <Button
                        data-upstream-index="5"
                        appearance="filled"
                        data-stepper="previous stepper-declarative"
                        >Back</Button
                    >
                    <Button
                        data-upstream-index="6"
                        appearance="filled"
                        data-stepper="next stepper-declarative"
                        >Continue</Button
                    >
                    <Button
                        data-upstream-index="7"
                        appearance="filled"
                        data-stepper="goto stepper-declarative payment"
                        >Skip to Payment</Button
                    >
                </div>
            </div>
        </template>
        <template v-if="scenario === 'stepper-16'">
            <div class="stepper-events-demo">
                <Stepper data-upstream-index="0" id="stepper-events" active="cart">
                    <Step data-upstream-index="1" name="cart" completed>Cart</Step>
                    <Step data-upstream-index="2" name="shipping">Shipping</Step>
                    <Step data-upstream-index="3" name="payment">Payment</Step>
                </Stepper>

                <Divider data-upstream-index="4"></Divider>

                <div class="wa-cluster wa-align-items-center">
                    <Button
                        data-upstream-index="5"
                        appearance="filled"
                        data-stepper="previous stepper-events"
                        >Back</Button
                    >
                    <Button
                        data-upstream-index="6"
                        appearance="filled"
                        data-stepper="next stepper-events"
                        >Continue</Button
                    >
                    <small>Active step: <span id="stepper-events-output">cart</span></small>
                </div>
            </div>
        </template>
        <template v-if="scenario === 'stepper-17'">
            <div class="stepper-content-demo wa-stack">
                <Stepper data-upstream-index="0" id="stepper-content" active="cart">
                    <Step data-upstream-index="1" name="cart">Cart</Step>
                    <Step data-upstream-index="2" name="shipping">Shipping</Step>
                    <Step data-upstream-index="3" name="payment">Payment</Step>
                </Stepper>

                <p data-step="cart">Review the items in your cart.</p>
                <p data-step="shipping" hidden>Enter the address to ship to.</p>
                <p data-step="payment" hidden>Add a card to pay with.</p>

                <Divider data-upstream-index="4"></Divider>

                <div class="wa-cluster">
                    <Button
                        data-upstream-index="5"
                        appearance="filled"
                        data-stepper="previous stepper-content"
                        >Back</Button
                    >
                    <Button
                        data-upstream-index="6"
                        appearance="filled"
                        data-stepper="next stepper-content"
                        >Continue</Button
                    >
                </div>
            </div>
        </template>
        <template v-if="scenario === 'stepper-18'">
            <div class="stepper-guard-demo">
                <Stepper data-upstream-index="0" id="stepper-guard" active="shipping">
                    <Step data-upstream-index="1" name="cart" completed>Cart</Step>
                    <Step data-upstream-index="2" name="shipping">Shipping</Step>
                    <Step data-upstream-index="3" name="payment">Payment</Step>
                </Stepper>

                <Divider data-upstream-index="4"></Divider>

                <div class="wa-cluster wa-align-items-center">
                    <Switch data-upstream-index="5" id="stepper-guard-unsaved" checked
                        >Unsaved changes</Switch
                    >
                    <Button
                        data-upstream-index="6"
                        appearance="filled"
                        data-stepper="next stepper-guard"
                        >Continue</Button
                    >
                    <small id="stepper-guard-output"></small>
                </div>
            </div>
        </template>
        <template v-if="scenario === 'stepper-19'">
            <Stepper data-upstream-index="0" class="custom-stepper" active="shipping">
                <Step data-upstream-index="1" name="cart" completed variant="success">Cart</Step>
                <Step data-upstream-index="2" name="shipping">Shipping</Step>
                <Step data-upstream-index="3" name="payment">Payment</Step>
            </Stepper>
        </template>
        <template v-if="scenario === 'stepper-20'">
            <Stepper
                data-upstream-index="0"
                class="tube-stepper"
                label="Piccadilly line"
                orientation="auto"
                active="green-park"
            >
                <Step data-upstream-index="1" name="heathrow" completed>Heathrow</Step>
                <Step data-upstream-index="2" name="earls-court" completed>
                    Earl's Court
                    <span slot="description">District line</span>
                </Step>
                <Step data-upstream-index="3" name="knightsbridge" completed>Knightsbridge</Step>
                <Step data-upstream-index="4" name="green-park" attention="pulse">
                    Green Park
                    <span slot="description">Victoria and Jubilee lines</span>
                </Step>
                <Step data-upstream-index="5" name="kings-cross">King's Cross</Step>
            </Stepper>
        </template>
        <template v-if="scenario === 'stepper-21'">
            <Stepper
                data-upstream-index="0"
                class="uneven-stepper"
                orientation="auto"
                active="mordor"
            >
                <Step data-upstream-index="1" name="shire" completed>The Shire</Step>
                <Step data-upstream-index="2" name="rivendell" completed>Rivendell</Step>
                <Step data-upstream-index="3" name="moria" completed>Moria</Step>
                <Step data-upstream-index="4" name="mordor">
                    Mount Doom
                    <span slot="description">One does not simply walk into Mordor</span>
                </Step>
            </Stepper>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Divider,
    Icon,
    Step,
    Stepper,
    Switch,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
