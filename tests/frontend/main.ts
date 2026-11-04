import { createApp, h } from 'vue';
import Button from '@artisan-toolbox/front-awesome/components/Button.vue';
import './app.css';
import '@artisan-toolbox/front-awesome/web-awesome.css';

createApp({ render: () => h(Button, {}, () => 'Save changes') }).mount('#app');
