import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, test } from 'vite-plus/test';
import Icon from '@artisan-toolbox/front-awesome/components/WebAwesome/Icon.vue';
import LegacyIcon from '@artisan-toolbox/front-awesome/components/Icon.vue';
import { Icon as ComponentIcon } from '@artisan-toolbox/front-awesome/components';
import { Icon as WebAwesomeIcon } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import BareBooleanIcon from './BareBooleanIcon.vue';

test('exports the same Icon through the supported component paths', () => {
    expect(LegacyIcon).toBe(Icon);
    expect(ComponentIcon).toBe(Icon);
    expect(WebAwesomeIcon).toBe(Icon);
});

test('renders one unstyled icon during SSR without registering browser code', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(Icon) }));
    expect(html).toBe('<wa-icon></wa-icon>');
});

test('forwards native icon options and consumer attributes during SSR', async () => {
    const html = await renderToString(
        createSSRApp({
            render: () =>
                h(Icon, {
                    name: 'house',
                    src: '/icons/fallback.svg',
                    library: 'custom',
                    family: 'hand-drawn',
                    variant: 'outline',
                    canvas: 'roomy',
                    rotate: 45,
                    flip: 'both',
                    animation: 'spin',
                    label: 'Home',
                    autoWidth: false,
                    swapOpacity: true,
                    slot: 'start',
                    class: 'caller-icon',
                    style: { color: 'purple', fontSize: '24px' },
                    'data-purpose': 'navigation',
                }),
        }),
    );
    for (const attribute of [
        'name="house"',
        'src="/icons/fallback.svg"',
        'library="custom"',
        'family="hand-drawn"',
        'variant="outline"',
        'canvas="roomy"',
        'rotate="45"',
        'flip="both"',
        'animation="spin"',
        'label="Home"',
        'swap-opacity',
        'slot="start"',
        'class="caller-icon"',
        'color:purple',
        'font-size:24px',
        'data-purpose="navigation"',
    ])
        expect(html).toContain(attribute);
    expect(html).not.toContain('auto-width');
});

test('preserves bare and bound kebab-case boolean attributes during SSR', async () => {
    const bare = await renderToString(createSSRApp(BareBooleanIcon));
    expect(bare).toBe('<wa-icon auto-width swap-opacity></wa-icon>');
    const bound = await renderToString(
        createSSRApp({
            render: () => h(Icon, { 'auto-width': true, 'swap-opacity': false }),
        }),
    );
    expect(bound).toBe('<wa-icon auto-width></wa-icon>');
});
