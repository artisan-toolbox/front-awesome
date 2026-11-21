import { createSSRApp, h, resolveDirective, withDirectives } from 'vue';
import type { DirectiveModifiers } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, test } from 'vite-plus/test';
import { createFrontAwesome, type ScrollbarPluginOptions } from '@artisan-toolbox/front-awesome';

function renderScrollbar(
    name: string,
    value: unknown,
    modifiers: DirectiveModifiers = {},
    scrollbar?: ScrollbarPluginOptions,
) {
    const app = createSSRApp({
        render: () =>
            withDirectives(
                h('section', { 'aria-label': 'Notifications', tabindex: 0 }, 'Recent messages'),
                [[resolveDirective(name), value, undefined, modifiers]],
            ),
    }).use(createFrontAwesome({ scrollbar }));

    return renderToString(app);
}

function expectedMarkup(variant: string) {
    return `<section aria-label="Notifications" tabindex="0" data-fa-scrollbar="${variant}">Recent messages</section>`;
}

test.each([
    [undefined, 'neutral'],
    ['neutral', 'neutral'],
    ['brand', 'brand'],
    ['success', 'success'],
    ['warning', 'warning'],
    ['danger', 'danger'],
    ['unknown', 'neutral'],
])('renders the scrollbar modifier %s during SSR', async (modifier, variant) => {
    const modifiers = modifier ? { [modifier]: true } : undefined;
    const options = { scrollbars: { visibility: 'hidden' } };

    expect(await renderScrollbar('scrollbar', options, modifiers)).toBe(expectedMarkup(variant));
});

test('uses each app default for a bare directive and lets explicit modifiers override it', async () => {
    const brand = { defaultVariant: 'brand' } satisfies ScrollbarPluginOptions;
    const results = await Promise.all([
        renderScrollbar('scrollbar', { scrollbars: { autoHide: 'leave' } }, {}, brand),
        renderScrollbar('scrollbar', undefined, {}, { defaultVariant: 'danger' }),
        renderScrollbar('scrollbar', undefined),
        renderScrollbar('scrollbar', undefined, { neutral: true }, brand),
    ]);

    expect(results).toEqual(['brand', 'danger', 'neutral', 'neutral'].map(expectedMarkup));
});

test('renders the original scroll target when edge shadows are enabled during SSR', async () => {
    expect(await renderScrollbar('scrollbar', { shadows: true })).toBe(expectedMarkup('neutral'));
});

test.each([
    [undefined, 'neutral'],
    ['brand', 'brand'],
    ['unknown', 'neutral'],
])('keeps the legacy scrollbar value %s during SSR', async (value, variant) => {
    expect(await renderScrollbar('fa-scrollbar', value)).toBe(expectedMarkup(variant));
});
