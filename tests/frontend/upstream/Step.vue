<template>
    <div>
        <template v-if="scenario === 'step-1'">
            <Stepper data-upstream-index="0" active="shipping">
                <Step data-upstream-index="1" name="cart" completed>Cart</Step>
                <Step data-upstream-index="2" name="shipping" data-anatomy-subject="true">
                    Shipping
                    <span slot="description">Enter your address</span>
                </Step>
                <Step data-upstream-index="3" name="payment">Payment</Step>
            </Stepper>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Step, Stepper } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
