import './app.css';
import '@artisan-toolbox/front-awesome/web-awesome-tailwind';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/page/page.js';
import { createApp, h } from 'vue';
import { createFrontAwesome } from '@artisan-toolbox/front-awesome';

createApp({ render: () => h('p', { id: 'native-text' }, 'Readable native text') })
    .use(createFrontAwesome({ theme: true }))
    .mount('#app');
