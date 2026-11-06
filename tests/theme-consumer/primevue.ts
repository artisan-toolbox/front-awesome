import './main';
import { createApp, h } from 'vue';
import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { frontAwesomePrimeVueTheme } from '@artisan-toolbox/front-awesome/primevue';
createApp({
    render: () => [
        h(Button, { id: 'prime-button', label: 'Prime button' }),
        h(InputText, { id: 'prime-input', placeholder: 'Prime input' }),
        h(Select, {
            id: 'prime-select',
            options: ['English', 'Portuguese'],
            placeholder: 'Select a language',
        }),
    ],
})
    .use(PrimeVue, { theme: frontAwesomePrimeVueTheme })
    .mount('#prime');
