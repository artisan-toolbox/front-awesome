<template>
    <Language v-for="selector in [1, 2]" :key="selector" v-slot="{ locale, locales, setLocale }">
        <div :data-testid="`language-${selector}`">
            <output>{{ locale }}</output>
            <button
                v-for="choice in locales"
                :key="choice.locale"
                type="button"
                :aria-pressed="choice.locale === locale"
                @click="setLocale(choice.locale)"
            >
                {{ choice.label }}
            </button>
        </div>
    </Language>
    <p data-testid="localized-title">{{ t('front-awesome::printing.title') }}</p>
    <p data-testid="localized-number">{{ n(1234.5) }}</p>
    <p data-testid="localized-money">{{ n(1234.5, 'money') }}</p>
    <time data-testid="localized-date">{{ d(new Date('2026-11-10T12:00:00Z'), 'short') }}</time>
    <wa-copy-button tooltip="none" value="Localized copy action" />
</template>
<script setup lang="ts">
import Language from '../../../resources/js/preferences/Language.vue';
import '#front-awesome-webawesome/components/copy-button/copy-button.js';
import { useLocalization } from '../../../resources/js/localization/context';
const { t, n, d } = useLocalization();
</script>
