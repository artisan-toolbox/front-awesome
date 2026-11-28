import './app.css';
import '@artisan-toolbox/front-awesome/web-awesome-tailwind';
import '#front-awesome-webawesome/components/button/button.js';
import '#front-awesome-webawesome/components/badge/badge.js';
import '#front-awesome-webawesome/components/breadcrumb-item/breadcrumb-item.js';
import '#front-awesome-webawesome/components/callout/callout.js';
import '#front-awesome-webawesome/components/card/card.js';
import '#front-awesome-webawesome/components/details/details.js';
import '#front-awesome-webawesome/components/dialog/dialog.js';
import '#front-awesome-webawesome/components/input/input.js';
import '#front-awesome-webawesome/components/page/page.js';
import '#front-awesome-webawesome/components/select/select.js';
import { createApp, h, resolveDirective, withDirectives } from 'vue';
import { createFrontAwesome } from '@artisan-toolbox/front-awesome';
import Tag from '@artisan-toolbox/front-awesome/components/Tag.vue';
import Icon from '@artisan-toolbox/front-awesome/components/Icon.vue';

const iconSource = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M2 8h12M8 2v12" stroke="currentColor"/></svg>')}`;

createApp({
    render: () => [
        h('p', { id: 'native-text' }, 'Readable native text'),
        withDirectives(
            h(
                'section',
                {
                    id: 'theme-scrollbar',
                    'aria-label': 'Theme scroll activity',
                    tabindex: 0,
                },
                [h('div', { style: 'height: 240px; min-width: 1200px' }, 'Notification history')],
            ),
            [[resolveDirective('scrollbar'), undefined, undefined, { brand: true }]],
        ),
        ...['native', 'wrapper'].flatMap((kind) =>
            ['', 'p-0 border-0', 'p-4 border-4'].map((classes, index) => {
                const content = () =>
                    h('span', { class: 'inline-flex items-center gap-1 leading-none' }, [
                        h(kind === 'native' ? 'wa-icon' : Icon, { src: iconSource }),
                        h('span', 'Package status'),
                    ]);
                const props = { id: `tag-${kind}-${index}`, size: 's', class: classes };
                return kind === 'native'
                    ? h('wa-tag', props, content())
                    : h(Tag, props, { default: content });
            }),
        ),
    ],
})
    .use(createFrontAwesome({ appearance: true }))
    .mount('#app');
