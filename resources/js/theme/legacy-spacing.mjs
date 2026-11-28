import plugin from 'tailwindcss/plugin';
import { spacingHostSelector, utilitySpacing } from './spacing.mjs';

const nativeChildren =
    ':where(a, address, article, aside, blockquote, button, dd, details, div, dl, dt, fieldset, figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hgroup, img, input, label, li, main, nav, ol, output, p, picture, pre, section, select, small, span, summary, table, textarea, time, ul)';

export default plugin((api) => {
    if (api.theme('--spacing') === utilitySpacing) return;

    api.addBase({
        [`${spacingHostSelector} > ${nativeChildren}`]: {
            '--spacing': 'var(--fa-slotted-spacing)',
        },
        'wa-card[orientation="horizontal"]': {
            '--fa-card-actions-spacing': 'var(--spacing)',
        },
        [`:where(wa-card[orientation="horizontal"]) > [slot="actions"]${nativeChildren}`]: {
            padding: 'var(--fa-card-actions-spacing)',
        },
    });
});
