<template>
    <MaskedInput :mask="$maskTemplates.brazilian.cpf()" default-value="01234567890" label="CPF" />
    <MaskedInput :mask="postalCodeMask" default-value="01310100" label="Postal code" />
</template>

<script lang="ts">
import { MaskedInput } from '@artisan-toolbox/front-awesome';
import { defineComponent } from 'vue';

export default defineComponent({
    components: { MaskedInput },
    computed: {
        postalCodeMask() {
            return this.$maskTemplates.brazilian.cep();
        },
    },
});
</script>
