import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, test } from 'vite-plus/test';
import Tooltip from '@artisan-toolbox/front-awesome/components/WebAwesome/Tooltip.vue';
import LegacyTooltip from '@artisan-toolbox/front-awesome/components/Tooltip.vue';
import { Tooltip as ComponentTooltip } from '@artisan-toolbox/front-awesome/components';
import { Tooltip as WebAwesomeTooltip } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import BareBooleanTooltip from './BareBooleanTooltip.vue';

test('exports the same Tooltip through every supported component path', () => {
    expect(LegacyTooltip).toBe(Tooltip);
    expect(ComponentTooltip).toBe(Tooltip);
    expect(WebAwesomeTooltip).toBe(Tooltip);
});

test('renders an unstyled tooltip with default body content and no delay defaults during SSR', async () => {
    const html = await renderToString(
        createSSRApp({ render: () => h(Tooltip, null, () => 'Help') }),
    );
    expect(html).toBe('<wa-tooltip><!--[-->Help<!--]--></wa-tooltip>');
});

test('preserves bare booleans and camel-case and kebab-case aliases during SSR', async () => {
    expect(await renderToString(createSSRApp(BareBooleanTooltip))).toBe(
        '<wa-tooltip disabled open without-arrow><!--[--><!--]--></wa-tooltip>',
    );
    for (const aliases of [
        { withoutArrow: true, showDelay: 0, hideDelay: 25 },
        { 'without-arrow': true, 'show-delay': 0, 'hide-delay': 25 },
    ]) {
        const html = await renderToString(
            createSSRApp({
                render: () => h(Tooltip, { disabled: false, open: false, ...aliases }),
            }),
        );
        expect(html).toContain('without-arrow');
        expect(html).toContain('show-delay="0"');
        expect(html).toContain('hide-delay="25"');
        expect(html).not.toContain('disabled');
        expect(html).not.toContain(' open');
        expect(html).not.toContain('showdelay');
    }
    const html = await renderToString(
        createSSRApp({
            render: () =>
                h(Tooltip, {
                    for: 'help-target',
                    placement: 'bottom-start',
                    distance: 12,
                    skidding: -3,
                    trigger: 'manual',
                    withoutArrow: false,
                    slot: 'help',
                    class: 'caller-tooltip',
                    style: { '--max-width': '15rem' },
                    'data-purpose': 'help',
                }),
        }),
    );
    for (const attribute of [
        'for="help-target"',
        'placement="bottom-start"',
        'distance="12"',
        'skidding="-3"',
        'trigger="manual"',
        'slot="help"',
        'class="caller-tooltip"',
        '--max-width:15rem',
        'data-purpose="help"',
    ])
        expect(html).toContain(attribute);
    expect(html).not.toContain('without-arrow');
});
