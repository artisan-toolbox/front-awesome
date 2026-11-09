import './main';
import { createApp, h } from 'vue';
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { frontAwesomePrimeVueTheme } from '@artisan-toolbox/front-awesome/primevue';
const paletteHues = Object.entries(Aura.primitive)
    .filter(([, value]) => Object.hasOwn(value, 500))
    .map(([hue]) => hue);

createApp({
    render: () => [
        h(Button, { id: 'prime-button', label: 'Prime button' }),
        ...['success', 'warn', 'danger', 'info', 'help', 'secondary'].map((severity) =>
            h(Button, { id: `prime-${severity}`, severity, label: severity }),
        ),
        h(Tag, { id: 'prime-warn-tag', severity: 'warn', value: 'Warning' }),
        h(Badge, { id: 'prime-warn-badge', severity: 'warn', value: 'Warning' }),
        h(Message, { id: 'prime-warn-message', severity: 'warn' }, () => 'Warning'),
        ...paletteHues.map((hue) =>
            h(Button, {
                id: `prime-palette-${hue}`,
                label: hue,
                dt: { root: { primary: { background: `{${hue}.500}` } } },
            }),
        ),
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
