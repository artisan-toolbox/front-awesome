<template>
    <component
        :is="'fa-form-field-frame'"
        :slot="nativeSlot"
        :class="
            active
                ? [
                      'fa-form-field-frame',
                      `fa-form-field-frame--${layout}`,
                      { 'fa-form-field-frame--invalid': invalid },
                  ]
                : 'fa-form-field-frame-inactive'
        "
        :role="active ? 'group' : undefined"
        :aria-label="active ? label : undefined"
        :aria-describedby="active && errors.length ? messageId : undefined"
    >
        <slot />
        <span
            v-if="active"
            v-show="errors.length"
            :id="messageId"
            class="fa-form-error"
            role="alert"
            aria-atomic="true"
        >
            <span v-for="(message, index) in errors" :key="index" class="fa-form-error-message">{{
                message
            }}</span>
        </span>
    </component>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
defineProps<{
    active: boolean;
    invalid: boolean;
    errors: readonly string[];
    messageId: string;
    layout: 'intrinsic' | 'block';
    label?: string;
    nativeSlot?: string;
}>();
</script>
