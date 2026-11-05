import { createInertiaApp } from '@inertiajs/vue3';
import { defineComponent, h } from 'vue';
import { createFrontAwesome } from '@artisan-toolbox/front-awesome';
import Fixture from './Fixture.vue';
import './app.css';
import '@artisan-toolbox/front-awesome/web-awesome.css';

void createInertiaApp({
    page: {
        component: 'Fixture',
        props: { errors: {} },
        url: '/',
        version: null,
        rescuedProps: [],
        rememberedState: {},
        flash: {
            'front-awesome.toasts': [
                { message: 'Initial flash.', options: { duration: 0, icon: 'circle-info' } },
            ],
        },
    },
    resolve: () => defineComponent({ render: () => h(Fixture) }),
    withApp(app) {
        app.use(createFrontAwesome({ theme: true }));
    },
});
